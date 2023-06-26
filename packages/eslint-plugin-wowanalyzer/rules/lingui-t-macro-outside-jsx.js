/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
    messages: {
      tMacroOutsideJsxContext: 'Used t macro outside of JSX context',
    },
  },
  create(context) {
    return {
      'CallExpression > Identifier[name="t"]'(identifierNode) {
        // If we don't find a JSX element, this usage of the t macro is suspect.
        let parent = identifierNode.parent;
        while (parent) {
          if (parent.type.startsWith('JSX')) {
            return;
          }
          parent = parent.parent;
        }

        context.report({
          node: identifierNode,
          messageId: 'tMacroOutsideJsxContext',
          fix(fixer) {
            return fixer.replaceText(identifierNode, 'defineMessage');
          },
        });
      },
    };
  },
};
