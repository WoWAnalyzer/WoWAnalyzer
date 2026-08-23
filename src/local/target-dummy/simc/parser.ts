import {
  SIMC_EQUIPMENT_SLOTS,
  WOW_CLASSES,
  type SimcAddonProvenance,
  type SimcEquipmentSlot,
  type SimcEquippedItem,
  type SimcProfileFailureCode,
  type SimcProfileParseResult,
  type SimcResult,
  type WowClass,
} from './contracts';

const MAX_PROFILE_BYTES = 256 * 1024;
const MAX_PROFILE_LINES = 10_000;
const MAX_PROFILE_LINE_LENGTH = 16 * 1024;

const EQUIPMENT_SLOTS = new Set<string>(SIMC_EQUIPMENT_SLOTS);
const CLASS_DECLARATIONS: Readonly<Record<string, WowClass>> = {
  ...Object.fromEntries(WOW_CLASSES.map((wowClass) => [wowClass, wowClass])),
  deathknight: 'death_knight',
  demonhunter: 'demon_hunter',
};
const SCALAR_KEYS = new Set(['level', 'race', 'region', 'server', 'role', 'spec', 'talents']);
const ALLOWED_ADDON_KEYS = new Set([
  'professions',
  'position',
  'thumbnail',
  'renown',
  'covenant',
  'soulbind',
  'zandalari_loa',
  'omnium_talents',
]);
const SAFE_INTEGER = /^(?:0|[1-9][0-9]*)$/u;

function failure(
  code: SimcProfileFailureCode,
  message: string,
  suggestedAction: string,
): SimcResult<never> {
  return { ok: false, error: { code, message, recoverable: true, suggestedAction } };
}

function malformed(message: string): SimcResult<never> {
  return failure(
    'SIMC_PROFILE_MALFORMED',
    message,
    'Run /simc in World of Warcraft again, then paste the complete addon output.',
  );
}

function parseInteger(value: string): number | undefined {
  if (!SAFE_INTEGER.test(value)) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= 0x7fffffff ? parsed : undefined;
}

function parseIntegerList(value: string | undefined): readonly number[] | undefined {
  if (value === undefined || value.length === 0) {
    return [];
  }
  const parts = value.split('/');
  if (parts.some((part) => part.length === 0)) {
    return undefined;
  }
  const parsed = parts.map(parseInteger);
  return parsed.some((entry) => entry === undefined) ? undefined : (parsed as number[]);
}

function unquote(value: string): string | undefined {
  if (!value.startsWith('"')) {
    return value;
  }
  if (!value.endsWith('"') || value.length < 2) {
    return undefined;
  }
  return value.slice(1, -1).replaceAll('\\"', '"').replaceAll('\\\\', '\\');
}

function hasInvalidUnicode(value: string): boolean {
  if (value.includes('\0') || value.includes('\uFFFD')) {
    return true;
  }
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (next < 0xdc00 || next > 0xdfff) {
        return true;
      }
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return true;
    }
  }
  return false;
}

function parseProvenance(
  line: string,
  provenance: Partial<SimcAddonProvenance>,
): Partial<SimcAddonProvenance> {
  const addon = /^#\s*SimC Addon\s+(.+?)\s*$/iu.exec(line);
  if (addon?.[1] !== undefined) {
    return { ...provenance, addonVersion: addon[1] };
  }
  const wow = /^#\s*WoW\s+([0-9]+(?:\.[0-9]+)*)\.([0-9]+)\s*,\s*TOC\s+([0-9]+)\s*$/iu.exec(line);
  if (wow === null) {
    return provenance;
  }
  const tocVersion = parseInteger(wow[3] ?? '');
  return {
    ...provenance,
    wowVersion: wow[1],
    wowBuild: wow[2],
    ...(tocVersion === undefined ? {} : { tocVersion }),
  };
}

function sameItem(left: SimcEquippedItem, right: SimcEquippedItem): boolean {
  const leftOptions = Object.entries(left.options);
  return (
    left.slot === right.slot &&
    left.itemId === right.itemId &&
    left.itemLevel === right.itemLevel &&
    left.enchantId === right.enchantId &&
    left.gemIds.join('/') === right.gemIds.join('/') &&
    left.bonusIds.join('/') === right.bonusIds.join('/') &&
    leftOptions.length === Object.keys(right.options).length &&
    leftOptions.every(([key, value]) => right.options[key] === value)
  );
}

