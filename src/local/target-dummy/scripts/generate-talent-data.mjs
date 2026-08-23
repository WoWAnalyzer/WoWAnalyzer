#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { format } from 'oxfmt';

const WAGO_LATEST_BUILDS_URL = 'https://wago.tools/api/builds/latest';
const RAIDBOTS_DATA_BASE_URL = 'https://www.raidbots.com/static/data';
const DEFAULT_OUTPUT = 'src/local/target-dummy/combatant-info/data/generated.ts';
const SCHEMA_ID = 'retail-12.1.0-project-1-log-22';
const SERIALIZATION_VERSION = 2;
const REQUIRED_SPEC_IDS = [
  62, 63, 64, 65, 66, 70, 71, 72, 73, 102, 103, 104, 105, 250, 251, 252, 253, 254, 255, 256, 257,
  258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 577, 581, 1467, 1468, 1473, 1480,
];
const NODE_COLLECTIONS = ['classNodes', 'specNodes', 'heroNodes', 'subTreeNodes'];
const NODE_TYPES = { single: 0, tiered: 1, choice: 2, subtree: 3 };

function usage() {
  return `Generate the checked-in talent decoder data used by COMBATANT_INFO.

Usage:
  node src/local/target-dummy/scripts/generate-talent-data.mjs
  node src/local/target-dummy/scripts/generate-talent-data.mjs --check
  node src/local/target-dummy/scripts/generate-talent-data.mjs --build 12.1.0.69273

Options:
  --build <version>  Use a specific Raidbots build instead of discovering live retail.
  --output <file>    Write somewhere other than ${DEFAULT_OUTPUT}.
  --check            Fail if the generated output differs; do not write it.
  --help             Show this help.

Without --build, the script discovers the current production retail build from
Wago's "wow" product, then downloads Raidbots' resolved live talent data. PTR,
beta, and test products are never selected. If Raidbots trails the current
client build, generation is allowed only within the same WoW patch version.`;
}

function parseArguments(arguments_) {
  const options = { check: false, output: DEFAULT_OUTPUT };
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === '--help') return { ...options, help: true };
    if (argument === '--check') {
      options.check = true;
      continue;
    }
    if (argument === '--build' || argument === '--output') {
      const value = arguments_[index + 1];
      if (value === undefined || value.startsWith('--')) {
        throw new Error(`${argument} requires a value.`);
      }
      if (argument === '--build') options.build = value;
      else options.output = value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown option: ${argument}`);
  }
  return options;
}

function assertObject(value, description) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${description} is not an object.`);
  }
  return value;
}

function requireString(object, key, description) {
  const value = object[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${description}.${key} is not a non-empty string.`);
  }
  return value;
}

function requireInteger(object, key, description) {
  const value = object[key];
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${description}.${key} is not a non-negative integer.`);
  }
  return value;
}

function wowPatch(build) {
  const match = /^(\d+)\.(\d+)\.(\d+)\.\d+$/u.exec(build);
  if (match === null) throw new Error(`Invalid WoW build '${build}'.`);
  return `${match[1]}.${match[2]}.${match[3]}`;
}

