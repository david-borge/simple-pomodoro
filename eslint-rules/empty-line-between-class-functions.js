module.exports = {
    rules: {
        'empty-line-between-class-functions': {
            meta: {
                type: 'layout',
                docs: {
                    description: 'Require a blank line between consecutive functions in a class.',
                },
                fixable: 'code',
                schema: [],
            },
            create(context) {
                const sourceCode = context.sourceCode ?? context.getSourceCode();
                const lineEnding = sourceCode.text.includes('\r\n') ? '\r\n' : '\n';

                function isFunctionMember(member) {
                    if (
                        member.type === 'MethodDefinition' ||
                        member.type === 'TSAbstractMethodDefinition'
                    ) {
                        return true;
                    }

                    return (
                        member.type === 'PropertyDefinition' &&
                        member.value &&
                        ['ArrowFunctionExpression', 'FunctionExpression'].includes(
                            member.value.type,
                        )
                    );
                }

                return {
                    ClassBody(node) {
                        const members = node.body ?? [];

                        for (let index = 1; index < members.length; index += 1) {
                            const previousMember = members[index - 1];
                            const member = members[index];

                            if (!isFunctionMember(previousMember) || !isFunctionMember(member)) {
                                continue;
                            }

                            const textBetween = sourceCode.text.slice(
                                previousMember.range[1],
                                member.range[0],
                            );

                            if (/\n[\t ]*\r?\n/.test(textBetween)) {
                                continue;
                            }

                            context.report({
                                node: member,
                                message: 'Add a blank line between functions in a class.',
                                fix(fixer) {
                                    const addedLineBreaks = /\r?\n/.test(textBetween)
                                        ? lineEnding
                                        : `${lineEnding}${lineEnding}`;

                                    return fixer.insertTextBefore(member, addedLineBreaks);
                                },
                            });
                        }
                    },
                };
            },
        },
    },
};
