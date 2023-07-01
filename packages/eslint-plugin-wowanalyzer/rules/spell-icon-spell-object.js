/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
    messages: {
      idInsteadOfSpell: 'Using id prop instead of spell',
      nonObjectSpell: 'Not passing spell object instead of number',
    },
  },
  create(context) {
    return {
      JSXElement(node) {
        const openingElement = node.openingElement;
        if (!openingElement) {
          return;
        }
        if (openingElement.name.name !== 'SpellIcon') {
          return;
        }
        const idProp = openingElement.attributes.find((attr) => attr.name.name === 'id');
        const spellProp = openingElement.attributes.find((attr) => attr.name.name === 'spell');

        if (idProp) {
          context.report({
            node: idProp,
            messageId: 'idInsteadOfSpell',
            fix(fixer) {
              return fixer.replaceText(idProp.name, 'spell');
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
