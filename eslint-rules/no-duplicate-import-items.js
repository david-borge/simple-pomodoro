/** @type {import('eslint').ESLint.Plugin} */

export default {
    rules: {
        'no-duplicate-import-items': {
            meta: {
                type: 'suggestion',
                docs: {
                    description: 'Remove duplicate entries from import declarations.',
                },
                fixable: 'code',
                schema: [],
            },
            create(context) {
                const sourceCode = context.sourceCode ?? context.getSourceCode();

                function getSpecifierKey(specifier) {
                    const importedName =
                        specifier.imported.type === 'Identifier'
                            ? specifier.imported.name
                            : String(specifier.imported.value);
                    const localName =
                        specifier.local.type === 'Identifier'
                            ? specifier.local.name
                            : String(specifier.local.value);

                    return `${specifier.importKind ?? 'value'}:${importedName}:${localName}`;
                }

                function renderNamedImport(specifier) {
                    const importedName =
                        specifier.imported.type === 'Identifier'
                            ? specifier.imported.name
                            : String(specifier.imported.value);
                    const localName =
                        specifier.local.type === 'Identifier'
                            ? specifier.local.name
                            : String(specifier.local.value);
                    const typePrefix = specifier.importKind === 'type' ? 'type ' : '';

                    if (localName === importedName) {
                        return `${typePrefix}${importedName}`;
                    }

                    return `${typePrefix}${importedName} as ${localName}`;
                }

                function buildImportText(node) {
                    const defaultSpecifier = node.specifiers.find(
                        (specifier) => specifier.type === 'ImportDefaultSpecifier',
                    );
                    const namespaceSpecifier = node.specifiers.find(
                        (specifier) => specifier.type === 'ImportNamespaceSpecifier',
                    );
                    const namedSpecifiers = node.specifiers.filter(
                        (specifier) => specifier.type === 'ImportSpecifier',
                    );
                    const uniqueNamedSpecifiers = [];
                    const seen = new Set();

                    for (const specifier of namedSpecifiers) {
                        const key = getSpecifierKey(specifier);

                        if (seen.has(key)) {
                            continue;
                        }

                        seen.add(key);
                        uniqueNamedSpecifiers.push(specifier);
                    }

                    const importParts = [];

                    if (defaultSpecifier) {
                        importParts.push(defaultSpecifier.local.name);
                    }

                    if (namespaceSpecifier) {
                        importParts.push(`* as ${namespaceSpecifier.local.name}`);
                    }

                    if (uniqueNamedSpecifiers.length > 0) {
                        importParts.push(
                            `{ ${uniqueNamedSpecifiers.map(renderNamedImport).join(', ')} }`,
                        );
                    }

                    const importPrefix = node.importKind === 'type' ? 'type ' : '';
                    const sourceText = sourceCode.getText(node.source);

                    return `${importPrefix}import ${importParts.join(', ')} from ${sourceText};`;
                }

                return {
                    ImportDeclaration(node) {
                        const namedSpecifiers = node.specifiers.filter(
                            (specifier) => specifier.type === 'ImportSpecifier',
                        );

                        if (namedSpecifiers.length < 2) {
                            return;
                        }

                        const seen = new Set();
                        const duplicateSpecifiers = [];

                        for (const specifier of namedSpecifiers) {
                            const key = getSpecifierKey(specifier);

                            if (seen.has(key)) {
                                duplicateSpecifiers.push(specifier);
                                continue;
                            }

                            seen.add(key);
                        }

                        if (duplicateSpecifiers.length === 0) {
                            return;
                        }

                        context.report({
                            node: duplicateSpecifiers[duplicateSpecifiers.length - 1],
                            message: 'Remove duplicate items from the import statement.',
                            fix(fixer) {
                                return fixer.replaceText(node, buildImportText(node));
                            },
                        });
                    },
                };
            },
        },
    },
};