function parseItem(
  slot: SimcEquipmentSlot,
  value: string,
  commentItemLevel: number | undefined,
): SimcResult<SimcEquippedItem> {
  const components = value.split(',');
  if (components.length < 2) {
    return malformed(`The active ${slot} equipment line is incomplete.`);
  }
  const entries = new Map<string, string>();
  for (const component of components.slice(1)) {
    const separator = component.indexOf('=');
    if (separator <= 0 || separator === component.length - 1) {
      return malformed(`The active ${slot} equipment line has an invalid option.`);
    }
    const key = component.slice(0, separator).trim();
    const optionValue = component.slice(separator + 1).trim();
    const previous = entries.get(key);
    if (previous !== undefined && previous !== optionValue) {
      return malformed(`The active ${slot} equipment line contains conflicting ${key} options.`);
    }
    entries.set(key, optionValue);
  }
  const options = Object.fromEntries(entries);
  const itemId = options.id === undefined ? undefined : parseInteger(options.id);
  if (itemId === undefined || itemId === 0) {
    return malformed(`The active ${slot} equipment line does not contain a valid item ID.`);
  }
  const explicitItemLevel = options.ilevel === undefined ? undefined : parseInteger(options.ilevel);
  if (options.ilevel !== undefined && explicitItemLevel === undefined) {
    return malformed(`The active ${slot} equipment line has an invalid item level.`);
  }
  const enchantId = options.enchant_id === undefined ? undefined : parseInteger(options.enchant_id);
  if (options.enchant_id !== undefined && enchantId === undefined) {
    return malformed(`The active ${slot} equipment line has an invalid enchant ID.`);
  }
  const gemIds = parseIntegerList(options.gem_id);
  const bonusIds = parseIntegerList(options.bonus_id);
  if (gemIds === undefined || bonusIds === undefined) {
    return malformed(`The active ${slot} equipment line contains an invalid numeric ID list.`);
  }
  return {
    ok: true,
    value: {
      slot,
      itemId,
      ...((explicitItemLevel ?? commentItemLevel) === undefined
        ? {}
        : { itemLevel: explicitItemLevel ?? commentItemLevel }),
      ...(enchantId === undefined ? {} : { enchantId }),
      gemIds,
      bonusIds,
      options,
    },
  };
}

function boundedLines(text: string): SimcResult<readonly string[]> {
  if (
    text.length > MAX_PROFILE_BYTES ||
    new TextEncoder().encode(text).byteLength > MAX_PROFILE_BYTES
  ) {
    return failure(
      'SIMC_PROFILE_TOO_LARGE',
      'The pasted SimulationCraft profile is larger than 256 KiB.',
      'Run /simc again and paste only the active character export.',
    );
  }
  if (hasInvalidUnicode(text)) {
    return malformed('The pasted profile contains invalid text characters.');
  }
  let lineCount = 1;
  let lineLength = 0;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '\n' || character === '\r') {
      if (character !== '\n' || text[index - 1] !== '\r') {
        lineCount += 1;
      }
      lineLength = 0;
    } else {
      lineLength += 1;
      if (lineLength > MAX_PROFILE_LINE_LENGTH) {
        return failure(
          'SIMC_PROFILE_TOO_LARGE',
          'The pasted SimulationCraft profile exceeds the supported line limits.',
          'Run /simc again and paste only the active character export.',
        );
      }
    }
    if (lineCount > MAX_PROFILE_LINES) {
      return failure(
        'SIMC_PROFILE_TOO_LARGE',
        'The pasted SimulationCraft profile exceeds the supported line limits.',
        'Run /simc again and paste only the active character export.',
      );
    }
  }
  return {
    ok: true,
    value: text.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n'),
  };
}