async function downloadJson(url, description) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'wowanalyzer-target-dummy-talent-generator',
    },
  });
  if (!response.ok) {
    throw new Error(
      `Could not download ${description}: ${String(response.status)} ${response.statusText}`,
    );
  }
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Downloaded ${description} is not valid JSON.`, {
      cause: error,
    });
  }
}

async function discoverCurrentRetailBuild() {
  const response = assertObject(
    await downloadJson(WAGO_LATEST_BUILDS_URL, "Wago's latest-build feed"),
    'Wago latest-build response',
  );
  const retail = assertObject(response.wow, 'Wago latest-build response.wow');
  if (requireString(retail, 'product', 'Wago retail product') !== 'wow') {
    throw new Error("Wago's production retail product was not named 'wow'.");
  }
  return requireString(retail, 'version', 'Wago retail product');
}

async function loadSource(options) {
  if (options.build !== undefined) {
    const build = options.build;
    wowPatch(build);
    const talentsUrl = `${RAIDBOTS_DATA_BASE_URL}/${encodeURIComponent(build)}/talents.json`;
    return {
      currentRetailBuild: build,
      dataBuild: build,
      generatedAt: 'unknown',
      metadataUrl: `${RAIDBOTS_DATA_BASE_URL}/${encodeURIComponent(build)}/metadata.json`,
      talentsUrl,
      talents: await downloadJson(talentsUrl, `Raidbots talents for ${build}`),
    };
  }

  const [currentRetailBuild, rawMetadata] = await Promise.all([
    discoverCurrentRetailBuild(),
    downloadJson(`${RAIDBOTS_DATA_BASE_URL}/live/metadata.json`, 'Raidbots live metadata'),
  ]);
  const metadata = assertObject(rawMetadata, 'Raidbots live metadata');
  if (requireString(metadata, 'environment', 'Raidbots live metadata') !== 'live') {
    throw new Error('Raidbots live metadata did not identify the live environment.');
  }
  const dataBuild = requireString(metadata, 'wowBuild', 'Raidbots live metadata');
  if (wowPatch(dataBuild) !== wowPatch(currentRetailBuild)) {
    throw new Error(
      `Raidbots live talent data is for ${dataBuild}, but production retail is ${currentRetailBuild}. Refusing to mix different WoW patch versions.`,
    );
  }
  const contentHash = requireString(metadata, 'contentHash', 'Raidbots live metadata');
  const files = metadata.files;
  if (!Array.isArray(files) || !files.includes('talents.json')) {
    throw new Error('Raidbots live metadata does not advertise talents.json.');
  }
  const talentsUrl = `${RAIDBOTS_DATA_BASE_URL}/${encodeURIComponent(contentHash)}/talents.json`;
  return {
    currentRetailBuild,
    dataBuild,
    generatedAt: requireString(metadata, 'generatedAt', 'Raidbots live metadata'),
    metadataUrl: `${RAIDBOTS_DATA_BASE_URL}/live/metadata.json`,
    talentsUrl,
    talents: await downloadJson(talentsUrl, 'Raidbots live talents'),
  };
}

function packedNode(node, nodeId, specId) {
  if (node === undefined) return [nodeId, 0, 0, []];
  const description = `talent data for spec ${String(specId)}, node ${String(nodeId)}`;
  const type = node.type;
  const nodeType = NODE_TYPES[type];
  if (nodeType === undefined) {
    throw new Error(`${description} has unsupported type '${String(type)}'.`);
  }
  if (!Array.isArray(node.entries)) {
    throw new Error(`${description}.entries is not an array.`);
  }
  const entries = node.entries
    .map((entry, index) => {
      const entryObject = assertObject(entry, `${description}.entries[${String(index)}]`);
      const id = entryObject.id;
      if (id === undefined) return undefined;
      if (!Number.isSafeInteger(id) || id <= 0) {
        throw new Error(`${description} has an invalid entry ID.`);
      }
      const maxRanks = entryObject.maxRanks ?? (type === 'subtree' ? 1 : 0);
      if (!Number.isSafeInteger(maxRanks) || maxRanks <= 0) {
        throw new Error(`${description}, entry ${String(id)} has invalid maxRanks.`);
      }
      const indexValue = entryObject.index ?? index * 100;
      if (!Number.isSafeInteger(indexValue)) {
        throw new Error(`${description}, entry ${String(id)} has an invalid index.`);
      }
      return { id, maxRanks, index: indexValue };
    })
    .filter((entry) => entry !== undefined)
    .sort((left, right) => left.index - right.index || left.id - right.id);

  if (entries.length === 0) return [nodeId, 0, nodeType, []];
  const maxRanks =
    node.maxRanks ??
    (type === 'tiered'
      ? entries.reduce((total, entry) => total + entry.maxRanks, 0)
      : Math.max(...entries.map((entry) => entry.maxRanks)));
  if (!Number.isSafeInteger(maxRanks) || maxRanks <= 0) {
    throw new Error(`${description}.maxRanks is invalid.`);
  }
  const entryIds = entries.map((entry) => entry.id);
  if (type === 'tiered') {
    return [nodeId, maxRanks, nodeType, entryIds, entries.map((entry) => entry.maxRanks)];
  }
  return [nodeId, maxRanks, nodeType, entryIds];
}

function buildPackedSpecs(rawTalents) {
  if (!Array.isArray(rawTalents)) {
    throw new Error('Raidbots talents.json is not an array.');
  }
  const bySpec = new Map();
  for (const [index, rawTree] of rawTalents.entries()) {
    const tree = assertObject(rawTree, `talents[${String(index)}]`);
    const specId = requireInteger(tree, 'specId', `talents[${String(index)}]`);
    if (bySpec.has(specId)) {
      throw new Error(`Raidbots talents.json contains spec ${String(specId)} twice.`);
    }
    bySpec.set(specId, tree);
  }

  const packedSpecs = {};
  for (const specId of REQUIRED_SPEC_IDS) {
    const tree = bySpec.get(specId);
    if (tree === undefined) {
      throw new Error(`Raidbots talents.json is missing required spec ${String(specId)}.`);
    }
    if (!Array.isArray(tree.fullNodeOrder) || tree.fullNodeOrder.length === 0) {
      throw new Error(`Spec ${String(specId)} has no fullNodeOrder.`);
    }
    const nodeOrder = tree.fullNodeOrder.map((nodeId, index) => {
      if (!Number.isSafeInteger(nodeId) || nodeId <= 0) {
        throw new Error(`Spec ${String(specId)} fullNodeOrder[${String(index)}] is invalid.`);
      }
      return nodeId;
    });
    if (new Set(nodeOrder).size !== nodeOrder.length) {
      throw new Error(`Spec ${String(specId)} fullNodeOrder contains duplicates.`);
    }
    for (let index = 1; index < nodeOrder.length; index += 1) {
      if (nodeOrder[index - 1] >= nodeOrder[index]) {
        throw new Error(`Spec ${String(specId)} fullNodeOrder is not ascending.`);
      }
    }

    const nodes = new Map();
    for (const collectionName of NODE_COLLECTIONS) {
      const collection = tree[collectionName];
      if (!Array.isArray(collection)) {
        throw new Error(`Spec ${String(specId)}.${collectionName} is not an array.`);
      }
      for (const rawNode of collection) {
        const node = assertObject(rawNode, `Spec ${String(specId)}.${collectionName} entry`);
        const nodeId = requireInteger(node, 'id', `Spec ${String(specId)}.${collectionName} entry`);
        if (nodes.has(nodeId)) {
          throw new Error(`Spec ${String(specId)} repeats node ${String(nodeId)}.`);
        }
        nodes.set(nodeId, node);
      }
    }
    for (const nodeId of nodes.keys()) {
      if (!nodeOrder.includes(nodeId)) {
        throw new Error(
          `Spec ${String(specId)} node ${String(nodeId)} is absent from fullNodeOrder.`,
        );
      }
    }
    packedSpecs[String(specId)] = nodeOrder.map((nodeId) =>
      packedNode(nodes.get(nodeId), nodeId, specId),
    );
  }
  return packedSpecs;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function renderGeneratedModule(source, output) {
  const packedSpecs = buildPackedSpecs(source.talents);
  const serializedSpecs = Object.entries(packedSpecs)
    .map(([specId, nodes]) => `  ${specId}: ${JSON.stringify(nodes)},`)
    .join('\n');
  const sourceJson = JSON.stringify(source.talents);
  const generated = `// This file is generated by src/local/target-dummy/scripts/generate-talent-data.mjs. Do not edit it.
