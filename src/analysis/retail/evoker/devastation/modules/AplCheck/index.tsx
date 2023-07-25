import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, Rule } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import TALENTS from 'common/TALENTS/evoker';
import * as cnd from 'parser/shared/metrics/apl/conditions';

import { AnyEvent, EventType } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';

const avoidIfDragonRageSoon = (time: number) => {
  return cnd.spellCooldownRemaining(TALENTS.DRAGONRAGE_TALENT, { atLeast: time });
};

const hasEssenceRequirement = (resources: number) => {
  return cnd.or(
    cnd.hasResource(RESOURCE_TYPES.ESSENCE, { atLeast: resources }),
    cnd.buffPresent(SPELLS.ESSENCE_BURST_DEV_BUFF),
  );
};

const COMMON_TOP: Rule[] = [
  // Spend Snapfire procs ASAP
  {
    spell: TALENTS.FIRESTORM_TALENT,
    condition: cnd.buffPresent(SPELLS.SNAPFIRE_BUFF),
  },

  // With Event Horizon talented, use Eternity Surge before Fire Breath during DR
  {
    spell: SPELLS.ETERNITY_SURGE,
    condition: cnd.and(
      cnd.hasTalent(TALENTS.EVENT_HORIZON_TALENT),
      cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT),
    ),
  },
  {
    spell: SPELLS.ETERNITY_SURGE_FONT,
    condition: cnd.and(
      cnd.hasTalent(TALENTS.EVENT_HORIZON_TALENT),
      cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT),
    ),
  },

  // Use empower inside DR
  // Make sure not to overlap T30 4pc buff
  // Make sure to not use empower too close to dragonrage
  {
    spell: SPELLS.FIRE_BREATH,
    condition: cnd.or(
      cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT),
      cnd.and(cnd.buffMissing(SPELLS.BLAZING_SHARDS), avoidIfDragonRageSoon(13000)),
    ),
  },
  {
    spell: SPELLS.FIRE_BREATH_FONT,
    condition: cnd.or(
      cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT),
      cnd.and(cnd.buffMissing(SPELLS.BLAZING_SHARDS), avoidIfDragonRageSoon(13000)),
    ),
  },
  // Use ES over star in AoE
  {
    spell: SPELLS.ETERNITY_SURGE,
    condition: cnd.and(
      cnd.targetsHit(
        { atLeast: 3 },
        { lookahead: 3000, targetType: EventType.Damage, targetSpell: SPELLS.ETERNITY_SURGE_DAM },
      ),
      cnd.or(
        cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT),
        cnd.and(cnd.buffMissing(SPELLS.BLAZING_SHARDS), avoidIfDragonRageSoon(13000)),
      ),
    ),
  },
  {
    spell: SPELLS.ETERNITY_SURGE_FONT,
    condition: cnd.and(
      cnd.targetsHit(
        { atLeast: 3 },
        { lookahead: 3000, targetType: EventType.Damage, targetSpell: SPELLS.ETERNITY_SURGE_DAM },
      ),
      cnd.or(
        cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT),
        cnd.and(cnd.buffMissing(SPELLS.BLAZING_SHARDS), avoidIfDragonRageSoon(13000)),
      ),
    ),
  },
  {
    spell: SPELLS.DEEP_BREATH,
    condition: cnd.describe(
      cnd.optionalRule(
        cnd.and(
          cnd.buffMissing(TALENTS.DRAGONRAGE_TALENT),
          cnd.targetsHit(
            { atLeast: 3 },
            { lookahead: 3000, targetType: EventType.Damage, targetSpell: SPELLS.DEEP_BREATH_DAM },
          ),
        ),
      ),
      () => (
        <>
          <SpellLink spell={TALENTS.DRAGONRAGE_TALENT} /> isn't present <strong>(AoE)</strong>
        </>
      ),
    ),
  },
  // Only use star if it doesn't overcap EB or you don't play vigor
  {
    spell: TALENTS.SHATTERING_STAR_TALENT,
    condition: cnd.describe(
      cnd.or(
        cnd.and(
          cnd.hasTalent(TALENTS.ARCANE_VIGOR_TALENT),
          cnd.or(
            cnd.and(
              cnd.hasTalent(TALENTS.ESSENCE_ATTUNEMENT_TALENT),
              cnd.buffStacks(SPELLS.ESSENCE_BURST_DEV_BUFF, { atMost: 1 }),
            ),
            cnd.and(
              cnd.not(cnd.hasTalent(TALENTS.ESSENCE_ATTUNEMENT_TALENT)),
              cnd.buffStacks(SPELLS.ESSENCE_BURST_DEV_BUFF, { atMost: 0 }),
            ),
          ),
        ),
        cnd.not(cnd.hasTalent(TALENTS.ARCANE_VIGOR_TALENT)),
      ),
      () => (
        <>
          you won't overcap on <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} /> or if you don't
          play <SpellLink spell={TALENTS.ARCANE_VIGOR_TALENT} />
        </>
      ),
    ),
  },
  // Use empower inside DR
  // Make sure not to overlap T30 4pc buff
  // Make sure to not use empower too close to dragonrage
  {
    spell: SPELLS.ETERNITY_SURGE,
    condition: cnd.or(
      cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT),
      cnd.and(cnd.buffMissing(SPELLS.BLAZING_SHARDS), avoidIfDragonRageSoon(13000)),
    ),
  },
  {
    spell: SPELLS.ETERNITY_SURGE_FONT,
    condition: cnd.or(
      cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT),
      cnd.and(cnd.buffMissing(SPELLS.BLAZING_SHARDS), avoidIfDragonRageSoon(13000)),
    ),
  },
  // Hard cast only Firestorm in AoE
  {
    spell: TALENTS.FIRESTORM_TALENT,
    condition: cnd.targetsHit(
      { atLeast: 3 },
      { lookahead: 2000, targetType: EventType.Damage, targetSpell: SPELLS.FIRESTORM_DAMAGE },
    ),
  },
];

