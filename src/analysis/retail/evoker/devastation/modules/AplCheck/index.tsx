import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, Rule } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import TALENTS from 'common/TALENTS/evoker';
import * as cnd from 'parser/shared/metrics/apl/conditions';

import { AnyEvent, EventType } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink, SpellLink } from 'interface';

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
  {
    spell: TALENTS.SHATTERING_STAR_TALENT,
    condition: cnd.describe(cnd.optionalRule(cnd.spellAvailable(TALENTS.DRAGONRAGE_TALENT)), () => (
      <>
        {' '}
        <SpellLink spell={TALENTS.DRAGONRAGE_TALENT} /> is off cooldown <strong>(AoE)</strong>
      </>
    )),
  },
  {
    spell: TALENTS.DRAGONRAGE_TALENT,
    condition: cnd.optionalRule(
      cnd.or(
        cnd.targetsHit(
          { atLeast: 3 },
          { lookahead: 3000, targetType: EventType.Damage, targetSpell: SPELLS.PYRE },
        ),
        cnd.and(
          cnd.spellCooldownRemaining(SPELLS.FIRE_BREATH, { atMost: 4000 }),
          cnd.spellCooldownRemaining(SPELLS.ETERNITY_SURGE, { atMost: 10000 }),
        ),
      ),
    ),
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
      cnd.and(
        cnd.buffMissing(SPELLS.BLAZING_SHARDS),
        cnd.optionalRule(avoidIfDragonRageSoon(13000)),
      ),
    ),
  },
  {
    spell: SPELLS.FIRE_BREATH_FONT,
    condition: cnd.or(
      cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT),
      cnd.and(
        cnd.buffMissing(SPELLS.BLAZING_SHARDS),
        cnd.optionalRule(avoidIfDragonRageSoon(13000)),
      ),
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
        cnd.and(
          cnd.buffMissing(SPELLS.BLAZING_SHARDS),
          cnd.optionalRule(avoidIfDragonRageSoon(13000)),
        ),
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
        cnd.and(
          cnd.buffMissing(SPELLS.BLAZING_SHARDS),
          cnd.optionalRule(avoidIfDragonRageSoon(13000)),
        ),
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
          {' '}
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
          you won't overcap on <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} /> or you don't play{' '}
          <SpellLink spell={TALENTS.ARCANE_VIGOR_TALENT} />
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
      cnd.and(
        cnd.buffMissing(SPELLS.BLAZING_SHARDS),
        cnd.optionalRule(avoidIfDragonRageSoon(13000)),
      ),
    ),
  },
  {
    spell: SPELLS.ETERNITY_SURGE_FONT,
    condition: cnd.or(
      cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT),
      cnd.and(
        cnd.buffMissing(SPELLS.BLAZING_SHARDS),
        cnd.optionalRule(avoidIfDragonRageSoon(13000)),
      ),
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
    condition: cnd.and(
      cnd.buffMissing(TALENTS.DRAGONRAGE_TALENT),
      cnd.hasTalent(TALENTS.ANCIENT_FLAME_TALENT),
      cnd.buffMissing(SPELLS.ANCIENT_FLAME_BUFF),
      cnd.hasTalent(TALENTS.SCARLET_ADAPTATION_TALENT),
    ),
  },

  {
    spell: SPELLS.VERDANT_EMBRACE_HEAL,
    condition: cnd.and(
      cnd.buffMissing(TALENTS.DRAGONRAGE_TALENT),
      cnd.hasTalent(TALENTS.ANCIENT_FLAME_TALENT),
      cnd.buffMissing(SPELLS.ANCIENT_FLAME_BUFF),
      cnd.hasTalent(TALENTS.SCARLET_ADAPTATION_TALENT),
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
    condition: cnd.or(
      cnd.buffMissing(TALENTS.DRAGONRAGE_TALENT),
      cnd.buffPresent(SPELLS.IRIDESCENCE_RED),
      cnd.buffPresent(SPELLS.IRIDESCENCE_BLUE),
    ),
  },

  SPELLS.AZURE_STRIKE,
];

const default_rotation = build([
  ...COMMON_TOP,

  // Chained disintegrate - Chaining takes prio over clipping
  {
    spell: SPELLS.DISINTEGRATE,
    condition: cnd.and(hasEssenceRequirement(3), cnd.lastSpellCast(SPELLS.DISINTEGRATE)),
  },

  // Spend burnout procs without overcapping resources
  {
    spell: SPELLS.LIVING_FLAME_CAST,
    condition: cnd.describe(
      cnd.and(
        cnd.buffPresent(SPELLS.BURNOUT_BUFF),
        cnd.hasResource(RESOURCE_TYPES.ESSENCE, { atMost: 4 }),
        cnd.or(
          cnd.and(
            cnd.buffPresent(SPELLS.LEAPING_FLAMES_BUFF),
            cnd.buffMissing(SPELLS.ESSENCE_BURST_DEV_BUFF),
          ),
          cnd.and(
            cnd.buffMissing(SPELLS.LEAPING_FLAMES_BUFF),
            cnd.buffStacks(SPELLS.ESSENCE_BURST_DEV_BUFF, { atMost: 1 }),
          ),
        ),
      ),
      () => (
        <>
          <SpellLink spell={SPELLS.BURNOUT_BUFF} /> is present and you won't overcap on{' '}
          <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} />
        </>
      ),
    ),
  },

  // So, in theory there are quite a few conditionals that could be added to account for when to use pyre
  // optimally in 2-4T depending on talent selection / situation / etc.
  // But since the minor gains simply doesn't justify the added complexity - we'll keep it as is.
  {
    spell: TALENTS.PYRE_TALENT,
    condition: cnd.and(
      hasEssenceRequirement(2),
      cnd.hasTalent(TALENTS.VOLATILITY_TALENT),
      cnd.targetsHit(
        { atLeast: 3 },
        { lookahead: 2000, targetType: EventType.Damage, targetSpell: SPELLS.PYRE },
      ),
    ),
  },
  {
    spell: TALENTS.PYRE_TALENT,
    condition: cnd.describe(
      cnd.and(
        hasEssenceRequirement(2),
        cnd.not(cnd.hasTalent(TALENTS.VOLATILITY_TALENT)),
        cnd.targetsHit(
          { atLeast: 4 },
          { lookahead: 2000, targetType: EventType.Damage, targetSpell: SPELLS.PYRE },
        ),
      ),
      () => (
        <>
          you have at least 2 <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> or{' '}
          <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} /> is present, you don't have{' '}
          <SpellLink spell={TALENTS.VOLATILITY_TALENT} /> talented and it would hit at least 4
          targets
        </>
      ),
    ),
  },

  {
    spell: SPELLS.DISINTEGRATE,
    condition: hasEssenceRequirement(3),
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
