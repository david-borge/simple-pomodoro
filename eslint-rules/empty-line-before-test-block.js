module.exports = {
    rules: {
        'empty-line-before-test-block': {
            meta: {
                type: 'layout',
                docs: {
                    description:
                        'Require a blank line between the last import and the first test block in spec files.',
                },
                fixable: 'code',
                schema: [],
            },
            create(context) {
                const sourceCode = context.sourceCode ?? context.getSourceCode();
                const filename = context.filename ?? context.getFilename?.() ?? '';

                function isTestBlockStatement(node) {
                    if (!node || node.type !== 'ExpressionStatement') {
                        return false;
                    }

                    const expression = node.expression;
                    if (!expression || expression.type !== 'CallExpression') {
                        return false;
                    }

                    const callee = expression.callee;
                    return (
                        callee &&
                        callee.type === 'Identifier' &&
                        ['describe', 'it', 'test'].includes(callee.name)
                    );
                }

                return {
                    Program(node) {
                        if (!filename.endsWith('.spec.ts') && !filename.endsWith('.spec.js')) {
                            return;
                        }

                        const body = node.body || [];
                        const lastImportIndex = [...body].reduce((lastIndex, statement, index) => {
                            return statement.type === 'ImportDeclaration' ? index : lastIndex;
                        }, -1);

                        if (lastImportIndex === -1) {
                            return;
                        }

                        const firstTestBlock = body
                            .slice(lastImportIndex + 1)
                            .find((statement) => isTestBlockStatement(statement));

                        if (!firstTestBlock) {
                            return;
                        }

                        const lastImport = body[lastImportIndex];
                        const textBetween = sourceCode.text.slice(
                            lastImport.range[1],
                            firstTestBlock.range[0],
                        );

                        if (/\n\s*\n/.test(textBetween)) {
                            return;
                        }

                        context.report({
                            node: firstTestBlock,
                            message:
                                'Add a blank line between the last import and the first test block.',
                            fix(fixer) {
                                return fixer.insertTextBefore(firstTestBlock, '\n');
                            },
                        });
                    },
                };
            },
        },
    },
};
