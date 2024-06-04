/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    messages: {
      settingEventMetaDirectly:
        'Use addInefficientCastReason or addEnhancedCastReason instead of setting event meta directly',
    },
  },
  create(context) {
    return {
      'AssignmentExpression > MemberExpression'(node) {
        const { object, property } = node;
        if (property.type !== 'Identifier') {
          return;
        }

        if (property.name === 'meta') {
          context.report({
            node: node.parent.parent,
            messageId: 'settingEventMetaDirectly',
          });
        } else if (
          property.name === 'isInefficientCast' ||
          property.name === 'inefficientCastReason'
        ) {
          if (
            object.type === 'MemberExpression' &&
            object.property.type === 'Identifier' &&
            object.property.name === 'meta'
          ) {
            context.report({
              node: node.parent.parent,
              messageId: 'settingEventMetaDirectly',
            });
          }
        }
      },
    };
  },
};
