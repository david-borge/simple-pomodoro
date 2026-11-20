/** @type {import('eslint').ESLint.Plugin} */

export default {
    rules: {
        'empty-line-before-component-decorator': {
            meta: {
                type: 'layout',
                docs: {
                    description:
                        'Require a blank line between the last import and Angular @Component decorators.',
                },
                fixable: 'code',
                schema: [],
            },
            create(context) {
                const sourceCode = context.sourceCode ?? context.getSourceCode();

                function isComponentDecorator(decorator) {
                    return (
                        decorator &&
                        decorator.expression &&
                        decorator.expression.type === 'CallExpression' &&
                        decorator.expression.callee &&
                        decorator.expression.callee.type === 'Identifier' &&
                        decorator.expression.callee.name === 'Component'
                    );
                }

                function getStatementNode(node) {
                    let currentNode = node;

                    while (currentNode && currentNode.parent) {
                        if (
                            currentNode.parent.type === 'Program' ||
                            Array.isArray(currentNode.parent.body)
                        ) {
                            return currentNode;
                        }

                        currentNode = currentNode.parent;
                    }

                    return node;
                }

                return {
                    ClassDeclaration(node) {
                        const componentDecorator = node.decorators?.find(isComponentDecorator);

                        if (!componentDecorator) {
                            return;
                        }

                        const statementNode = getStatementNode(node);
                        const parentBody = statementNode.parent?.body ?? [];
                        const declarationIndex = parentBody.indexOf(statementNode);
                        const previousNodes = parentBody.slice(0, declarationIndex);
                        const lastImport = [...previousNodes]
                            .reverse()
                            .find((previousNode) => previousNode.type === 'ImportDeclaration');

                        if (!lastImport) {
                            return;
                        }

                        const textBetween = sourceCode.text.slice(
                            lastImport.range[1],
                            componentDecorator.range[0],
                        );

                        if (/\n\s*\n/.test(textBetween)) {
                            return;
                        }

                        context.report({
                            node: componentDecorator,
                            message:
                                'Add a blank line between the last import and the @Component decorator.',
                            fix(fixer) {
                                return fixer.insertTextBefore(componentDecorator, '\n');
                            },
                        });
                    },
                };
            },
        },
    },
};
