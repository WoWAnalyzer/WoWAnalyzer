import type { API, Collection, FileInfo, TSQualifiedName } from 'jscodeshift';

/**
 * Checks if a given qualified name matches `JSX.Element`.
 */
function isJsxElement(node: TSQualifiedName): boolean {
  return (
    node.left.type === 'Identifier' &&
    node.left.name === 'JSX' &&
    node.right.type === 'Identifier' &&
    node.right.name === 'Element'
  );
}

function addTopLevelTypeImport(j: API['jscodeshift'], root: Collection) {
  const program = root.find(j.Program).get('body', 0);

  const jsxReactImportDeclaration = j.importDeclaration(
    [j.importSpecifier(j.identifier('JSX'))],
    j.stringLiteral('react'),
    'type',
  );
  program.insertBefore(jsxReactImportDeclaration);
}

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const hasJsxElementQualifiedName =
    root.find(j.TSQualifiedName).filter((it) => isJsxElement(it.node)).length > 0;
  if (!hasJsxElementQualifiedName) {
    return root.toSource();
  }

  const existingImportTypesFromReact = root
    .find(j.ImportDeclaration, { importKind: 'type' })
    .filter((it) => it.node.source.value === 'react');
  const existingImportsFromReact = root
    .find(j.ImportDeclaration, { importKind: 'value' })
    .filter((it) => it.node.source.value === 'react');

  if (existingImportTypesFromReact.length > 0) {
    existingImportTypesFromReact.forEach((reactTypeDeclaration) => {
      j(reactTypeDeclaration).replaceWith(
        j.importDeclaration(
          [...(reactTypeDeclaration.node.specifiers ?? []), j.importSpecifier(j.identifier('JSX'))],
          reactTypeDeclaration.node.source,
        ),
      );
    });
  } else if (existingImportsFromReact.length > 0) {
    existingImportsFromReact.forEach((reactTypeDeclaration) => {
      j(reactTypeDeclaration).replaceWith(
        j.importDeclaration(
          [
            ...(reactTypeDeclaration.node.specifiers ?? []),
            j.importSpecifier(j.identifier('type JSX')),
          ],
          reactTypeDeclaration.node.source,
        ),
      );
    });
  } else {
    addTopLevelTypeImport(j, root);
  }

  return root.toSource();
}
