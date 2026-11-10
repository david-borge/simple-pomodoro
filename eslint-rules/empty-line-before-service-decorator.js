module.exports = {
  rules: {
    'empty-line-before-service-decorator': {
      meta: {
        type: 'layout',
        docs: {
          description: 'Require a blank line between the last import and Angular service decorators.',
        },
        fixable: 'code',
        schema: [],
      },
      create(context) {
        const sourceCode = context.sourceCode ?? context.getSourceCode();

        function isServiceDecorator(decorator) {
          return (
            decorator &&
            decorator.expression &&
            decorator.expression.type === 'CallExpression' &&
            decorator.expression.callee &&
            decorator.expression.callee.type === 'Identifier' &&
            ['Injectable', 'Service'].includes(decorator.expression.callee.name)
          );
        }

        function getStatementNode(node) {
          let currentNode = node;

          while (currentNode && currentNode.parent) {
            if (currentNode.parent.type === 'Program' || Array.isArray(currentNode.parent.body)) {
              return currentNode;
            }

            currentNode = currentNode.parent;
          }

          return node;
        }

        return {
          ClassDeclaration(node) {
            const serviceDecorator = node.decorators?.find(isServiceDecorator);

            if (!serviceDecorator) {
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

            const textBetween = sourceCode.text.slice(lastImport.range[1], serviceDecorator.range[0]);

            if (/\n\s*\n/.test(textBetween)) {
              return;
            }

            context.report({
              node: serviceDecorator,
              message: 'Add a blank line between the last import and the @Service/@Injectable decorator.',
              fix(fixer) {
                return fixer.insertTextBefore(serviceDecorator, '\n');
              },
            });
          },
        };
      },
    },
  },
};