export const COMMON_BOTTOM: Rule[] = [
  // Hard cast only Firestorm outside of SS and DR windows
  {
    spell: TALENTS.FIRESTORM_TALENT,
    condition: cnd.and(
      cnd.buffMissing(TALENTS.DRAGONRAGE_TALENT),
      cnd.debuffMissing(SPELLS.SHATTERING_STAR),
    ),
  },
  {
    spell: SPELLS.EMERALD_BLOSSOM_CAST,
    condition: cnd.describe(
      cnd.and(
        cnd.buffMissing(TALENTS.DRAGONRAGE_TALENT),
        cnd.hasTalent(TALENTS.ANCIENT_FLAME_TALENT),
        cnd.buffMissing(SPELLS.ANCIENT_FLAME_BUFF),
        cnd.hasTalent(TALENTS.SCARLET_ADAPTATION_TALENT),
      ),
      () => (
        <>
          {' '}
          you are talented into <SpellLink spell={TALENTS.ANCIENT_FLAME_TALENT} /> and{' '}
          <SpellLink spell={TALENTS.SCARLET_ADAPTATION_TALENT} />, and you don't have either{' '}
          <SpellLink spell={SPELLS.ANCIENT_FLAME_BUFF} /> or{' '}
          <SpellLink spell={TALENTS.SCARLET_ADAPTATION_TALENT} /> buffs currently up
        </>
      ),
    ),
  },

  {
    spell: SPELLS.VERDANT_EMBRACE_HEAL,
    condition: cnd.describe(
      cnd.and(
        cnd.buffMissing(TALENTS.DRAGONRAGE_TALENT),
        cnd.hasTalent(TALENTS.ANCIENT_FLAME_TALENT),
        cnd.buffMissing(SPELLS.ANCIENT_FLAME_BUFF),
        cnd.hasTalent(TALENTS.SCARLET_ADAPTATION_TALENT),
      ),
      () => (
        <>
          {' '}
          you are talented into <SpellLink spell={TALENTS.ANCIENT_FLAME_TALENT} /> and{' '}
          <SpellLink spell={TALENTS.SCARLET_ADAPTATION_TALENT} />, and you don't have either{' '}
          <SpellLink spell={SPELLS.ANCIENT_FLAME_BUFF} /> or{' '}
          <SpellLink spell={TALENTS.SCARLET_ADAPTATION_TALENT} /> buffs currently up
        </>
      ),
    ),
  },

  {
    spell: SPELLS.AZURE_STRIKE,
    condition: cnd.targetsHit(
      { atLeast: 2 },
      { lookahead: 1000, targetType: EventType.Damage, targetSpell: SPELLS.AZURE_STRIKE },
    ),
  },

  {
    spell: SPELLS.LIVING_FLAME_CAST,
    condition: cnd.describe(
      cnd.and(
        cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT),
        cnd.or(cnd.buffPresent(SPELLS.IRIDESCENCE_RED), cnd.buffPresent(SPELLS.IRIDESCENCE_BLUE)),
      ),
      () => (
        <>
          <SpellLink spell={TALENTS.DRAGONRAGE_TALENT} /> is present and{' '}
          <SpellLink spell={SPELLS.IRIDESCENCE_BLUE} /> or{' '}
          <SpellLink spell={SPELLS.IRIDESCENCE_RED} /> is present.
        </>
      ),
    ),
  },
  {
    spell: SPELLS.LIVING_FLAME_CAST,
    condition: cnd.buffMissing(TALENTS.DRAGONRAGE_TALENT),
  },

  SPELLS.AZURE_STRIKE,
];

