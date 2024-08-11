import { parse } from '@babel/parser';
import { join } from 'node:path';
import { format } from 'prettier';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
// these can be safely imported because they don't include any big / complicated stuff
import isLatestPatch from '../../src/game/isLatestPatch';
import GameBranch from '../../src/game/GameBranch';

const parseFile = (path: string): t.Node | t.Node[] =>
  parse(readFileSync(path, { encoding: 'utf8' }), {
    plugins: ['typescript', 'jsx'],
    sourceType: 'module',
  }) as unknown as t.Node | t.Node[];

// because of issues running this outside of the react/vite context, we're just going to use babel to parse out the bits that we need as if we're writing a macro rather than try to make the e2e build environment cooperate
export const generateConfigs = async () => {
  const srcPath = join(__dirname, '..', '..', 'src');

  const parserAst = parseFile(join(srcPath, 'parser/index.ts'));

  const importedConfigs: string[] = [];

  traverse(parserAst, {
    ImportDeclaration: (path) => {
      if (path.node.source.value.startsWith('analysis')) {
        importedConfigs.push(path.node.source.value);
      }
    },
  });

  const specs = importedConfigs
    .map((analyzerPath) => {
      const configAst = parseFile(join(srcPath, analyzerPath, 'CONFIG.tsx'));

      const vars: Record<string, t.ObjectExpression> = {};
      let config: t.ObjectExpression | undefined = undefined;

      traverse(configAst, {
        VariableDeclaration: (path) => {
          for (const decl of path.node.declarations) {
            if (decl.id.type === 'Identifier' && decl.init?.type === 'ObjectExpression') {
              vars[decl.id.name] = decl.init!;
            }
          }
        },
        ExportDefaultDeclaration: (path) => {
          if (path.node.declaration.type === 'Identifier') {
            config = vars[path.node.declaration.name];
          } else if (path.node.declaration.type === 'ObjectExpression') {
            config = path.node.declaration;
          }
        },
      });

      if (!config) {
        console.warn('unable to locate config', analyzerPath);
        return null;
      }

      // stupid hack to fix config being narrowed to `never` at this point
      config = config as unknown as t.ObjectExpression;

      const cfg: {
        exampleReport?: string;
        patchCompatibility?: string;
        spec?: string;
        isPartial?: boolean;
        hasParser?: boolean;
      } = {};
      for (const property of config.properties) {
        if (property.type !== 'ObjectProperty' || property.key.type !== 'Identifier') {
          // we are only examining plain object properties
          continue;
        }

        switch (property.key.name) {
          case 'exampleReport':
          case 'patchCompatibility':
            if (property.value.type === 'StringLiteral') {
              cfg[property.key.name] = property.value.value;
            }
            break;
          case 'spec':
            if (
              property.value.type === 'MemberExpression' &&
              property.value.property.type === 'Identifier'
            ) {
              cfg[property.key.name] = property.value.property.name;
            }
            break;
          case 'supportLevel':
            if (
              property.value.type === 'MemberExpression' &&
              property.value.property.type === 'Identifier'
            ) {
              cfg.isPartial = property.value.property.name === 'Unmaintained';
            }
            break;
          case 'parser':
            cfg.hasParser = true;
            break;
        }
      }

      const [expansion, className, specName] = analyzerPath.split('/').slice(1);
      const isClassic = expansion === 'classic';

      const isLatest =
        cfg.patchCompatibility &&
        isLatestPatch({
          patchCompatibility: cfg.patchCompatibility,
          branch: isClassic ? GameBranch.Classic : GameBranch.Retail,
        });

      if (!isLatest || !cfg.exampleReport || !cfg.hasParser) {
        return null;
      }

      return {
        name: `${specName} ${className}`,
        fullName: cfg.spec,
        exampleReport: cfg.exampleReport,
        isLatestPatch: isLatest,
        isClassic,
      };
    })
    .filter((x) => x !== null);
  const rawTsFile = `
  // Generated file, changes will eventually be overwritten!

  ${specs.map((spec) => `export const ${spec!.fullName} = ${JSON.stringify(spec)};`).join('\n')}

  export const SUPPORTED_SPECS = [${specs.map((spec) => spec!.fullName).join(', ')}];
`;
  const formattedTsFile = await format(rawTsFile, { parser: 'typescript' });

  const configDirectory = join(__dirname, '..', '..', 'e2e', 'generated');
  if (!existsSync(configDirectory)) {
    mkdirSync(configDirectory);
  }

  const pathToWriteConfigs = join(configDirectory, 'supportedSpecs.ts');
  writeFileSync(pathToWriteConfigs, formattedTsFile, {
    encoding: 'utf-8',
  });
  console.log(`Wrote specs file to ${pathToWriteConfigs}`);
};
