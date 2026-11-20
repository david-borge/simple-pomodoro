/** @type {import('eslint').ESLint.Plugin} */

export default {
    rules: {
        'imports-array-order': {
            meta: {
                type: 'suggestion',
                docs: {
                    description: 'Require Angular component imports arrays to be alphabetized.',
                },
                fixable: 'code',
                schema: [],
            },
            create(context) {
                const sourceCode = context.sourceCode ?? context.getSourceCode();

                function isSorted(elements) {
                    for (let index = 1; index < elements.length; index += 1) {
                        const previous = sourceCode.getText(elements[index - 1]).trim();
                        const current = sourceCode.getText(elements[index]).trim();

                        if (
                            previous.localeCompare(current, undefined, { sensitivity: 'base' }) > 0
                        ) {
                            return false;
                        }
                    }

                    return true;
                }

                function buildSortedArrayText(arrayExpression) {
                    const orderedItems = [...arrayExpression.elements]
                        .filter(Boolean)
                        .map((element) => sourceCode.getText(element).trim())
                        .sort((left, right) =>
                            left.localeCompare(right, undefined, { sensitivity: 'base' }),
                        );

                    if (arrayExpression.loc.start.line === arrayExpression.loc.end.line) {
                        return `[${orderedItems.join(', ')}]`;
                    }

                    const lineText = sourceCode.lines[arrayExpression.loc.start.line - 1] ?? '';
                    const lineIndent = lineText.match(/^\s*/)?.[0] ?? '';
                    const baseIndent = lineIndent;
                    const itemIndent = `${lineIndent}    `;
                    const body = orderedItems
                        .map(
                            (item, index) =>
                                `${itemIndent}${item}${index < orderedItems.length - 1 ? ',' : ''}`,
                        )
                        .join('\n');

                    return `[\n${body}\n${baseIndent}]`;
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

                        if (elements.length < 2 || isSorted(elements)) {
                            return;
                        }

                        context.report({
                            node: node.value,
                            message: 'Component imports must be alphabetized.',
                            fix(fixer) {
                                return fixer.replaceText(
                                    node.value,
                                    buildSortedArrayText(node.value),
                                );
                            },
                        });
                    },
                };
            },
        },
    },
};
