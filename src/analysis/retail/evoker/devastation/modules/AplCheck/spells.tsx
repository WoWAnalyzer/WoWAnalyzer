import { TalentInfo } from './index';

import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink, SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';
import { ConditionalRule, Rule, tenseAlt } from 'parser/shared/metrics/apl';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import { avoidIfDragonRageSoon, hasEssenceRequirement } from './conditions';

export type SpellRules = {
  [K in keyof ReturnType<typeof getSpells>]: ConditionalRule;
};

export const getSpells = (info: TalentInfo) => {
  return {
    shatteringStar: shatteringStar(info),
    snapFireFirestorm,
    aoeFirestorm,
    stFirestorm,
    fireBreath: fireBreath(info),
    stEternitySurge: stEternitySurge(info),
    ehEternitySurge: ehEternitySurge(info),
    aoeEternitySurge: aoeEternitySurge(info),
    aoeLivingFlame: aoeLivingFlame(info),
    stBurnoutLivingFlame: stBurnoutLivingFlame(info),
    fillerLivingFlame,
    greenSpells,
    aoePyre,
    threeTargetPyre,
    disintegrate,
    aoeAzureStrike,
  };
};

const shatteringStar = (info: TalentInfo) => {
  const baseCondition = cnd.describe(
    cnd.or(
      cnd.and(
        cnd.hasTalent(TALENTS.ARCANE_VIGOR_TALENT),
        cnd.buffStacks(SPELLS.ESSENCE_BURST_DEV_BUFF, {
          atMost: info.maxEssenceBurst - 1,
        }),
      ),
      cnd.not(cnd.hasTalent(TALENTS.ARCANE_VIGOR_TALENT)),
    ),
    (tense) => (
      <>
        you {tenseAlt(tense, <>won't</>, <>wouldn't</>)} overcap on{' '}
        <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} />
      </>
    ),
  );

  const ssRule: Rule = {
    spell: TALENTS.SHATTERING_STAR_TALENT,
    condition:
      !info.hasEventHorizon && info.hasIridescence
        ? cnd.and(baseCondition, cnd.buffMissing(SPELLS.IRIDESCENCE_BLUE))
        : baseCondition,
  };
  return ssRule;
};
const snapFireFirestorm = {
  spell: TALENTS.FIRESTORM_TALENT,
  condition: cnd.buffPresent(SPELLS.SNAPFIRE_BUFF),
};
const aoeFirestorm = {
  spell: TALENTS.FIRESTORM_TALENT,
  condition: cnd.targetsHit(
    { atLeast: 3 },
    {
      lookahead: 2000,
      targetType: EventType.Damage,
      targetSpell: SPELLS.FIRESTORM_DAMAGE,
    },
  ),
};
const stFirestorm = {
  spell: TALENTS.FIRESTORM_TALENT,
  condition: cnd.and(
    cnd.buffMissing(TALENTS.DRAGONRAGE_TALENT),
    cnd.debuffMissing(SPELLS.SHATTERING_STAR),
  ),
};
const fireBreath = (info: TalentInfo) => {
  return {
    spell: info.fireBreathSpell,
    condition: cnd.or(cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT), avoidIfDragonRageSoon(13000)),
  };
};
const stEternitySurge = (info: TalentInfo) => {
  return {
    spell: info.eternitySurgeSpell,
    condition: info.hasEventHorizon
      ? avoidIfDragonRageSoon(13000)
      : cnd.or(cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT), avoidIfDragonRageSoon(13000)),
  };
};
const ehEternitySurge = (info: TalentInfo) => {
  return {
    spell: info.eternitySurgeSpell,
    condition: cnd.and(
      cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT),
      cnd.hasTalent(TALENTS.EVENT_HORIZON_TALENT),
    ),
  };
};
/** There are some specific rules for downranking which would only hit
 *  1/2 targets, but this will work just fine for the average Deva */
