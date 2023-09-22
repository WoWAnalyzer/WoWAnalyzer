/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
    messages: {
      spellIdInsteadOfSpell: 'Using spellId prop instead of spell.',
    },
  },
  create(context) {
    return {
      JSXElement(node) {
        const openingElement = node.openingElement;
        if (!openingElement) {
          return;
        }
        if (openingElement.name.name !== 'BoringSpellValueText') {
          return;
        }
        const spellIdProp = openingElement.attributes.find((attr) => attr.name.name === 'spellId');

        if (!spellIdProp) {
          return;
        }

        context.report({
          node: spellIdProp,
          messageId: 'spellIdInsteadOfSpell',
        });
      },
    };
  },
};
