exports.rules = {
  /** @type {import('eslint').Rule.RuleModule} */
  'module-spread-parent-dependencies': {
    meta: {
      type: 'problem',
      fixable: 'code',
      messages: {
        missingParentDependencies: 'Parent module dependencies are not spread',
      },
    },
    create(context) {
      return {
        ClassDeclaration(classNode) {
          if (!classNode.superClass) {
            return;
          }
          const extendedClassName = classNode.superClass.name;
          // some very base class names are permitted
          if (['Analyzer', 'Module', 'EventSubscriber'].includes(extendedClassName)) {
            return;
          }
          // check class body, if there is `static dependencies = ...`
          const dependenciesDeclaration = classNode.body.body.find(
            (property) => property.key.name === 'dependencies' && property.static,
          );
          if (!dependenciesDeclaration) {
            return;
          }
          // assume `static dependencies` is an object
          /** @type {import('@types/estree').ObjectExpression} */
          const value = dependenciesDeclaration.value;
          if (value.properties.length === 0) {
            // can't have empty dependencies in an extended class
            context.report({
              node: dependenciesDeclaration,
              messageId: 'missingParentDependencies',
              fix(fixer) {
                const startSpaces = dependenciesDeclaration.loc.start.column;
                const lineIndent = Array.from({ length: startSpaces + 2 }, (_) => ' ').join('');
                const endIndent = Array.from({ length: startSpaces }, (_) => ' ').join('');
                // insert spread of dependencies with proper indentation
                return fixer.replaceTextRange(
                  dependenciesDeclaration.value.range,
                  `{\n${lineIndent}...${extendedClassName}.dependencies,\n${endIndent}}`,
                );
              },
            });
            return;
          }
          // dependencies are non-empty, try to find the correct spread
          let spreadedDepsIndex = -1;
          const spreadedDeps = value.properties.find((property, index) => {
            if (property.type !== 'SpreadElement') {
              return false;
            }
            const argument = property.argument;
            if (
              argument.object?.name === extendedClassName &&
              argument.property?.name === 'dependencies'
            ) {
              spreadedDepsIndex = index;
              return true;
            }
            return false;
          });
          // the parent dependencies are not spread
          if (!spreadedDeps) {
            context.report({
              node: value.properties[0],
              messageId: 'missingParentDependencies',
              fix(fixer) {
                const spaces = value.properties[0].loc.start.column;
                const indent = Array.from({ length: spaces }, (_) => ' ').join('');
                return fixer.insertTextBefore(
                  value.properties[0],
                  `...${extendedClassName}.dependencies,\n${indent}`,
                );
              },
            });
          } else if (spreadedDepsIndex !== 0) {
            // the parent dependencies *are* spread, but not at the beginning
            const spreadProperty = value.properties[spreadedDepsIndex];
            context.report({
              node: spreadProperty,
              messageId: 'missingParentDependencies',
              *fix(fixer) {
                // remove old
                const spreadSpaces = spreadProperty.loc.start.column;
                const [spreadStart, spreadEnd] = spreadProperty.range;
                // range = from start of the spread (...), include its indentation, - 1 to get onto the previous line
                // end of the spread (.dependencies) + 1 to include the trailing comma (assume it's there, otherwise it just mangles the formatting but doesn't break anything)
                yield fixer.removeRange([spreadStart - spreadSpaces - 1, spreadEnd + 1]);
                // add on top
                const spaces = value.properties[0].loc.start.column;
                const indent = Array.from({ length: spaces }, (_) => ' ').join('');
                yield fixer.insertTextBefore(
                  value.properties[0],
                  `...${extendedClassName}.dependencies,\n${indent}`,
                );
              },
            });
          }
        },
      };
    },
  },
};