const default_rotation = build([
  ...COMMON_TOP,

  // Chained disintegrate - Chaining takes prio over clipping
  {
    spell: SPELLS.DISINTEGRATE,
    condition: cnd.and(
      cnd.always(hasEssenceRequirement(3)),
      cnd.lastSpellCast(SPELLS.DISINTEGRATE),
    ),
  },

  // Leaping Flames with burnout
  {
    spell: SPELLS.LIVING_FLAME_CAST,
    condition: cnd.and(
      cnd.buffPresent(SPELLS.LEAPING_FLAMES_BUFF),
      cnd.hasResource(RESOURCE_TYPES.ESSENCE, { atMost: 4 }),
      cnd.buffMissing(SPELLS.ESSENCE_BURST_DEV_BUFF),
      cnd.or(
        cnd.targetsHit(
          { atLeast: 4 },
          {
            lookahead: 2000,
            targetType: EventType.Damage,
            targetSpell: SPELLS.LIVING_FLAME_DAMAGE,
          },
        ),
        cnd.buffPresent(SPELLS.BURNOUT_BUFF),
        cnd.and(
          cnd.buffPresent(TALENTS.SCARLET_ADAPTATION_TALENT),
          cnd.targetsHit(
            { atLeast: 3 },
            {
              lookahead: 2000,
              targetType: EventType.Damage,
              targetSpell: SPELLS.LIVING_FLAME_DAMAGE,
            },
          ),
        ),
      ),
    ),
  },
  // Leaping flames no burnout
  {
    spell: SPELLS.LIVING_FLAME_CAST,
    condition: cnd.and(
      cnd.buffPresent(SPELLS.LEAPING_FLAMES_BUFF),
      cnd.hasResource(RESOURCE_TYPES.ESSENCE, { atMost: 4 }),
      cnd.buffMissing(SPELLS.ESSENCE_BURST_DEV_BUFF),
      cnd.hasTalent(TALENTS.BURNOUT_TALENT),
      cnd.targetsHit(
        { atLeast: 3 },
        {
          lookahead: 2000,
          targetType: EventType.Damage,
          targetSpell: SPELLS.LIVING_FLAME_DAMAGE,
        },
      ),
    ),
  },

  // Burnout no leaping flames
  {
    spell: SPELLS.LIVING_FLAME_CAST,
    condition: cnd.and(
      cnd.buffPresent(SPELLS.BURNOUT_BUFF),
      cnd.buffMissing(SPELLS.LEAPING_FLAMES_BUFF),
      cnd.hasResource(RESOURCE_TYPES.ESSENCE, { atMost: 4 }),
      cnd.buffStacks(SPELLS.ESSENCE_BURST_DEV_BUFF, { atMost: 1 }),
    ),
  },

  // Pyre when atleast 4 targets are hit
  {
    spell: TALENTS.PYRE_TALENT,
    condition: cnd.targetsHit(
      { atLeast: 4 },
      { lookahead: 2000, targetType: EventType.Damage, targetSpell: SPELLS.PYRE },
    ),
  },
  // Pyre when atleast 3 targets are hit with 15 stacks of CB
  {
    spell: TALENTS.PYRE_TALENT,
    condition: cnd.and(
      cnd.targetsHit(
        { atLeast: 3 },
        { lookahead: 2000, targetType: EventType.Damage, targetSpell: SPELLS.PYRE },
      ),
      cnd.buffStacks(SPELLS.CHARGED_BLAST, { atLeast: 15 }),
    ),
  },
  // Pyre when atleast 3 targets are hit and if talented into CB and neither EB or blue buff is up
  {
    spell: TALENTS.PYRE_TALENT,
    condition: cnd.describe(
      cnd.and(
        cnd.targetsHit(
          { atLeast: 3 },
          { lookahead: 2000, targetType: EventType.Damage, targetSpell: SPELLS.PYRE },
        ),
        cnd.hasTalent(TALENTS.CHARGED_BLAST_TALENT),
        cnd.or(
          cnd.not(cnd.buffPresent(SPELLS.ESSENCE_BURST_DEV_BUFF)),
          cnd.not(cnd.buffPresent(SPELLS.IRIDESCENCE_BLUE)),
        ),
      ),
      () => (
        <>
          it would hit at least 3 targets and <SpellLink spell={SPELLS.CHARGED_BLAST} /> is talented
          and neither <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} /> nor{' '}
          <SpellLink spell={SPELLS.IRIDESCENCE_BLUE} /> is up
        </>
      ),
    ),
  },
  // Pyre when atleast 3 targets are hit if not playing CB aslong as both EB and blue buff isn't up at the same time.
  {
    spell: TALENTS.PYRE_TALENT,
    condition: cnd.describe(
      cnd.and(
        cnd.targetsHit(
          { atLeast: 3 },
          { lookahead: 2000, targetType: EventType.Damage, targetSpell: SPELLS.PYRE },
        ),
        cnd.not(cnd.hasTalent(TALENTS.CHARGED_BLAST_TALENT)),
        cnd.not(
          cnd.and(
            cnd.buffPresent(SPELLS.ESSENCE_BURST_DEV_BUFF),
            cnd.buffPresent(SPELLS.IRIDESCENCE_BLUE),
          ),
        ),
      ),
      () => (
        <>
          it would hit at least 3 targets and both{' '}
          <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} /> and{' '}
          <SpellLink spell={SPELLS.IRIDESCENCE_BLUE} /> isn't up
        </>
      ),
    ),
  },

  {
    spell: SPELLS.DISINTEGRATE,
    condition: cnd.always(hasEssenceRequirement(3)),
  },

  ...COMMON_BOTTOM,
]);

export const apl = (): Apl => {
  return default_rotation;
};

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl());
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});
