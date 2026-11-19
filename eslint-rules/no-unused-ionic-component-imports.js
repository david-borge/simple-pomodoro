const fs = require('fs');
const path = require('path');

function getPropertyName(property) {
    if (!property || property.computed || !property.key) {
        return null;
    }

    if (property.key.type === 'Identifier') {
        return property.key.name;
    }

    if (property.key.type === 'Literal') {
        return property.key.value;
    }

    return null;
}

function toKebabCase(value) {
    return value
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .toLowerCase();
}

function buildArrayText(arrayExpression, sourceCode, nextElements) {
    if (nextElements.length === 0) {
        return '[]';
    }

    const nextItems = nextElements.map((element) => sourceCode.getText(element).trim());

    if (arrayExpression.loc.start.line === arrayExpression.loc.end.line) {
        return `[${nextItems.join(', ')}]`;
    }

    const lineText = sourceCode.lines[arrayExpression.loc.start.line - 1] ?? '';
    const lineIndent = lineText.match(/^\s*/)?.[0] ?? '';
    const itemIndent = `${lineIndent}    `;
    const body = nextItems
        .map((item, index) => `${itemIndent}${item}${index < nextItems.length - 1 ? ',' : ''}`)
        .join('\n');

    return `[\n${body}\n${lineIndent}]`;
}

function getTemplateText(componentObject, filename) {
    const templateProperty = componentObject.properties.find(
        (property) => getPropertyName(property) === 'template',
    );
    if (
        templateProperty &&
        templateProperty.type === 'Property' &&
        templateProperty.value &&
        templateProperty.value.type === 'Literal' &&
        typeof templateProperty.value.value === 'string'
    ) {
        return templateProperty.value.value;
    }

    const templateUrlProperty = componentObject.properties.find(
        (property) => getPropertyName(property) === 'templateUrl',
    );
    if (
        !templateUrlProperty ||
        templateUrlProperty.type !== 'Property' ||
        !templateUrlProperty.value ||
        templateUrlProperty.value.type !== 'Literal' ||
        typeof templateUrlProperty.value.value !== 'string'
    ) {
        return null;
    }

    const templatePath = path.resolve(path.dirname(filename), templateUrlProperty.value.value);

    try {
        return fs.readFileSync(templatePath, 'utf8');
    } catch {
        return null;
    }
}

module.exports = {
    rules: {
        'no-unused-ionic-component-imports': {
            meta: {
                type: 'suggestion',
                docs: {
                    description:
                        'Remove unused Ionic standalone component imports from Angular component imports arrays.',
                },
                fixable: 'code',
                schema: [],
            },
            create(context) {
                const sourceCode = context.sourceCode ?? context.getSourceCode();
                const ionicImportMap = new Map();

                return {
                    Program(programNode) {
                        for (const node of programNode.body) {
                            if (
                                node.type !== 'ImportDeclaration' ||
                                (node.source.value !== '@ionic/angular' &&
                                    node.source.value !== '@ionic/angular/standalone')
                            ) {
                                continue;
                            }

                            for (const specifier of node.specifiers) {
                                if (specifier.type !== 'ImportSpecifier') {
                                    continue;
                                }

                                const importedName =
                                    specifier.imported.type === 'Identifier'
                                        ? specifier.imported.name
                                        : String(specifier.imported.value);

                                if (!importedName.startsWith('Ion')) {
                                    continue;
                                }

                                const tagName = toKebabCase(importedName);
                                ionicImportMap.set(specifier.local.name, tagName);
                            }
                        }
                    },
                    Property(node) {
                        if (
                            getPropertyName(node) !== 'imports' ||
                            node.value.type !== 'ArrayExpression'
                        ) {
                            return;
                        }

                        const componentObject = node.parent;
                        const callExpression = componentObject?.parent;
                        const decoratorExpression = callExpression?.parent;

                        const isComponentImportsProperty =
                            componentObject?.type === 'ObjectExpression' &&
                            callExpression?.type === 'CallExpression' &&
                            callExpression.callee?.type === 'Identifier' &&
                            callExpression.callee.name === 'Component' &&
                            decoratorExpression?.type === 'Decorator';

                        if (!isComponentImportsProperty) {
                            return;
                        }

                        const templateText = getTemplateText(componentObject, context.filename);
                        if (!templateText) {
                            return;
                        }

                        const usedTags = new Set();
                        const tagPattern = /<\s*([a-zA-Z][a-zA-Z0-9-]*)\b/g;
                        for (const match of templateText.matchAll(tagPattern)) {
                            usedTags.add(match[1].toLowerCase());
                        }

                        const removableElements = [];
                        for (const element of node.value.elements) {
                            if (!element || element.type !== 'Identifier') {
                                continue;
                            }

                            const tagName = ionicImportMap.get(element.name);
                            if (!tagName) {
                                continue;
                            }

                            if (!usedTags.has(tagName)) {
                                removableElements.push(element);
                            }
                        }

                        if (removableElements.length === 0) {
                            return;
                        }

                        const nextElements = node.value.elements.filter(
                            (element) => element && !removableElements.includes(element),
                        );
                        const removableNames = removableElements
                            .map((element) => element.name)
                            .join(', ');

                        context.report({
                            node: removableElements[0],
                            message: `Remove unused Ionic component imports from imports array: ${removableNames}.`,
                            fix(fixer) {
                                return fixer.replaceText(
                                    node.value,
                                    buildArrayText(node.value, sourceCode, nextElements),
                                );
                            },
                        });
                    },
                };
            },
        },
    },
};