export function parseSimcAddonProfile(text: string): SimcProfileParseResult {
  const bounded = boundedLines(text);
  if (!bounded.ok) {
    return bounded;
  }

  let provenance: Partial<SimcAddonProvenance> = {};
  let character: { readonly class: WowClass; readonly name: string } | undefined;
  const scalars = new Map<string, string>();
  const equipment = new Map<SimcEquipmentSlot, SimcEquippedItem>();
  let precedingItemLevel: number | undefined;

  for (const sourceLine of bounded.value) {
    const line = sourceLine.trim();
    if (line.length === 0) {
      precedingItemLevel = undefined;
      continue;
    }
    if (line.startsWith('#')) {
      provenance = parseProvenance(line, provenance);
      const itemComment = /^#\s*.+\s+\(([0-9]+)\)\s*$/u.exec(line);
      precedingItemLevel =
        itemComment?.[1] === undefined ? undefined : parseInteger(itemComment[1]);
      continue;
    }

    const separator = line.indexOf('=');
    if (separator <= 0) {
      return malformed('The pasted profile contains an invalid active line.');
    }
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    const wowClass = CLASS_DECLARATIONS[key];
    if (wowClass !== undefined) {
      const name = unquote(rawValue);
      if (name === undefined || name.length === 0) {
        return malformed('The active character declaration has an invalid name.');
      }
      if (character !== undefined) {
        return failure(
          'SIMC_MULTIPLE_ACTIVE_CHARACTERS',
          'The pasted profile contains more than one active character declaration.',
          'Paste the output from one /simc window without combining profiles.',
        );
      }
      character = { class: wowClass, name };
      precedingItemLevel = undefined;
      continue;
    }
    if (EQUIPMENT_SLOTS.has(key)) {
      const slot = key as SimcEquipmentSlot;
      const parsed = parseItem(slot, rawValue, precedingItemLevel);
      if (!parsed.ok) {
        return parsed;
      }
      const previous = equipment.get(slot);
      if (previous !== undefined && !sameItem(previous, parsed.value)) {
        return malformed(`The pasted profile contains conflicting active ${slot} lines.`);
      }
      equipment.set(slot, parsed.value);
      precedingItemLevel = undefined;
      continue;
    }
    precedingItemLevel = undefined;
    if (SCALAR_KEYS.has(key)) {
      const value = unquote(rawValue);
      if (value === undefined || value.length === 0) {
        return malformed(`The active ${key} field is invalid.`);
      }
      const previous = scalars.get(key);
      if (previous !== undefined && previous !== value) {
        return malformed(`The pasted profile contains conflicting active ${key} fields.`);
      }
      scalars.set(key, value);
      continue;
    }
    if (ALLOWED_ADDON_KEYS.has(key)) {
      continue;
    }
    return failure(
      'SIMC_PROFILE_NOT_ADDON_EXPORT',
      'The pasted text contains active SimulationCraft instructions outside the supported addon character export.',
      'Paste the complete text produced directly by the SimulationCraft addon /simc command.',
    );
  }

  const requiredScalars = ['level', 'race', 'region', 'server', 'spec', 'talents'] as const;
  const missing = requiredScalars.filter((key) => scalars.get(key) === undefined);
  if (provenance.addonVersion === undefined) {
    return failure(
      'SIMC_PROFILE_NOT_ADDON_EXPORT',
      'The pasted text is missing the SimulationCraft addon provenance header.',
      'Paste the complete text produced directly by the SimulationCraft addon /simc command.',
    );
  }
  if (character === undefined || missing.length > 0 || equipment.size === 0) {
    return failure(
      'SIMC_MISSING_REQUIRED_FIELD',
      'The pasted profile is missing required active character, talent, or equipment information.',
      'Run /simc on the matching character and copy the entire output.',
    );
  }
  const level = parseInteger(scalars.get('level') ?? '');
  if (level === undefined || level === 0) {
    return malformed('The active character level is invalid.');
  }
  return {
    ok: true,
    value: {
      provenance: provenance as SimcAddonProvenance,
      characterName: character.name,
      class: character.class,
      level,
      race: scalars.get('race') ?? '',
      region: scalars.get('region') ?? '',
      server: scalars.get('server') ?? '',
      spec: scalars.get('spec') ?? '',
      talentExport: scalars.get('talents') ?? '',
      equipment: [...equipment.values()],
    },
  };
}
