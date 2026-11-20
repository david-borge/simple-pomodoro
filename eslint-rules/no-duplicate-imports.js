/** @type {import('eslint').ESLint.Plugin} */

export default {
    rules: {
        'no-duplicate-imports': {
            meta: {
                type: 'suggestion',
                docs: {
                    description: 'Remove duplicate entries from Angular component imports arrays.',
                },
                fixable: 'code',
                schema: [],
            },
            create(context) {
                const sourceCode = context.sourceCode ?? context.getSourceCode();

                function buildDeduplicatedArrayText(arrayExpression) {
                    const uniqueItems = [];
                    const seen = new Set();

                    for (const element of arrayExpression.elements) {
                        if (!element || element.type === 'SpreadElement') {
                            continue;
                        }

                        const itemText = sourceCode.getText(element).trim();

                        if (seen.has(itemText)) {
                            continue;
                        }

                        seen.add(itemText);
                        uniqueItems.push(itemText);
                    }

                    if (uniqueItems.length === 0) {
                        return '[]';
                    }

                    if (arrayExpression.loc.start.line === arrayExpression.loc.end.line) {
                        return `[${uniqueItems.join(', ')}]`;
                    }

                    const lineText = sourceCode.lines[arrayExpression.loc.start.line - 1] ?? '';
                    const lineIndent = lineText.match(/^\s*/)?.[0] ?? '';
                    const itemIndent = `${lineIndent}    `;
                    const body = uniqueItems
                        .map(
                            (item, index) =>
                                `${itemIndent}${item}${index < uniqueItems.length - 1 ? ',' : ''}`,
                        )
                        .join('\n');

                    return `[\n${body}\n${lineIndent}]`;
                }

                return {
                    Property(node) {
                        if (node.computed || !node.key) {
                            return;
                        }

                        const keyName =
                            node.key.type === 'Identifier'
                                ? node.key.name
                                : node.key.type === 'Literal'
                                  ? node.key.value
                                  : null;

                        if (
                            keyName !== 'imports' ||
                            !node.value ||
                            node.value.type !== 'ArrayExpression'
                        ) {
                            return;
                        }

                        const elements = node.value.elements.filter(
                            (element) => element && element.type !== 'SpreadElement',
                        );

                        if (elements.length < 2) {
                            return;
                        }

                        const seen = new Set();
                        const duplicateElements = [];

                        for (const element of elements) {
                            const elementText = sourceCode.getText(element).trim();

                            if (seen.has(elementText)) {
                                duplicateElements.push(element);
                                continue;
                            }

                            seen.add(elementText);
                        }

                        if (duplicateElements.length === 0) {
                            return;
                        }

                        context.report({
                            node: duplicateElements[duplicateElements.length - 1],
                            message: 'Remove duplicate imports from the imports array.',
                            fix(fixer) {
                                return fixer.replaceText(
                                    node.value,
                                    buildDeduplicatedArrayText(node.value),
                                );
                            },
                        });
                    },
                };
            },
        },
    },
};
