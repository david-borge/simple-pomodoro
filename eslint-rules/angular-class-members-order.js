/** @type {import('eslint').ESLint.Plugin} */

export default {
    rules: {
        'angular-class-members-order': {
            meta: {
                type: 'layout',
                docs: {
                    description:
                        'Order Angular class members by dependency, Angular API, state, and method groups.',
                },
                fixable: 'whitespace',
                schema: [],
            },
            create(context) {
                const sourceCode = context.sourceCode ?? context.getSourceCode();
                const lineEnding = sourceCode.text.includes('\r\n') ? '\r\n' : '\n';
                const angularMemberFactories = new Set([
                    'input',
                    'model',
                    'output',
                    'viewChild',
                    'viewChildren',
                    'contentChild',
                    'contentChildren',
                ]);
                const angularMemberDecorators = new Set([
                    'Input',
                    'Output',
                    'ViewChild',
                    'ViewChildren',
                    'ContentChild',
                    'ContentChildren',
                ]);

                function getCalleeName(callee) {
                    if (callee?.type === 'Identifier') {
                        return callee.name;
                    }

                    if (
                        callee?.type === 'MemberExpression' &&
                        !callee.computed &&
                        callee.object?.type === 'Identifier' &&
                        callee.property?.type === 'Identifier'
                    ) {
                        return `${callee.object.name}.${callee.property.name}`;
                    }

                    return undefined;
                }

                function isAngularClass(node) {
                    return (
                        node.decorators?.some((decorator) => {
                            const expression = decorator.expression;
                            const callee =
                                expression?.type === 'CallExpression'
                                    ? expression.callee
                                    : expression;

                            return (
                                callee?.type === 'Identifier' &&
                                ['Component', 'Injectable', 'Service'].includes(callee.name)
                            );
                        }) ?? false
                    );
                }

                function isProperty(member) {
                    return [
                        'PropertyDefinition',
                        'TSAbstractPropertyDefinition',
                        'AccessorProperty',
                    ].includes(member.type);
                }

                function isFunctionProperty(member) {
                    return (
                        isProperty(member) &&
                        member.value &&
                        ['ArrowFunctionExpression', 'FunctionExpression'].includes(
                            member.value.type,
                        )
                    );
                }

                function hasAngularMemberDecorator(member) {
                    return (
                        member.decorators?.some((decorator) => {
                            const expression = decorator.expression;
                            const callee =
                                expression?.type === 'CallExpression'
                                    ? expression.callee
                                    : expression;
                            const name = getCalleeName(callee);

                            return name && angularMemberDecorators.has(name);
                        }) ?? false
                    );
                }

                function hasAngularMemberFactory(member) {
                    if (!isProperty(member) || member.value?.type !== 'CallExpression') {
                        return false;
                    }

                    const calleeName = getCalleeName(member.value.callee);

                    return (
                        calleeName === 'inject' ||
                        angularMemberFactories.has(calleeName) ||
                        [...angularMemberFactories].some((factory) =>
                            calleeName?.startsWith(`${factory}.`),
                        )
                    );
                }

                function getMemberGroup(member) {
                    if (
                        hasAngularMemberFactory(member) &&
                        getCalleeName(member.value.callee) === 'inject'
                    ) {
                        return 1;
                    }

                    if (hasAngularMemberDecorator(member) || hasAngularMemberFactory(member)) {
                        return 2;
                    }

                    if (
                        member.type === 'MethodDefinition' ||
                        member.type === 'TSAbstractMethodDefinition' ||
                        isFunctionProperty(member)
                    ) {
                        return 4;
                    }

                    if (isProperty(member)) {
                        return 3;
                    }

                    return undefined;
                }

                function hasBlankLine(text) {
                    return /\r?\n[\t ]*\r?\n/.test(text);
                }

                function groupName(group) {
                    return [
                        undefined,
                        'injected dependencies',
                        'inputs, outputs, and queries',
                        'component state and other fields',
                        'methods',
                    ][group];
                }

                function getMemberRange(member) {
                    const decoratorStart = member.decorators?.reduce(
                        (start, decorator) => Math.min(start, decorator.range[0]),
                        member.range[0],
                    );

                    return [decoratorStart ?? member.range[0], member.range[1]];
                }

                function canSafelyReorder(node, members) {
                    if (members.length !== node.body.body.length) {
                        return false;
                    }

                    const bodyStart = node.body.range[0] + 1;
                    const bodyEnd = node.body.range[1] - 1;
                    const firstRange = getMemberRange(members[0].member);
                    const lastRange = getMemberRange(members[members.length - 1].member);
                    const leadingText = sourceCode.text.slice(bodyStart, firstRange[0]);
                    const trailingText = sourceCode.text.slice(lastRange[1], bodyEnd);

                    if (!/^\s*$/.test(leadingText) || !/^\s*$/.test(trailingText)) {
                        return false;
                    }

                    for (let index = 1; index < members.length; index += 1) {
                        const previousRange = getMemberRange(members[index - 1].member);
                        const currentRange = getMemberRange(members[index].member);
                        const gap = sourceCode.text.slice(previousRange[1], currentRange[0]);

                        if (!/^\s*$/.test(gap)) {
                            return false;
                        }
                    }

                    return true;
                }

                function buildReorderedClassBody(node, members) {
                    const bodyStart = node.body.range[0] + 1;
                    const bodyEnd = node.body.range[1] - 1;
                    const firstRange = getMemberRange(members[0].member);
                    const lastRange = getMemberRange(members[members.length - 1].member);
                    const leadingText = sourceCode.text.slice(bodyStart, firstRange[0]);
                    const trailingText = sourceCode.text.slice(lastRange[1], bodyEnd);
                    const memberIndent = leadingText.match(/(?:\r?\n)([\t ]*)$/)?.[1] ?? '';
                    const orderedMembers = [...members].sort(
                        (left, right) => left.group - right.group,
                    );

                    let reorderedBody = leadingText;

                    for (let index = 0; index < orderedMembers.length; index += 1) {
                        if (index > 0) {
                            const previousGroup = orderedMembers[index - 1].group;
                            const currentGroup = orderedMembers[index].group;
                            const needsBlankLine =
                                previousGroup !== currentGroup || currentGroup === 4;

                            reorderedBody += needsBlankLine
                                ? `${lineEnding}${lineEnding}${memberIndent}`
                                : `${lineEnding}${memberIndent}`;
                        }

                        const [memberStart, memberEnd] = getMemberRange(
                            orderedMembers[index].member,
                        );
                        reorderedBody += sourceCode.text.slice(memberStart, memberEnd);
                    }

                    return `${reorderedBody}${trailingText}`;
                }

                return {
                    ClassDeclaration(node) {
                        if (!isAngularClass(node)) {
                            return;
                        }

                        const members = node.body.body
                            .map((member) => ({ member, group: getMemberGroup(member) }))
                            .filter(({ group }) => group !== undefined);

                        let highestGroup = 0;
                        let orderingViolation;

                        for (const { member, group } of members) {
                            if (group < highestGroup) {
                                orderingViolation = { member, group, previousGroup: highestGroup };
                                break;
                            } else {
                                highestGroup = group;
                            }
                        }

                        if (orderingViolation) {
                            const safeToReorder = canSafelyReorder(node, members);

                            context.report({
                                node: orderingViolation.member,
                                message: `Place ${groupName(orderingViolation.group)} before ${groupName(orderingViolation.previousGroup)} in Angular classes.`,
                                ...(safeToReorder
                                    ? {
                                          fix(fixer) {
                                              return fixer.replaceTextRange(
                                                  [node.body.range[0] + 1, node.body.range[1] - 1],
                                                  buildReorderedClassBody(node, members),
                                              );
                                          },
                                      }
                                    : {}),
                            });

                            if (safeToReorder) {
                                return;
                            }
                        }

                        for (let index = 1; index < members.length; index += 1) {
                            const previous = members[index - 1];
                            const current = members[index];

                            if (previous.group === current.group) {
                                continue;
                            }

                            const gap = sourceCode.text.slice(
                                previous.member.range[1],
                                current.member.range[0],
                            );

                            if (hasBlankLine(gap)) {
                                continue;
                            }

                            context.report({
                                node: current.member,
                                message: `Add a blank line between the ${groupName(previous.group)} and ${groupName(current.group)} groups.`,
                                fix(fixer) {
                                    // Avoid moving comments or changing their attachment to a member.
                                    if (!/^\s*$/.test(gap)) {
                                        return null;
                                    }

                                    const memberLine =
                                        sourceCode.lines[current.member.loc.start.line - 1] ?? '';
                                    const memberIndent = memberLine.match(/^[\t ]*/)?.[0] ?? '';

                                    return fixer.replaceTextRange(
                                        [previous.member.range[1], current.member.range[0]],
                                        `${lineEnding}${lineEnding}${memberIndent}`,
                                    );
                                },
                            });
                        }
                    },
                };
            },
        },
    },
};
