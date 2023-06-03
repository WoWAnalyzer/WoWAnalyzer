import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, Rule } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import TALENTS from 'common/TALENTS/evoker';
import * as cnd from 'parser/shared/metrics/apl/conditions';

import { AnyEvent, EventType } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

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
  { spell: SPELLS.FIRE_BREATH, condition: cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT) },
  { spell: SPELLS.FIRE_BREATH_FONT, condition: cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT) },
  // Make sure not to overlap T30 4pc buff
  // Make sure to not use empower too close to dragonrage
  {
    spell: SPELLS.FIRE_BREATH,
    condition: cnd.and(cnd.buffMissing(SPELLS.BLAZING_SHARDS), avoidIfDragonRageSoon(13000)),
  },
  {
    spell: SPELLS.FIRE_BREATH_FONT,
    condition: cnd.and(cnd.buffMissing(SPELLS.BLAZING_SHARDS), avoidIfDragonRageSoon(13000)),
  },

  // Only use star if it doesn't overcap EB or you don't play vigor - assume player has double EB talent
  {
    spell: TALENTS.SHATTERING_STAR_TALENT,
    condition: cnd.not(cnd.hasTalent(TALENTS.ARCANE_VIGOR_TALENT)),
  },
  {
    spell: TALENTS.SHATTERING_STAR_TALENT,
    condition: cnd.buffStacks(SPELLS.ESSENCE_BURST_DEV_BUFF, {
      atMost: cnd.hasTalent(TALENTS.ESSENCE_ATTUNEMENT_TALENT) ? 1 : 0,
    }),
  },

  // Use empower inside DR
  { spell: SPELLS.ETERNITY_SURGE, condition: cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT) },
  { spell: SPELLS.ETERNITY_SURGE_FONT, condition: cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT) },
  // Make sure not to overlap T30 4pc buff
  // Make sure to not use empower too close to dragonrage
  {
    spell: SPELLS.ETERNITY_SURGE,
    condition: cnd.and(cnd.buffMissing(SPELLS.BLAZING_SHARDS), avoidIfDragonRageSoon(13000)),
  },
  {
    spell: SPELLS.ETERNITY_SURGE_FONT,
    condition: cnd.and(cnd.buffMissing(SPELLS.BLAZING_SHARDS), avoidIfDragonRageSoon(13000)),
  },
];

export const COMMON_BOTTOM: Rule[] = [
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
      { atLeast: 3 },
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
    condition: cnd.and(
      cnd.buffPresent(SPELLS.BURNOUT_BUFF),
      cnd.hasResource(RESOURCE_TYPES.ESSENCE, { atMost: 4 }),
      cnd.and(
        cnd.buffPresent(SPELLS.LEAPING_FLAMES_BUFF),
        cnd.buffMissing(SPELLS.ESSENCE_BURST_DEV_BUFF),
      ),
    ),
  },
  {
    spell: SPELLS.LIVING_FLAME_CAST,
    condition: cnd.and(
      cnd.buffPresent(SPELLS.BURNOUT_BUFF),
      cnd.hasResource(RESOURCE_TYPES.ESSENCE, { atMost: 4 }),
      cnd.and(
        cnd.buffMissing(SPELLS.LEAPING_FLAMES_BUFF),
        cnd.buffStacks(SPELLS.ESSENCE_BURST_DEV_BUFF, { atMost: 1 }),
      ),
    ),
  },

  {
    spell: TALENTS.PYRE_TALENT,
    condition: cnd.and(
      hasEssenceRequirement(2),
      cnd.targetsHit(
        { atLeast: 3 },
        { lookahead: 2000, targetType: EventType.Damage, targetSpell: SPELLS.PYRE },
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
