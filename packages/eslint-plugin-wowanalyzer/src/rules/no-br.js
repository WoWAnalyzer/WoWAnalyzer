/** @type {import('eslint').Rule.RuleModule} */
export const noBrTag = {
  meta: {
    type: 'problem',
    messages: {
      usePTagOrDivTag:
        'Instead of <br/>: use <p> for paragraphs, <div> for UI blocks, and <ul> or <ol> for lists. If they are not valid elements at this location, add an `oxlint-disable` suppression.',
    },
  },
  create(context) {
    return {
      'JSXOpeningElement[name.name="br"]'(node) {
        context.report({
          node,
          messageId: 'usePTagOrDivTag',
        });
      },
    };
  },
};
