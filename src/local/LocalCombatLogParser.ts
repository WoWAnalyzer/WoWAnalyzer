import {
  EventType,
  ResourceActor,
  type Ability,
  type AbsorbedEvent,
  type ApplyBuffEvent,
  type ApplyBuffStackEvent,
  type ApplyDebuffEvent,
  type ApplyDebuffStackEvent,
  type AnyEvent,
  type BaseCastEvent,
  type BeginChannelEvent,
  type CombatantInfoEvent,
  type DamageEvent,
  type DispelEvent,
  type DrainEvent,
  type HealEvent,
  type InterruptEvent,
  type RefreshBuffEvent,
  type RefreshDebuffEvent,
  type RemoveBuffEvent,
  type RemoveBuffStackEvent,
  type RemoveDebuffEvent,
  type RemoveDebuffStackEvent,
  type ResourceChangeEvent,
  type ResurrectEvent,
  type SpellstealEvent,
  type SummonEvent,
} from 'parser/core/Events';
import type { WCLFight } from 'parser/core/Fight';
import type Report from 'parser/core/Report';
import { getSpecMetadata, type SpecRole } from 'game/getSpecMetadata';

export interface LocalDiagnostic {
  line: number;
  message: string;
  severity: 'warning' | 'error';
}
export interface LocalActor {
  id: number;
  guid: string;
  name: string;
  flags: number;
  friendly: boolean;
  pet?: boolean;
  ownerId?: number;
  className?: string;
  fightIds: number[];
  fightDetails: Record<
    number,
    { specID: number; role?: SpecRole; className?: string; combatant: CombatantInfoEvent }
  >;
}
export interface LocalImportResult {
  report: Report;
  events: AnyEvent[];
  actors: LocalActor[];
  diagnostics: LocalDiagnostic[];
}
export class LocalCombatLogParseError extends Error {
  constructor(
    message: string,
    readonly diagnostics: LocalDiagnostic[] = [],
    readonly line?: number,
  ) {
    super(line ? `${message} (line ${line})` : message);
    this.name = 'LocalCombatLogParseError';
  }
}

/** RFC4180-ish tokenizer. Combat log names can contain commas and escaped quotes. */
export function decodeCsvLine(line: string): string[] {
  const fields: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        field += char;
        i += 1;
      } else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      fields.push(field);
      field = '';
    } else field += char;
  }
  fields.push(field);
  return fields;
}
/**
 * Native WoW files use `8/17 12:34:56.789  EVENT,...`; fixtures and some
 * exporters use a comma after an ISO-like timestamp. Normalize both before
 * applying the CSV tokenizer.
 */
export function decodeCombatLogLine(line: string): string[] {
  line = line.replace(/^\uFEFF/, '');
  const native = line.match(/^(\d{1,2}\/\d{1,2}(?:\/\d{4})? \d{2}:\d{2}:\d{2}\.\d{3,4})\s+(.*)$/);
  return native ? [native[1], ...decodeCsvLine(native[2])] : decodeCsvLine(line);
}
export function parseCombatLogTimestamp(value: string): number | null {
  const m = value.match(/^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);
  if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6], +m[7]);
  const native = value.match(
    /^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))? (\d{2}):(\d{2}):(\d{2})\.(\d{3,4})$/,
  );
  // Retail currently writes ten-thousandths, while Date only stores milliseconds.
  return native
    ? Date.UTC(
        +(native[3] ?? new Date().getUTCFullYear()),
        +native[1] - 1,
        +native[2],
        +native[4],
        +native[5],
        +native[6],
        +native[7].slice(0, 3),
      )
    : null;
}
export async function* readCombatLogLines(
  file: File,
  signal?: AbortSignal,
): AsyncGenerator<{ line: string; lineNumber: number; bytesRead: number }> {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder();
  let buffered = '';
  let lineNumber = 0;
  let bytesRead = 0;
  try {
    while (true) {
      if (signal?.aborted) throw new DOMException('Import cancelled', 'AbortError');
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.byteLength;
      buffered += decoder.decode(value, { stream: true });
      let end: number;
      while ((end = buffered.indexOf('\n')) !== -1) {
        const line = buffered.slice(0, end).replace(/\r$/, '');
        buffered = buffered.slice(end + 1);
        lineNumber += 1;
        yield { line, lineNumber, bytesRead };
      }
    }
    buffered += decoder.decode();
    if (buffered) {
      lineNumber += 1;
      yield { line: buffered.replace(/\r$/, ''), lineNumber, bytesRead };
    }
  } finally {
    reader.releaseLock();
  }
}