// Retail build feed: ${WAGO_LATEST_BUILDS_URL}
// Source metadata: ${source.metadataUrl}
// Source talents: ${source.talentsUrl}

export const GENERATED_TALENT_DATA_PROVENANCE = {
  source: "Raidbots resolved talent data",
  environment: "live",
  currentRetailBuild: ${JSON.stringify(source.currentRetailBuild)},
  dataBuild: ${JSON.stringify(source.dataBuild)},
  wowVersion: ${JSON.stringify(wowPatch(source.dataBuild))},
  generatedAt: ${JSON.stringify(source.generatedAt)},
  sourceSha256: ${JSON.stringify(sha256(sourceJson))},
  schemaId: ${JSON.stringify(SCHEMA_ID)},
  serializationVersion: ${String(SERIALIZATION_VERSION)},
  specCount: ${String(Object.keys(packedSpecs).length)},
} as const;

export const GENERATED_TALENT_TREES = {
${serializedSpecs}
} as const;
`;
  const formatted = await format(output, generated);
  if (formatted.errors.length > 0) {
    throw new Error('Could not format the generated talent snapshot.');
  }
  return formatted.code;
}

async function writeGeneratedFile(output, content, check) {
  const absoluteOutput = path.resolve(output);
  let existing;
  try {
    existing = await readFile(absoluteOutput, 'utf8');
  } catch (error) {
    if (error === null || typeof error !== 'object' || error.code !== 'ENOENT') {
      throw error;
    }
  }
  if (existing === content) return 'unchanged';
  if (check) {
    throw new Error(`${path.relative(process.cwd(), absoluteOutput)} is out of date.`);
  }
  await mkdir(path.dirname(absoluteOutput), { recursive: true });
  const temporaryOutput = `${absoluteOutput}.${String(process.pid)}.tmp`;
  await writeFile(temporaryOutput, content, 'utf8');
  await rename(temporaryOutput, absoluteOutput);
  return 'updated';
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  const source = await loadSource(options);
  const content = await renderGeneratedModule(source, options.output);
  const result = await writeGeneratedFile(options.output, content, options.check);
  const lag =
    source.currentRetailBuild === source.dataBuild
      ? ''
      : ` (resolved talent data build ${source.dataBuild})`;
  process.stdout.write(
    `${result}: ${options.output} for production retail ${source.currentRetailBuild}${lag}; ${String(REQUIRED_SPEC_IDS.length)} specs.\n`,
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Talent data generation failed: ${message}\n`);
  process.exitCode = 1;
});
