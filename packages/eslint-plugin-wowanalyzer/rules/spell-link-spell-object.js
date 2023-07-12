/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
    messages: {
      idInsteadOfSpell: 'Using id prop instead of spell',
    },
  },
  create(context) {
    return {
      JSXElement(node) {
        const openingElement = node.openingElement;
        if (!openingElement) {
          return;
        }
        if (openingElement.name.name !== 'SpellLink') {
          return;
        }
        const idProp = openingElement.attributes.find((attr) => attr.name.name === 'id');

        if (!idProp) {
          return;
        }

        context.report({
          node: idProp,
          messageId: 'idInsteadOfSpell',
        });
      },
    };
  },
};