const aoeEternitySurge = (info: TalentInfo) => {
  return {
    spell: info.eternitySurgeSpell,
    condition: cnd.and(
      cnd.targetsHit(
        { atLeast: 3 },
        { lookahead: 3000, targetType: EventType.Damage, targetSpell: SPELLS.ETERNITY_SURGE_DAM },
      ),
      cnd.or(cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT), avoidIfDragonRageSoon(13000)),
    ),
  };
};
const aoeLivingFlame = (info: TalentInfo) => {
  return {
    spell: SPELLS.LIVING_FLAME_CAST,
    condition: cnd.describe(
      cnd.and(
        cnd.buffPresent(SPELLS.LEAPING_FLAMES_BUFF),
        cnd.hasResource(RESOURCE_TYPES.ESSENCE, { atMost: info.maxEssence - 1 }),
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
          cnd.and(
            cnd.or(
              cnd.buffPresent(SPELLS.BURNOUT_BUFF),
              cnd.not(cnd.hasTalent(TALENTS.BURNOUT_TALENT)),
              cnd.buffPresent(TALENTS.SCARLET_ADAPTATION_TALENT),
            ),
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
      (tense) => (
        <>
          you {tenseAlt(tense, <>have</>, <>had</>)}{' '}
          <SpellLink spell={SPELLS.LEAPING_FLAMES_BUFF} /> and{' '}
          {tenseAlt(tense, <>won't</>, <>wouldn't</>)} overcap{' '}
          <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} icon /> or{' '}
          <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} /> <strong>(AoE)</strong>
        </>
      ),
    ),
  };
};
const stBurnoutLivingFlame = (info: TalentInfo) => {
  return {
    spell: SPELLS.LIVING_FLAME_CAST,
    condition: cnd.describe(
      cnd.optionalRule(
        cnd.and(
          cnd.buffPresent(SPELLS.BURNOUT_BUFF),
          cnd.hasResource(RESOURCE_TYPES.ESSENCE, { atMost: info.maxEssence - 2 }),
          cnd.or(
            cnd.and(
              cnd.buffStacks(SPELLS.ESSENCE_BURST_DEV_BUFF, { atMost: info.maxEssence - 1 }),
              cnd.buffMissing(SPELLS.LEAPING_FLAMES_BUFF),
            ),
            cnd.and(
              cnd.buffMissing(SPELLS.ESSENCE_BURST_DEV_BUFF),
              cnd.buffPresent(SPELLS.LEAPING_FLAMES_BUFF),
            ),
          ),
        ),
      ),
      (tense) => (
        <>
          you {tenseAlt(tense, <>have</>, <>had</>)} <SpellLink spell={SPELLS.BURNOUT_BUFF} /> and{' '}
          {tenseAlt(tense, <>won't</>, <>wouldn't</>)} overcap{' '}
          <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} icon /> or{' '}
          <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} />
        </>
      ),
    ),
  };
};
const fillerLivingFlame = {
  spell: SPELLS.LIVING_FLAME_CAST,
  condition: cnd.describe(
    cnd.or(
      cnd.buffMissing(TALENTS.DRAGONRAGE_TALENT),
      cnd.buffPresent(SPELLS.IRIDESCENCE_RED),
      cnd.buffPresent(SPELLS.IRIDESCENCE_BLUE),
    ),
    (tense) => (
      <>
        <SpellLink spell={TALENTS.DRAGONRAGE_TALENT} /> {tenseAlt(tense, <>is</>, <>was</>)} missing
        or {tenseAlt(tense, <>when</>, <></>)} either <SpellLink spell={SPELLS.IRIDESCENCE_BLUE} />{' '}
        or <SpellLink spell={SPELLS.IRIDESCENCE_RED} /> {tenseAlt(tense, <>is</>, <>was</>)} present
      </>
    ),
  ),
};
const greenSpells = {
  spell: [SPELLS.EMERALD_BLOSSOM_CAST, SPELLS.VERDANT_EMBRACE_HEAL],
  condition: cnd.describe(
    cnd.and(
      cnd.buffMissing(TALENTS.DRAGONRAGE_TALENT),
      cnd.hasTalent(TALENTS.ANCIENT_FLAME_TALENT),
      cnd.buffMissing(SPELLS.ANCIENT_FLAME_BUFF),
      cnd.hasTalent(TALENTS.SCARLET_ADAPTATION_TALENT),
      cnd.debuffMissing(SPELLS.SHATTERING_STAR),
    ),
    (tense) => (
      <>
        <SpellLink spell={SPELLS.ANCIENT_FLAME_BUFF} /> {tenseAlt(tense, <>is</>, <>was</>)} missing
      </>
    ),
  ),
};
const aoePyre = {
  spell: TALENTS.PYRE_TALENT,
  condition: cnd.and(
    cnd.targetsHit(
      { atLeast: 4 },
      { lookahead: 2000, targetType: EventType.Damage, targetSpell: SPELLS.PYRE },
    ),
    hasEssenceRequirement(2),
  ),
};
const threeTargetPyre = {
  spell: TALENTS.PYRE_TALENT,
  condition: cnd.and(
    cnd.targetsHit(
      { atLeast: 3 },
      { lookahead: 2000, targetType: EventType.Damage, targetSpell: SPELLS.PYRE },
    ),
    cnd.or(
      cnd.buffStacks(SPELLS.CHARGED_BLAST, { atLeast: 15 }),
      cnd.hasTalent(TALENTS.VOLATILITY_TALENT),
    ),
    hasEssenceRequirement(2),
  ),
};
const disintegrate = {
  spell: SPELLS.DISINTEGRATE,
  condition: hasEssenceRequirement(3),
};
const aoeAzureStrike = {
  spell: SPELLS.AZURE_STRIKE,
  condition: cnd.targetsHit(
    { atLeast: 2 },
    { lookahead: 1000, targetType: EventType.Damage, targetSpell: SPELLS.AZURE_STRIKE },
  ),
};
