module.exports = {
    rules: {
        'unify-imports': {
            meta: {
                type: 'suggestion',
                docs: {
                    description:
                        'Combine multiple imports from the same module into one declaration.',
                },
                fixable: 'code',
                schema: [],
            },
            create(context) {
                function getImportGroupKey(node) {
                    if (!node.source || node.source.type !== 'Literal') {
                        return null;
                    }

                    if (typeof node.source.value !== 'string' || node.specifiers.length === 0) {
                        return null;
                    }

                    return `${node.importKind === 'type' ? 'type' : 'value'}:${node.source.value}`;
                }

                function renderNamedImport(specifier) {
                    const importedName =
                        specifier.imported.type === 'Identifier'
                            ? specifier.imported.name
                            : String(specifier.imported.value);
                    const localName = specifier.local.name;
                    const typePrefix = specifier.importKind === 'type' ? 'type ' : '';

                    if (localName === importedName) {
                        return `${typePrefix}${importedName}`;
                    }

                    return `${typePrefix}${importedName} as ${localName}`;
                }

                function buildMergedImportText(group) {
                    const source = group[0].source.value;
                    const allSpecifiers = group.flatMap((node) => node.specifiers);
                    const defaultSpecifier = allSpecifiers.find(
                        (specifier) => specifier.type === 'ImportDefaultSpecifier',
                    );
                    const namespaceSpecifier = allSpecifiers.find(
                        (specifier) => specifier.type === 'ImportNamespaceSpecifier',
                    );
                    const namedSpecifiers = allSpecifiers.filter(
                        (specifier) => specifier.type === 'ImportSpecifier',
                    );
                    const importParts = [];

                    if (defaultSpecifier) {
                        importParts.push(defaultSpecifier.local.name);
                    }

                    if (namespaceSpecifier) {
                        importParts.push(`* as ${namespaceSpecifier.local.name}`);
                    }

                    if (namedSpecifiers.length > 0) {
                        importParts.push(
                            `{ ${namedSpecifiers.map(renderNamedImport).join(', ')} }`,
                        );
                    }

                    const importPrefix = group[0].importKind === 'type' ? 'type ' : '';

                    return `${importPrefix}import ${importParts.join(', ')} from ${JSON.stringify(source)};`;
                }

                return {
                    Program(node) {
                        const groups = new Map();

                        for (const statement of node.body) {
                            if (statement.type !== 'ImportDeclaration') {
                                continue;
                            }

                            const key = getImportGroupKey(statement);

                            if (!key) {
                                continue;
                            }

                            const existingGroup = groups.get(key) ?? [];
                            existingGroup.push(statement);
                            groups.set(key, existingGroup);
                        }

                        for (const group of groups.values()) {
                            if (group.length < 2) {
                                continue;
                            }

                            const firstImport = group[0];
                            const lastImport = group[group.length - 1];

                            context.report({
                                node: lastImport,
                                message: `Combine imports from "${firstImport.source.value}" into a single import statement.`,
                                fix(fixer) {
                                    return fixer.replaceTextRange(
                                        [firstImport.range[0], lastImport.range[1]],
                                        buildMergedImportText(group),
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
