module.exports = {
    rules: {
        'no-unused-imports': {
            meta: {
                type: 'suggestion',
                docs: {
                    description: 'Remove unused imports from modules.',
                },
                fixable: 'code',
                schema: [],
            },
            create(context) {
                const sourceCode = context.sourceCode ?? context.getSourceCode();

                function isUnusedSpecifier(specifier, declaredVariables) {
                    if (!specifier.local) {
                        return false;
                    }

                    const variable = declaredVariables.find(
                        (declaredVariable) => declaredVariable.name === specifier.local.name,
                    );

                    if (!variable) {
                        return true;
                    }

                    return variable.references.length === 0;
                }

                function renderNamedSpecifier(specifier) {
                    const imported = specifier.imported;
                    const importedName =
                        imported.type === 'Identifier' ? imported.name : String(imported.value);
                    const localName = specifier.local.name;
                    const typePrefix = specifier.importKind === 'type' ? 'type ' : '';

                    if (localName === importedName) {
                        return `${typePrefix}${importedName}`;
                    }

                    return `${typePrefix}${importedName} as ${localName}`;
                }

                function renderImportDeclaration(node, remainingSpecifiers) {
                    const source = node.source.value;
                    const defaultSpecifier = remainingSpecifiers.find(
                        (specifier) => specifier.type === 'ImportDefaultSpecifier',
                    );
                    const namespaceSpecifier = remainingSpecifiers.find(
                        (specifier) => specifier.type === 'ImportNamespaceSpecifier',
                    );
                    const namedSpecifiers = remainingSpecifiers.filter(
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
                        const namedImportText = namedSpecifiers
                            .map((specifier) => renderNamedSpecifier(specifier))
                            .join(', ');
                        importParts.push(`{ ${namedImportText} }`);
                    }

                    if (importParts.length === 0) {
                        return '';
                    }

                    const importPrefix = node.importKind === 'type' ? 'type ' : '';
                    const importTarget = `${importPrefix}import ${importParts.join(', ')} from ${JSON.stringify(source)};`;

                    if (
                        importParts.length === 1 &&
                        defaultSpecifier &&
                        node.importKind === 'type'
                    ) {
                        return `import type ${defaultSpecifier.local.name} from ${JSON.stringify(source)};`;
                    }

                    if (
                        importParts.length === 1 &&
                        namespaceSpecifier &&
                        node.importKind === 'type'
                    ) {
                        return `import type * as ${namespaceSpecifier.local.name} from ${JSON.stringify(source)};`;
                    }

                    return importTarget;
                }

                return {
                    ImportDeclaration(node) {
                        const declaredVariables = sourceCode.getDeclaredVariables(node);
                        const unusedSpecifiers = node.specifiers.filter((specifier) =>
                            specifier.type !== 'ImportDefaultSpecifier' &&
                            specifier.type !== 'ImportNamespaceSpecifier' &&
                            specifier.type !== 'ImportSpecifier'
                                ? false
                                : isUnusedSpecifier(specifier, declaredVariables),
                        );

                        if (unusedSpecifiers.length === 0) {
                            return;
                        }

                        const remainingSpecifiers = node.specifiers.filter(
                            (specifier) => !unusedSpecifiers.includes(specifier),
                        );

                        context.report({
                            node,
                            message: 'Remove unused imports.',
                            fix(fixer) {
                                if (remainingSpecifiers.length === 0) {
                                    return fixer.remove(node);
                                }

                                const newImportText = renderImportDeclaration(
                                    node,
                                    remainingSpecifiers,
                                );
                                return fixer.replaceText(node, newImportText);
                            },
                        });
                    },
                };
            },
        },
    },
};
