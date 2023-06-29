/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
    messages: {
      spellIdInsteadOfSpell: 'Using spellId prop instead of spell.',
      nonObjectSpell: 'Not passing spell object instead of number.',
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
        const spellProp = openingElement.attributes.find((attr) => attr.name.name === 'spell');

        if (spellIdProp) {
          context.report({
            node: spellIdProp,
            messageId: 'spellIdInsteadOfSpell',
            fix(fixer) {
              return fixer.replaceText(spellIdProp.name, 'spell');
            },
          });
        }

        if (spellProp) {
          const value = spellProp.value;
          if (value.type === 'JSXExpressionContainer') {
            const expression = value.expression;
            if (expression.type === 'MemberExpression') {
              const property = expression.property;
              if (property.name === 'id' || property.name === 'guid') {
                context.report({
                  node: property,
                  messageId: 'nonObjectSpell',
                  fix(fixer) {
                    return fixer.removeRange([property.range[0] - 1, property.range[1]]);
                  },
                });
              }
            }
          }
        }
      },
    };
  },
};
