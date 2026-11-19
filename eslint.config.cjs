// @ts-check
/*
 * Custom ESLint rules used in this project:
 * - simple-import-sort/imports: groups external Ionic/Angular/RxJS/local imports in a consistent order.
 * - component-imports-order/imports-array-order: keeps Angular component `imports` arrays alphabetized.
 * - empty-line-before-component-decorator/empty-line-before-component-decorator: ensures a blank line before @Component decorators.
 * - empty-line-before-service-decorator/empty-line-before-service-decorator: ensures a blank line before @Injectable decorators.
 * - empty-line-before-test-block/empty-line-before-test-block: enforces spacing before test blocks.
 * - angular-class-members-order/angular-class-members-order: orders Angular class members into dependency, Angular API, state, and method groups with blank lines between groups.
 * - empty-line-between-class-functions/empty-line-between-class-functions: ensures a blank line between consecutive class functions.
 * - no-unused-imports/no-unused-imports: removes imports that are never used.
 * - no-unused-ionic-component-imports/no-unused-ionic-component-imports: removes Ionic imports unused by component templates.
 * - no-duplicate-import-items/no-duplicate-import-items: removes duplicate named imports from an import declaration.
 * - no-duplicate-imports/no-duplicate-imports: removes duplicate entries from Angular component imports arrays.
 * - no-ionic-angular-standalone-imports/no-ionic-angular-standalone-imports: moves '@ionic/angular/standalone' imports to '@ionic/angular'.
 * - unify-imports/unify-imports: combines multiple imports from the same module into one declaration.
 */

const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const componentImportsOrder = require('./eslint-rules/component-imports-order.cjs');
const emptyLineBeforeComponentDecorator = require('./eslint-rules/empty-line-before-component-decorator.cjs');
const emptyLineBetweenClassFunctions = require('./eslint-rules/empty-line-between-class-functions.cjs');
const emptyLineBeforeServiceDecorator = require('./eslint-rules/empty-line-before-service-decorator.cjs');
const emptyLineBeforeTestBlock = require('./eslint-rules/empty-line-before-test-block.cjs');
const angularClassMembersOrder = require('./eslint-rules/angular-class-members-order.cjs');
const noDuplicateImportItems = require('./eslint-rules/no-duplicate-import-items.cjs');
const noDuplicateImports = require('./eslint-rules/no-duplicate-imports.cjs');
const noUnusedIonicComponentImports = require('./eslint-rules/no-unused-ionic-component-imports.cjs');
const noUnusedImports = require('./eslint-rules/no-unused-imports.cjs');
const noIonicAngularStandaloneImports = require('./eslint-rules/no-ionic-angular-standalone-imports.cjs');
const unifyImports = require('./eslint-rules/unify-imports.cjs');

module.exports = tseslint.config(
    {
        ignores: ['projects/**/*', 'www/**/*', 'android/**/*', 'ios/**/*', '.agents/**/*'],
    },
    {
        files: ['**/*.ts'],
        ignores: ['projects/**/*', 'www/**/*', 'android/**/*', 'ios/**/*'],
        extends: [...angular.configs.tsRecommended],
        processor: angular.processInlineTemplates,
        plugins: {
            'simple-import-sort': simpleImportSort,
            'component-imports-order': componentImportsOrder,
            'empty-line-before-component-decorator': emptyLineBeforeComponentDecorator,
            'empty-line-between-class-functions': emptyLineBetweenClassFunctions,
            'empty-line-before-service-decorator': emptyLineBeforeServiceDecorator,
            'empty-line-before-test-block': emptyLineBeforeTestBlock,
            'angular-class-members-order': angularClassMembersOrder,
            'no-duplicate-import-items': noDuplicateImportItems,
            'no-duplicate-imports': noDuplicateImports,
            'no-unused-ionic-component-imports': noUnusedIonicComponentImports,
            'no-unused-imports': noUnusedImports,
            'no-ionic-angular-standalone-imports': noIonicAngularStandaloneImports,
            'unify-imports': unifyImports,
        },
        rules: {
            '@angular-eslint/component-class-suffix': [
                'error',
                { suffixes: ['Page', 'Component'] },
            ],
            '@angular-eslint/component-selector': [
                'error',
                { type: 'element', prefix: 'app', style: 'kebab-case' },
            ],
            '@angular-eslint/directive-selector': [
                'error',
                { type: 'attribute', prefix: 'app', style: 'camelCase' },
            ],
            'simple-import-sort/imports': [
                'warn',
                {
                    groups: [
                        ['^firebase/'],
                        ['^@ionic/', '^ionicons'],
                        ['^@capacitor/'],
                        ['^@capgo/'],
                        ['^@angular/'],
                        ['^rxjs', '^rxjs/'],
                        ['^\\./', '^\\.\\./'],
                    ],
                },
            ],
            'component-imports-order/imports-array-order': 'warn',
            'empty-line-before-component-decorator/empty-line-before-component-decorator': 'warn',
            'empty-line-between-class-functions/empty-line-between-class-functions': 'warn',
            'empty-line-before-service-decorator/empty-line-before-service-decorator': 'warn',
            'empty-line-before-test-block/empty-line-before-test-block': 'warn',
            'angular-class-members-order/angular-class-members-order': 'warn',
            'no-duplicate-import-items/no-duplicate-import-items': 'warn',
            'no-duplicate-imports/no-duplicate-imports': 'warn',
            'no-unused-ionic-component-imports/no-unused-ionic-component-imports': 'warn',
            'no-unused-imports/no-unused-imports': 'warn',
            'no-ionic-angular-standalone-imports/no-ionic-angular-standalone-imports': 'warn',
            'unify-imports/unify-imports': 'warn',
        },
    },
    {
        files: ['**/*.html'],
        extends: [...angular.configs.templateRecommended],
        rules: {},
    },
);