const number = (value: string | undefined) => {
  if (!value || value === 'nil') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
const isFriendly = (flags: number) => (flags & 0x00000010) !== 0 || (flags & 0x00000400) !== 0;
const isGuid = (value: string | undefined) =>
  Boolean(value && /^(?:Player|Creature|Pet|Vehicle|GameObject)-/.test(value));
const isEmptyGuid = (value: string | undefined) => value === '0000000000000000';
const hasNativeActorFields = (fields: string[]) =>
  (isGuid(fields[2]) && (isGuid(fields[6]) || isEmptyGuid(fields[6]))) || isGuid(fields[6]);
const sourceFields = (fields: string[]) => ({ guid: fields[2], name: fields[3], flags: fields[4] });
const targetFields = (fields: string[]) =>
  hasNativeActorFields(fields)
    ? { guid: fields[6], name: fields[7], flags: fields[8] }
    : { guid: fields[5], name: fields[6], flags: fields[7] };
const spellFields = (fields: string[], event: string) =>
  hasNativeActorFields(fields)
    ? // Swing events start their damage payload immediately after the target
      // flags; those values are not an ability ID/name/school tuple.
      /^SWING_/.test(event)
      ? {
          id: undefined,
          name: undefined,
          school: undefined,
          auraType: undefined,
          amount: fields[10],
          stack: fields[10],
        }
      : {
          id: fields[10],
          name: fields[11],
          school: fields[12],
          auraType: fields[13],
          amount: fields[14],
          stack: fields[14],
        }
    : {
        id: fields[8],
        name: fields[9],
        school: fields[10],
        auraType: fields[11],
        amount: fields[12],
        stack: fields[12],
      };

interface AdvancedActorState {
  suffixStart: number;
  resourceActor: ResourceActor;
  classResources: { type: number; amount: number; max: number; cost: number }[];
  hitPoints: number;
  maxHitPoints: number;
  attackPower: number;
  spellPower: number;
  armor: number;
  absorb: number;
  x: number;
  y: number;
  mapID: number;
  facing: number;
  itemLevel: number;
}

/**
 * Decode the 19-column advanced actor-state block used by Retail v22. The
 * block follows the spell tuple, or the target flags for swing events. It is
 * optional on several event families, so its GUID is used as the discriminator.
 */
const advancedActorState = (
  fields: string[],
  event: string,
  source?: LocalActor,
  target?: LocalActor,
): AdvancedActorState | undefined => {
  if (!hasNativeActorFields(fields)) return undefined;
  const start = /^SWING_/.test(event) ? 10 : 13;
  const infoGuid = fields[start];
  if ((!isGuid(infoGuid) && !isEmptyGuid(infoGuid)) || fields.length < start + 19) return undefined;

  const resourceType = number(fields[start + 10]);
  const currentPower = number(fields[start + 11]);
  const maxPower = number(fields[start + 12]);
  const powerCost = number(fields[start + 13]) ?? 0;
  const classResources =
    resourceType !== undefined && currentPower !== undefined && maxPower !== undefined
      ? [{ type: resourceType, amount: currentPower, max: maxPower, cost: powerCost }]
      : [];

  return {
    suffixStart: start + 19,
    resourceActor:
      source && infoGuid === source.guid
        ? ResourceActor.Source
        : target && infoGuid === target.guid
          ? ResourceActor.Target
          : ResourceActor.Target,
    classResources,
    hitPoints: number(fields[start + 2]) ?? 0,
    maxHitPoints: number(fields[start + 3]) ?? 0,
    attackPower: number(fields[start + 4]) ?? 0,
    spellPower: number(fields[start + 5]) ?? 0,
    armor: number(fields[start + 6]) ?? 0,
    absorb: number(fields[start + 7]) ?? 0,
    x: number(fields[start + 14]) ?? 0,
    y: number(fields[start + 15]) ?? 0,
    mapID: number(fields[start + 16]) ?? 0,
    facing: number(fields[start + 17]) ?? 0,
    itemLevel: number(fields[start + 18]) ?? 0,
  };
};

const eventPayloadStart = (fields: string[], event: string, advanced?: AdvancedActorState) =>
  advanced?.suffixStart ??
  (hasNativeActorFields(fields)
    ? /^SWING_/.test(event)
      ? 10
      : 13
    : /^SWING_/.test(event)
      ? 8
      : 11);

interface LocalResourceChange {
  resourceChange: number;
  waste: number;
  resourceChangeType: number;
  otherResourceChange: number;
  resourceActor: ResourceActor;
  classResources: { type: number; amount: number; max: number }[];
}

/**
 * v22 places the advanced actor snapshot before an event's normal payload.
 * For SPELL_ENERGIZE the last four columns are consistently gain, waste,
 * power type, and maximum power. The snapshot immediately before it contains
 * the current value, which lets ResourceTracker draw an accurate graph.
 */
const localResourceChange = (
  fields: string[],
  source?: LocalActor,
  target?: LocalActor,
  advanced?: AdvancedActorState,
): LocalResourceChange => {
  const start = eventPayloadStart(fields, 'SPELL_ENERGIZE', advanced);
  const resourceChange = number(fields[start]) ?? 0;
  const waste = number(fields[start + 1]) ?? 0;
  const resourceChangeType = number(fields[start + 2]) ?? 0;
  const max = number(fields[start + 3]) ?? 0;
  const matchingResource = advanced?.classResources.find(
    (resource) => resource.type === resourceChangeType,
  );

  return {
    resourceChange,
    waste,
    resourceChangeType,
    otherResourceChange: 0,
    // Local player energizes commonly have identical source/target IDs. In
    // that case Source is the useful convention for cast/resource analyzers.
    resourceActor:
      advanced?.resourceActor ??
      (target && target !== source ? ResourceActor.Target : ResourceActor.Source),
    classResources:
      matchingResource !== undefined
        ? [
            {
              type: matchingResource.type,
              amount: matchingResource.amount,
              max: matchingResource.max,
            },
          ]
        : max > 0
          ? [{ type: resourceChangeType, amount: 0, max }]
          : [],
  };
};
const ignored = new Set(['ZONE_CHANGE', 'COMBAT_LOG_VERSION', 'ENCOUNTER_START', 'ENCOUNTER_END']);
const supportedEvents = new Set([
  'COMBATANT_INFO',
  'SWING_DAMAGE',
  'RANGE_DAMAGE',
  'SPELL_DAMAGE',
  'SPELL_PERIODIC_DAMAGE',
  'SPELL_HEAL',
  'SPELL_PERIODIC_HEAL',
  'SPELL_CAST_START',
  'SPELL_CAST_SUCCESS',
  'SPELL_CHANNEL_START',
  'SPELL_CHANNEL_STOP',
  'SPELL_EMPOWER_START',
  'SPELL_EMPOWER_END',
  'SPELL_AURA_APPLIED',
  'SPELL_AURA_REFRESH',
  'SPELL_AURA_REMOVED',
  'SPELL_AURA_APPLIED_DOSE',
  'SPELL_AURA_REMOVED_DOSE',
  'SPELL_ENERGIZE',
  'SPELL_DRAIN',
  'SPELL_LEECH',
  'SPELL_SUMMON',
  'SPELL_INTERRUPT',
  'SPELL_DISPEL',
  'SPELL_STOLEN',
  'SPELL_ABSORBED',
  'UNIT_DIED',
  'UNIT_DESTROYED',
  'SPELL_INSTAKILL',
  'SPELL_RESURRECT',
]);

class Discovery {
  readonly diagnostics: LocalDiagnostic[] = [];
  readonly actors = new Map<string, LocalActor>();
  readonly fights: WCLFight[] = [];
  version = false;
  build = false;
  active: WCLFight | undefined;
  start = Infinity;
  end = 0;
  nextActorId = 1;
  nextFightId = 1;
  combatantCount = 0;

  addDiagnostic(diagnostic: LocalDiagnostic) {
    if (this.diagnostics.length < 100) {
      this.diagnostics.push(diagnostic);
    }
  }

  actor(
    guid: string | undefined,
    name: string | undefined,
    flags: string | undefined,
  ): LocalActor | undefined {
    // Never turn zone names, raid flags, nil, or numeric combat-info fields
    // into actors. Native v22 has four source/target flag columns.
    if (!guid || !isGuid(guid)) return undefined;
    let result = this.actors.get(guid);
    if (!result) {
      const parsedFlags = Number(flags) || 0;
      result = {
        id: this.nextActorId++,
        guid,
        name: name || 'Unknown',
        flags: parsedFlags,
        friendly: isFriendly(parsedFlags) || guid.startsWith('Player-'),
        fightIds: [],
        fightDetails: {},
      };
      this.actors.set(guid, result);
    } else {
      const parsedFlags = Number(flags) || 0;
      const hasRealName = name && name !== 'nil' && !/^\d+(?:\.\d+)?$/.test(name);
      if (hasRealName && (result.name === 'Unknown' || /^\d+(?:\.\d+)?$/.test(result.name))) {
        result.name = name;
      }
      if (parsedFlags && (!result.flags || isFriendly(parsedFlags))) {
        result.flags = parsedFlags;
        result.friendly = isFriendly(parsedFlags) || guid.startsWith('Player-');
      }
    }
    return result;
  }
  line(fields: string[], line: number) {
    // A few exporters put COMBAT_LOG_VERSION on a bare first line. Keep the
    // internal field positions consistent with timestamped records.
    if (fields[0] === 'COMBAT_LOG_VERSION') fields.unshift('');
    const event = fields[1];
    if (event === 'COMBAT_LOG_VERSION') {
      // The client has emitted both `project,format` and `format,project` here
      // across Retail builds. The pair is the invariant, not its ordering.
      const versionFields = new Set(fields.slice(2));
      const build = fields.find((value) => /^12\.1\.\d+/.test(value));
      this.version = versionFields.has('1') && versionFields.has('22');
      this.build = !build || /^12\.1\./.test(build);
      if (!this.version)
        throw new LocalCombatLogParseError(
          'Only Retail advanced combat logs (project 1, format 22) are supported.',
          [],
          line,
        );
      if (!this.build)
        throw new LocalCombatLogParseError(
          'Only Retail 12.1.x combat logs are supported.',
          [],
          line,
        );
      return;
    }
    const timestamp = parseCombatLogTimestamp(fields[0]);
    if (timestamp === null) {
      this.addDiagnostic({
        line,
        severity: 'warning',
        message: 'Skipped record with an invalid timestamp.',
      });
      return;
    }
    this.start = Math.min(this.start, timestamp);
    this.end = Math.max(this.end, timestamp);
    if (event === 'ENCOUNTER_START') {
      if (this.active) {
        this.active.end_time = timestamp;
        this.active.kill = false;
        this.fights.push(this.active);
        this.addDiagnostic({
          line,
          severity: 'warning',
          message: 'Overlapping encounter closed as a wipe.',
        });
      }
      this.active = {
        id: this.nextFightId++,
        start_time: timestamp,
        end_time: timestamp,
        boss: Number(fields[2]) || 0,
        name: fields[3] || 'Unknown encounter',
        difficulty: number(fields[4]),
        size: number(fields[5]),
        kill: false,
      };
      return;
    }
    if (event === 'ENCOUNTER_END') {
      if (this.active) {
        this.active.end_time = timestamp;
        this.active.kill =
          (fields.length >= 7 ? fields[6] : fields[4]) === '1' ||
          (fields.length >= 7 ? fields[6] : fields[4]) === 'SUCCESS';
        this.fights.push(this.active);
        this.active = undefined;
      }
      return;
    }
    const sourceInfo = sourceFields(fields);
    const targetInfo = targetFields(fields);
    const source = this.actor(sourceInfo.guid, sourceInfo.name, sourceInfo.flags);
    const target = this.actor(targetInfo.guid, targetInfo.name, targetInfo.flags);
    if (event === 'SPELL_ABSORBED') {
      const absorberStart = hasNativeActorFields(fields) ? 13 : 11;
      const absorber = this.actor(
        fields[absorberStart],
        fields[absorberStart + 1],
        fields[absorberStart + 2],
      );
      if (this.active && absorber && !absorber.fightIds.includes(this.active.id)) {
        absorber.fightIds.push(this.active.id);
      }
    }
    if (this.active) {
      for (const actor of [source, target]) {
        if (actor && !actor.fightIds.includes(this.active.id)) {
          actor.fightIds.push(this.active.id);
        }
      }
    }
    if (event === 'COMBATANT_INFO' && source) {
      // In v22 COMBATANT_INFO has no unit-name fields; spec follows the 23
      // primary-stat fields. Keep the compact fixture layout as a fallback.
      const specID = number(/^[0-9]+$/.test(fields[3] ?? '') ? fields[26] : fields[8]) ?? 0;
      const metadata = getSpecMetadata(specID);
      source.className = metadata?.className ?? source.className;
      this.combatantCount += 1;
      if (this.active) {
        source.fightDetails[this.active.id] = {
          specID,
          role: metadata?.role,
          className: metadata?.className,
          combatant: combatantInfo(source.id, timestamp, specID),
        };
      }
    }
    if (event === 'SPELL_SUMMON' && source && target) {
      target.pet = true;
      target.ownerId = source.id;
      target.friendly = source.friendly;
    }
    if (event.endsWith('_MISSED')) {
      this.addDiagnostic({
        line,
        severity: 'warning',
        message: `Skipped ${event}; missed records are not normalized as damage.`,
      });
    } else if (!ignored.has(event) && !supportedEvents.has(event)) {
      this.addDiagnostic({
        line,
        severity: 'warning',
        message: `Skipped unsupported event type ${/^[A-Z_]+$/.test(event) ? event : '(invalid)'}.`,
      });
    }
  }
  finish(line: number) {
    if (!this.version)
      throw new LocalCombatLogParseError('This is not a supported Retail advanced combat log.');
    if (this.active) {
      this.active.end_time = this.end;
      this.active.kill = false;
      this.fights.push(this.active);
      this.addDiagnostic({
        line,
        severity: 'warning',
        message: 'Final encounter had no end record and was recovered as a wipe.',
      });
    }
    if (!this.fights.length)
      throw new LocalCombatLogParseError('The log contains no encounters.', this.diagnostics);
    if (this.combatantCount === 0)
      throw new LocalCombatLogParseError(
        'The log contains no COMBATANT_INFO records.',
        this.diagnostics,
      );
  }
  report(id: string): Report {
    const actors = [...this.actors.values()];
    const npcGuid = (actor: LocalActor) => number(actor.guid.split('-')[5]) ?? actor.id;
    const unit = (actor: LocalActor, type: string, subType: string, guid = actor.id) => ({
      id: actor.id,
      name: actor.name,
      guid,
      type,
      subType,
      icon: actor.className ?? type,
    });

    return {
      locator: { kind: 'local', id },
      code: id,
      isAnonymous: false,
      fights: this.fights,
      lang: 'en',
      friendlies: actors
        .filter((actor) => actor.friendly && !actor.pet && actor.guid.startsWith('Player-'))
        .map((actor) => ({
          ...unit(actor, 'Player', actor.className ?? 'Player'),
          fights: actor.fightIds.map((fightId) => ({ id: fightId })),
        })),
      enemies: actors
        .filter((actor) => !actor.friendly && !actor.pet)
        .map((actor) => ({
          ...unit(actor, 'NPC', 'NPC', npcGuid(actor)),
          fights: actor.fightIds.map((fightId) => ({ id: fightId, groups: 1, instances: 1 })),
        })),
      friendlyPets: actors
        .filter((actor) => actor.friendly && actor.pet && actor.ownerId !== undefined)
        .map((actor) => ({
          ...unit(actor, 'Pet', 'Pet', npcGuid(actor)),
          petOwner: actor.ownerId ?? 0,
          fights: actor.fightIds.map((fightId) => ({ id: fightId, instances: 1 })),
        })),
      enemyPets: actors
        .filter((actor) => !actor.friendly && actor.pet && actor.ownerId !== undefined)
        .map((actor) => ({
          ...unit(actor, 'Pet', 'Pet', npcGuid(actor)),
          petOwner: actor.ownerId ?? 0,
          fights: actor.fightIds.map((fightId) => ({ id: fightId, instances: 1 })),
        })),
      phases: [],
      logVersion: 22,
      gameVersion: 1,
      title: 'Local combat log',
      owner: '',
      start: this.start,
      end: this.end,
      zone: 0,
      exportedCharacters: [],
    };
  }
}
function combatantInfo(sourceID: number, timestamp: number, specID: number): CombatantInfoEvent {
  return {
    type: EventType.CombatantInfo,
    timestamp,
    sourceID,
    specID,
    expansion: 'retail',
    pin: '',
    gear: [],
    auras: [],
    faction: 0,
    strength: 0,
    agility: 0,
    stamina: 0,
    intellect: 0,
    dodge: 0,
    parry: 0,
    block: 0,
    armor: 0,
    critMelee: 0,
    critRanged: 0,
    critSpell: 0,
    speed: 0,
    leech: 0,
    hasteMelee: 0,
    hasteRanged: 0,
    hasteSpell: 0,
    avoidance: 0,
    mastery: 0,
    versatilityDamageDone: 0,
    versatilityHealingDone: 0,
    versatilityDamageReduction: 0,
    talentTree: [],
    talents: [],
    pvpTalents: [],
  };
}
const autoAttack: Ability = {
  guid: 6603,
  name: 'Auto Attack',
  type: 1,
  abilityIcon: 'ability_meleedamage',
};

const ability = (id?: string, name?: string, school?: string): Ability | undefined => {
  const guid = number(id);
  return guid === undefined
    ? undefined
    : {
        guid,
        name: name || 'Unknown spell',
        type: number(school) ?? 0,
        abilityIcon: 'spell_shadow_unknown',
      };
};

const actorDescriptor = (actor: LocalActor | undefined) => ({
  name: actor?.name ?? 'Unknown',
  id: actor?.id ?? -1,
  guid: actor?.id ?? 0,
  type: actor?.pet ? 'Pet' : actor?.guid.startsWith('Player-') ? 'Player' : 'NPC',
  icon: actor?.className ?? 'NPC',
});

interface DecodeContext {
  fields: string[];
  event: string;
  timestamp: number;
  source?: LocalActor;
  target?: LocalActor;
  spell: ReturnType<typeof spellFields>;
  advanced?: AdvancedActorState;
  payloadStart: number;
}

const snapshot = (advanced?: AdvancedActorState) => ({
  resourceActor: advanced?.resourceActor ?? ResourceActor.Target,
  classResources: advanced?.classResources ?? [],
  hitPoints: advanced?.hitPoints ?? 0,
  maxHitPoints: advanced?.maxHitPoints ?? 0,
  attackPower: advanced?.attackPower ?? 0,
  spellPower: advanced?.spellPower ?? 0,
  armor: advanced?.armor ?? 0,
  absorb: advanced?.absorb ?? 0,
  x: advanced?.x ?? 0,
  y: advanced?.y ?? 0,
  mapID: advanced?.mapID ?? 0,
  facing: advanced?.facing ?? 0,
  itemLevel: advanced?.itemLevel ?? 0,
});

const decodeDamage = (context: DecodeContext): DamageEvent | null => {
  const { advanced, event, fields, payloadStart, source, spell, target, timestamp } = context;
  if (!target) return null;
  const overkillIndex = advanced ? payloadStart + 2 : payloadStart + 1;
  const resistedIndex = advanced ? payloadStart + 4 : payloadStart + 3;
  const blockedIndex = advanced ? payloadStart + 5 : payloadStart + 4;
  const absorbedIndex = advanced ? payloadStart + 6 : payloadStart + 5;
  const criticalIndex = advanced ? payloadStart + 7 : payloadStart + 6;
  const overkill = Math.max(0, number(fields[overkillIndex]) ?? 0);
  const blocked = number(fields[blockedIndex]) ?? 0;
  return {
    type: EventType.Damage,
    timestamp,
    sourceID: source?.id,
    sourceIsFriendly: source?.friendly ?? false,
    targetID: target.id,
    targetInstance: 0,
    targetIsFriendly: target.friendly,
    ability: ability(spell.id, spell.name, spell.school) ?? autoAttack,
    hitType: fields[criticalIndex] === '1' ? 2 : blocked ? 4 : 1,
    amount: Math.max(0, (number(fields[payloadStart]) ?? 0) - overkill),
    absorbed: number(fields[absorbedIndex]) ?? 0,
    spellPower: advanced?.spellPower ?? 0,
    resourceActor: advanced?.resourceActor,
    classResources: advanced?.classResources,
    hitPoints: advanced?.hitPoints,
    maxHitPoints: advanced?.maxHitPoints,
    attackPower: advanced?.attackPower,
    armor: advanced?.armor,
    absorb: advanced?.absorb,
    x: advanced?.x,
    y: advanced?.y,
    mapID: advanced?.mapID,
    facing: advanced?.facing,
    itemLevel: advanced?.itemLevel,
    mitigated: number(fields[resistedIndex]) ?? 0,
    unmitigatedAmount: advanced ? number(fields[payloadStart + 1]) : undefined,
    overkill,
    blocked,
    tick: event === 'SPELL_PERIODIC_DAMAGE',
  };
};

const decodeHeal = (context: DecodeContext): HealEvent | null => {
  const { advanced, event, fields, payloadStart, source, spell, target, timestamp } = context;
  const eventAbility = ability(spell.id, spell.name, spell.school);
  if (!source || !target || !eventAbility) return null;
  const total = number(fields[advanced ? payloadStart + 1 : payloadStart]) ?? 0;
  const overheal = number(fields[advanced ? payloadStart + 2 : payloadStart + 1]) ?? 0;
  return {
    type: EventType.Heal,
    timestamp,
    sourceID: source.id,
    sourceIsFriendly: source.friendly,
    targetID: target.id,
    targetIsFriendly: target.friendly,
    ability: eventAbility,
    hitType: fields[advanced ? payloadStart + 4 : payloadStart + 3] === '1' ? 2 : 1,
    amount: advanced ? Math.max(0, total - overheal) : total,
    overheal,
    absorbed: advanced ? 0 : (number(fields[payloadStart + 2]) ?? 0),
    tick: event === 'SPELL_PERIODIC_HEAL',
    ...snapshot(advanced),
  };
};

const decodeCast = (context: DecodeContext): AnyEvent | null => {
  const { advanced, event, fields, payloadStart, source, spell, target, timestamp } = context;
  const eventAbility = ability(spell.id, spell.name, spell.school);
  if (!source || !eventAbility) return null;
  const common = {
    timestamp,
    ability: eventAbility,
    sourceID: source.id,
    sourceIsFriendly: source.friendly,
    targetID: target?.id,
    targetIsFriendly: target?.friendly ?? false,
    ...snapshot(advanced),
  };
  if (event === 'SPELL_CAST_START') {
    return {
      ...common,
      type: EventType.BeginCast,
      castEvent: null,
      channel: {
        type: EventType.BeginChannel,
        timestamp,
        ability: eventAbility,
        sourceID: source.id,
        isCancelled: false,
      },
      isCancelled: false,
      target: actorDescriptor(target),
    };
  }
  if (event === 'SPELL_CHANNEL_START') {
    return { ...common, type: EventType.BeginChannel, isCancelled: false };
  }
  if (event === 'SPELL_CHANNEL_STOP') {
    const beginChannel: BeginChannelEvent = {
      ...common,
      type: EventType.BeginChannel,
      isCancelled: false,
    };
    return {
      type: EventType.EndChannel,
      timestamp,
      ability: eventAbility,
      sourceID: source.id,
      start: timestamp,
      duration: 0,
      beginChannel,
    };
  }
  if (event === 'SPELL_EMPOWER_END') {
    return {
      ...common,
      type: EventType.EmpowerEnd,
      empowermentLevel: number(fields[payloadStart]) ?? 0,
    };
  }
  const type = event === 'SPELL_EMPOWER_START' ? EventType.EmpowerStart : EventType.Cast;
  return { ...common, type } satisfies BaseCastEvent<typeof type>;
};

const decodeAura = (context: DecodeContext): AnyEvent | null => {
  const { event, source, spell, target, timestamp } = context;
  const eventAbility = ability(spell.id, spell.name, spell.school);
  if (!target || !eventAbility) return null;
  const common = {
    timestamp,
    ability: eventAbility,
    sourceID: source?.id,
    sourceIsFriendly: source?.friendly ?? false,
    targetID: target.id,
    targetIsFriendly: target.friendly,
  };
  const debuff = spell.auraType === 'DEBUFF';
  switch (event) {
    case 'SPELL_AURA_APPLIED':
      return debuff
        ? ({ ...common, type: EventType.ApplyDebuff } satisfies ApplyDebuffEvent)
        : ({ ...common, type: EventType.ApplyBuff } satisfies ApplyBuffEvent);
    case 'SPELL_AURA_REFRESH':
      return debuff
        ? ({ ...common, type: EventType.RefreshDebuff } satisfies RefreshDebuffEvent)
        : ({ ...common, type: EventType.RefreshBuff } satisfies RefreshBuffEvent);
    case 'SPELL_AURA_REMOVED':
      return debuff
        ? ({ ...common, type: EventType.RemoveDebuff } satisfies RemoveDebuffEvent)
        : source
          ? ({
              ...common,
              sourceID: source.id,
              type: EventType.RemoveBuff,
            } satisfies RemoveBuffEvent)
          : null;
    case 'SPELL_AURA_APPLIED_DOSE': {
      if (!source) return null;
      const stack = number(spell.stack) ?? 0;
      return debuff
        ? ({
            ...common,
            sourceID: source.id,
            stack,
            type: EventType.ApplyDebuffStack,
          } satisfies ApplyDebuffStackEvent)
        : ({
            ...common,
            sourceID: source.id,
            stack,
            type: EventType.ApplyBuffStack,
          } satisfies ApplyBuffStackEvent);
    }
    case 'SPELL_AURA_REMOVED_DOSE': {
      if (!source) return null;
      const stack = number(spell.stack) ?? 0;
      return debuff
        ? ({
            ...common,
            sourceID: source.id,
            stack,
            type: EventType.RemoveDebuffStack,
          } satisfies RemoveDebuffStackEvent)
        : ({
            ...common,
            sourceID: source.id,
            stack,
            type: EventType.RemoveBuffStack,
          } satisfies RemoveBuffStackEvent);
    }
    default:
      return null;
  }
};

const decodeResource = (context: DecodeContext): ResourceChangeEvent | DrainEvent | null => {
  const { advanced, event, fields, payloadStart, source, spell, target, timestamp } = context;
  const eventAbility = ability(spell.id, spell.name, spell.school);
  if (!source || !target || !eventAbility) return null;
  if (event === 'SPELL_ENERGIZE') {
    return {
      type: EventType.ResourceChange,
      timestamp,
      ability: eventAbility,
      sourceID: source.id,
      sourceIsFriendly: source.friendly,
      targetID: target.id,
      targetIsFriendly: target.friendly,
      ...snapshot(advanced),
      ...localResourceChange(fields, source, target, advanced),
    };
  }
  return {
    type: EventType.Drain,
    timestamp,
    ability: eventAbility,
    sourceID: source.id,
    sourceIsFriendly: source.friendly,
    targetID: target.id,
    targetIsFriendly: target.friendly,
    resourceChange: number(fields[payloadStart]) ?? 0,
    resourceChangeType: number(fields[payloadStart + 1]) ?? 0,
    otherResourceChange: number(fields[payloadStart + 2]) ?? 0,
    ...snapshot(advanced),
  };
};

const decodeUtility = (context: DecodeContext, discovery: Discovery): AnyEvent | null => {
  const { event, fields, payloadStart, source, spell, target, timestamp } = context;
  const eventAbility = ability(spell.id, spell.name, spell.school);
  if (!source || !target || !eventAbility) return null;
  if (event === 'SPELL_SUMMON') {
    return {
      type: EventType.Summon,
      timestamp,
      ability: eventAbility,
      sourceID: source.id,
      sourceIsFriendly: source.friendly,
      targetID: target.id,
      targetInstance: 0,
      targetIsFriendly: target.friendly,
    } satisfies SummonEvent;
  }
  const extraAbility = ability(
    fields[payloadStart],
    fields[payloadStart + 1],
    fields[payloadStart + 2],
  );
  if (!extraAbility) return null;
  const common = {
    timestamp,
    ability: eventAbility,
    extraAbility,
    sourceID: source.id,
    sourceIsFriendly: source.friendly,
    targetID: target.id,
    targetInstance: 0,
    targetIsFriendly: target.friendly,
  };
  if (event === 'SPELL_INTERRUPT') {
    return { ...common, type: EventType.Interrupt } satisfies InterruptEvent;
  }
  if (event === 'SPELL_DISPEL') {
    return {
      ...common,
      type: EventType.Dispel,
      isBuff: fields[payloadStart + 3] === 'BUFF' ? 1 : 0,
    } satisfies DispelEvent;
  }
  return {
    ...common,
    type: EventType.Spellsteal,
    fight: source.fightIds.at(-1) ?? 0,
    isBuff: fields[payloadStart + 3] === 'BUFF',
  } satisfies SpellstealEvent;
};

const decodeAbsorbed = (context: DecodeContext, discovery: Discovery): AbsorbedEvent | null => {
  const { fields, source: attacker, spell, target, timestamp } = context;
  if (!target) return null;
  const start = hasNativeActorFields(fields) ? 13 : 11;
  const absorber = discovery.actors.get(fields[start]);
  const shield = ability(fields[start + 4], fields[start + 5], fields[start + 6]);
  const triggering = ability(spell.id, spell.name, spell.school) ?? autoAttack;
  if (!absorber || !shield) return null;
  return {
    type: EventType.Absorbed,
    timestamp,
    sourceID: absorber.id,
    sourceIsFriendly: absorber.friendly,
    targetID: target.id,
    targetIsFriendly: target.friendly,
    ability: shield,
    attacker: actorDescriptor(attacker),
    attackerID: attacker?.id,
    attackerIsFriendly: attacker?.friendly ?? false,
    amount: number(fields[start + 7]) ?? 0,
    extraAbility: triggering,
  };
};

function normalize(fields: string[], discovery: Discovery): AnyEvent | null {
  const timestamp = parseCombatLogTimestamp(fields[0]);
  if (timestamp === null) return null;
  const event = fields[1];
  const source = discovery.actors.get(fields[2]);
  const target = discovery.actors.get(targetFields(fields).guid ?? '');
  if (event === 'COMBATANT_INFO') {
    if (!source) return null;
    const specID = number(/^[0-9]+$/.test(fields[3] ?? '') ? fields[26] : fields[8]) ?? 0;
    return combatantInfo(source.id, timestamp, specID);
  }
  if (event.endsWith('_MISSED') || !supportedEvents.has(event)) return null;
  const spell = spellFields(fields, event);
  const advanced = advancedActorState(fields, event, source, target);
  const context: DecodeContext = {
    fields,
    event,
    timestamp,
    source,
    target,
    spell,
    advanced,
    payloadStart: eventPayloadStart(fields, event, advanced),
  };
  switch (event) {
    case 'SWING_DAMAGE':
    case 'RANGE_DAMAGE':
    case 'SPELL_DAMAGE':
    case 'SPELL_PERIODIC_DAMAGE':
      return decodeDamage(context);
    case 'SPELL_HEAL':
    case 'SPELL_PERIODIC_HEAL':
      return decodeHeal(context);
    case 'SPELL_CAST_START':
    case 'SPELL_CAST_SUCCESS':
    case 'SPELL_CHANNEL_START':
    case 'SPELL_CHANNEL_STOP':
    case 'SPELL_EMPOWER_START':
    case 'SPELL_EMPOWER_END':
      return decodeCast(context);
    case 'SPELL_AURA_APPLIED':
    case 'SPELL_AURA_REFRESH':
    case 'SPELL_AURA_REMOVED':
    case 'SPELL_AURA_APPLIED_DOSE':
    case 'SPELL_AURA_REMOVED_DOSE':
      return decodeAura(context);
    case 'SPELL_ENERGIZE':
    case 'SPELL_DRAIN':
    case 'SPELL_LEECH':
      return decodeResource(context);
    case 'SPELL_SUMMON':
    case 'SPELL_INTERRUPT':
    case 'SPELL_DISPEL':
    case 'SPELL_STOLEN':
      return decodeUtility(context, discovery);
    case 'SPELL_ABSORBED':
      return decodeAbsorbed(context, discovery);
    case 'UNIT_DIED':
    case 'UNIT_DESTROYED':
      return target
        ? {
            type: EventType.Death,
            timestamp,
            source: actorDescriptor(source),
            sourceIsFriendly: source?.friendly ?? false,
            targetID: target.id,
            targetIsFriendly: target.friendly,
            ability: autoAttack,
          }
        : null;
    case 'SPELL_INSTAKILL':
      return { type: EventType.Instakill, timestamp };
    case 'SPELL_RESURRECT':
      if (source && target) {
        const resurrect: ResurrectEvent = {
          type: EventType.Resurrect,
          timestamp,
          sourceID: source.id,
          sourceIsFriendly: source.friendly,
          targetID: target.id,
          targetIsFriendly: target.friendly,
          ability: ability(spell.id, spell.name, spell.school),
        };
        return resurrect;
      }
      return null;
    default:
      return null;
  }
}
export function parseCombatLog(text: string, id = 'local'): LocalImportResult {
  const records = text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => ({ line, lineNumber: index + 1 }));
  if (!records.length) throw new LocalCombatLogParseError('The combat log is empty.');
  const discovery = new Discovery();
  for (const record of records) discovery.line(decodeCombatLogLine(record.line), record.lineNumber);
  discovery.finish(records[records.length - 1].lineNumber);
  return {
    report: discovery.report(id),
    events: records
      .map((record) => normalize(decodeCombatLogLine(record.line), discovery))
      .filter((event): event is AnyEvent => event !== null),
    actors: [...discovery.actors.values()],
    diagnostics: discovery.diagnostics,
  };
}
export async function discoverCombatLog(
  file: File,
  id: string,
  signal?: AbortSignal,
  progress?: (value: number) => void,
) {
  const discovery = new Discovery();
  let lastLine = 0;
  for await (const record of readCombatLogLines(file, signal)) {
    discovery.line(decodeCombatLogLine(record.line), record.lineNumber);
    lastLine = record.lineNumber;
    progress?.(file.size ? Math.min(1, record.bytesRead / file.size) : 1);
  }
  discovery.finish(lastLine || 1);
  progress?.(1);
  return discovery;
}
export async function normalizeCombatLog(
  file: File,
  discovery: Discovery,
  onBatch: (fightId: number, events: AnyEvent[]) => Promise<void> | void,
  signal?: AbortSignal,
  progress?: (value: number) => void,
) {
  const batches = new Map<number, AnyEvent[]>();
  let batchBytes = 0;
  const flush = async () => {
    for (const [fightId, events] of batches) if (events.length) await onBatch(fightId, events);
    batches.clear();
  };
  for await (const record of readCombatLogLines(file, signal)) {
    const event = normalize(decodeCombatLogLine(record.line), discovery);
    if (event) {
      const fight = discovery.fights.find(
        (f) => event.timestamp >= f.start_time && event.timestamp <= f.end_time,
      );
      if (fight) {
        const batch = batches.get(fight.id) ?? [];
        batch.push(event);
        batches.set(fight.id, batch);
      }
    }
    batchBytes += new TextEncoder().encode(record.line).byteLength + 1;
    if (batchBytes >= 512 * 1024) {
      await flush();
      batchBytes = 0;
    }
    progress?.(file.size ? Math.min(1, record.bytesRead / file.size) : 1);
  }
  await flush();
  progress?.(1);
}
