module.exports = {
    rules: {
        'no-ionic-angular-standalone-imports': {
            meta: {
                type: 'suggestion',
                docs: {
                    description:
                        'Move Ionic standalone imports from @ionic/angular/standalone to @ionic/angular.',
                },
                fixable: 'code',
                schema: [],
            },
            create(context) {
                return {
                    ImportDeclaration(node) {
                        if (node.source.value !== '@ionic/angular/standalone') {
                            return;
                        }

                        context.report({
                            node: node.source,
                            message: 'Use @ionic/angular instead of @ionic/angular/standalone.',
                            fix(fixer) {
                                return fixer.replaceText(
                                    node.source,
                                    JSON.stringify('@ionic/angular'),
                                );
                            },
                        });
                    },
                };
            },
        },
    },
};
