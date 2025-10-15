import { Expression, parseSync, Visitor } from 'oxc-parser';
import { basename, join, resolve } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { format } from 'prettier';

// these can be safely imported because they don't include any big / complicated stuff
import isLatestPatch from '../../src/game/isLatestPatch';
import GameBranch from '../../src/game/GameBranch';
import { isPresent } from '../../src/common/typeGuards';

function parseFile(path: string) {
  return parseSync(basename(path), readFileSync(path, { encoding: 'utf8' }));
}

const appRoot = resolve(import.meta.dirname, '..', '..');
const srcPath = join(appRoot, 'src');

const parserAst = parseFile(join(srcPath, 'parser/index.ts'));

const importedConfigs: string[] = [];

const importDecVisitor = new Visitor({
  ImportDeclaration(path) {
    if (path.source.value.startsWith('analysis')) {
      importedConfigs.push(path.source.value);
    }
  },
});
importDecVisitor.visit(parserAst.program);

const specs = importedConfigs
  .filter(isPresent)
  .map((configPath) => {
    const pathToFile = join(srcPath, configPath, 'CONFIG.tsx');
    const configAst = parseFile(pathToFile);

    const vars: Record<string, Expression | null> = {};
    let config: Expression | null = null;

    const configDecVisitor = new Visitor({
      VariableDeclaration(path) {
        for (const decl of path.declarations) {
          if (decl.id.type === 'Identifier') {
            vars[decl.id.name] = decl.init;
          }
        }
      },
      ExportDefaultDeclaration(path) {
        if (path.declaration.type === 'Identifier') {
          config = vars[path.declaration.name];
        } else if (path.declaration.type === 'ObjectExpression') {
          config = path.declaration;
        } else if (
          path.declaration.type === 'TSSatisfiesExpression' &&
          path.declaration.expression.type === 'ObjectExpression'
        ) {
          config = path.declaration.expression;
        }
      },
    });
    configDecVisitor.visit(configAst.program);

    if (!isPresent(config)) {
      console.warn('unable to locate config:', configPath);
      return null;
    }

    // stupid hack to fix config being narrowed to `never` at this point
    config = config as unknown as Expression;

    if (config.type !== 'ObjectExpression') {
      console.warn('config is not an object:', configPath);
      return null;
    }

    const cfg: {
      exampleReport?: string;
      patchCompatibility?: string;
      spec?: string;
      isPartial?: boolean;
      hasParser?: boolean;
    } = {};
    for (const property of config.properties) {
      if (property.type !== 'Property' || property.key.type !== 'Identifier') {
        // we are only examining plain object properties
        continue;
      }

      switch (property.key.name) {
        case 'exampleReport':
        case 'patchCompatibility':
          if (property.value.type === 'Literal' && typeof property.value.value === 'string') {
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
        default:
          break;
      }
    }

    const [expansion, className, specName] = configPath.split('/').slice(1);
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
  .filter(isPresent);

const rawTsFile = `
    // Generated file, changes will eventually be overwritten!

    ${specs.map((spec) => `export const ${spec!.fullName} = ${JSON.stringify(spec)};`).join('\n')}

    export const SUPPORTED_SPECS = [${specs.map((spec) => spec!.fullName).join(', ')}];
  `;
const formattedTsFile = await format(rawTsFile, { parser: 'typescript' });

const configDirectory = join(import.meta.dirname, '..', '..', 'e2e', 'generated');
if (!existsSync(configDirectory)) {
  mkdirSync(configDirectory);
}

const pathToWriteConfigs = join(configDirectory, 'supportedSpecs.ts');
writeFileSync(pathToWriteConfigs, formattedTsFile, {
  encoding: 'utf-8',
});
console.log(`Wrote specs file to ${pathToWriteConfigs}`);
