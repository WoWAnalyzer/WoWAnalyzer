import { TalentInfo } from './AplCheck';
import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink, SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';
import { Rule, tenseAlt } from 'parser/shared/metrics/apl';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import {
  avoidIfDragonRageSoon,
  hasEssenceRequirement,
  standardEmpowerConditional,
} from './conditions';

export type Rules = {
  [K in keyof ReturnType<typeof getRules>]: Rule;
};

export const getRules = (info: TalentInfo) => {
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
    dragonRageFillerLivingFlame,
    fillerLivingFlame,
    greenSpells,
    aoePyre: aoePyre(info),
    threeTargetPyre: threeTargetPyre(info),
    disintegrate: disintegrate(info),
    aoeAzureStrike,
  };
};

const shatteringStar = (info: TalentInfo): Rule => {
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
const snapFireFirestorm: Rule = {
  spell: TALENTS.FIRESTORM_TALENT,
  condition: cnd.buffPresent(SPELLS.SNAPFIRE_BUFF),
};
const aoeFirestorm: Rule = {
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
const stFirestorm: Rule = {
  spell: TALENTS.FIRESTORM_TALENT,
  condition: cnd.and(
    cnd.buffMissing(TALENTS.DRAGONRAGE_TALENT),
    cnd.debuffMissing(TALENTS.SHATTERING_STAR_TALENT, undefined, undefined, true),
  ),
};
const fireBreath = (info: TalentInfo): Rule => {
  return {
    spell: info.fireBreathSpell,
    condition: standardEmpowerConditional,
  };
};
const stEternitySurge = (info: TalentInfo): Rule => {
  return {
    spell: info.eternitySurgeSpell,
    condition: info.hasEventHorizon ? avoidIfDragonRageSoon() : standardEmpowerConditional,
  };
};
const ehEternitySurge = (info: TalentInfo): Rule => {
  return {
    spell: info.eternitySurgeSpell,
    condition: cnd.describe(
      cnd.and(
        cnd.buffPresent(TALENTS.DRAGONRAGE_TALENT),
        cnd.hasTalent(TALENTS.EVENT_HORIZON_TALENT),
      ),
      (tense) => (
        <>
          {tenseAlt(tense, <>in</>, <>you were in</>)}{' '}
          <SpellLink spell={TALENTS.DRAGONRAGE_TALENT} /> and you{' '}
          {tenseAlt(tense, <>have</>, <>had</>)} <SpellLink spell={TALENTS.EVENT_HORIZON_TALENT} />{' '}
          talented
        </>
      ),
    ),
  };
};
/** There are some specific rules for downranking which would only hit
 *  1/2 targets, but this will work just fine for the average Deva */
const aoeEternitySurge = (info: TalentInfo): Rule => {
  return {
    spell: info.eternitySurgeSpell,
    condition: cnd.and(
      cnd.targetsHit(
        { atLeast: 3 },
        { lookahead: 3000, targetType: EventType.Damage, targetSpell: SPELLS.ETERNITY_SURGE_DAM },
      ),
      standardEmpowerConditional,
    ),
  };
};
const aoeLivingFlame = (info: TalentInfo): Rule => {
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
const stBurnoutLivingFlame = (info: TalentInfo): Rule => {
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
const dragonRageFillerLivingFlame: Rule = {
  spell: SPELLS.LIVING_FLAME_CAST,
  condition: cnd.describe(
    cnd.or(cnd.buffPresent(SPELLS.IRIDESCENCE_RED), cnd.buffPresent(SPELLS.IRIDESCENCE_BLUE)),
    (tense) => (
      <>
        either <SpellLink spell={SPELLS.IRIDESCENCE_BLUE} /> or{' '}
        <SpellLink spell={SPELLS.IRIDESCENCE_RED} /> {tenseAlt(tense, <>is</>, <>was</>)} present
      </>
    ),
  ),
};
const fillerLivingFlame: Rule = {
  spell: SPELLS.LIVING_FLAME_CAST,
  condition: cnd.buffMissing(TALENTS.DRAGONRAGE_TALENT),
};
const greenSpells: Rule = {
  spell: [SPELLS.EMERALD_BLOSSOM_CAST, TALENTS.VERDANT_EMBRACE_TALENT],
  condition: cnd.describe(
    cnd.and(
      cnd.buffMissing(TALENTS.DRAGONRAGE_TALENT),
      cnd.hasTalent(TALENTS.ANCIENT_FLAME_TALENT),
      cnd.buffMissing(SPELLS.ANCIENT_FLAME_BUFF),
      cnd.hasTalent(TALENTS.SCARLET_ADAPTATION_TALENT),
      cnd.debuffMissing(TALENTS.SHATTERING_STAR_TALENT, undefined, undefined, true),
    ),
    (tense) => (
      <>
        <SpellLink spell={SPELLS.ANCIENT_FLAME_BUFF} /> {tenseAlt(tense, <>is</>, <>was</>)} missing
      </>
    ),
  ),
};
const aoePyre = (info: TalentInfo): Rule => {
  return {
    spell: TALENTS.PYRE_TALENT,
    condition: cnd.describe(
      cnd.and(
        cnd.targetsHit(
          { atLeast: 4 },
          { lookahead: 2000, targetType: EventType.Damage, targetSpell: SPELLS.PYRE },
        ),
        hasEssenceRequirement(2, info.maxEssence),
      ),
      () => <>it would hit at least 4 targets</>,
    ),
  };
};
const threeTargetPyre = (info: TalentInfo): Rule => {
  return {
    spell: TALENTS.PYRE_TALENT,

    condition: cnd.describe(
      cnd.and(
        cnd.targetsHit(
          { atLeast: 3 },
          { lookahead: 2000, targetType: EventType.Damage, targetSpell: SPELLS.PYRE },
        ),
        cnd.or(
          cnd.buffStacks(SPELLS.CHARGED_BLAST, { atLeast: 15 }),
          cnd.hasTalent(TALENTS.VOLATILITY_TALENT),
        ),
        hasEssenceRequirement(2, info.maxEssence),
      ),
      () => (
        <>
          it would hit at least 3 targets and you have at least 15 stacks of{' '}
          <SpellLink spell={SPELLS.CHARGED_BLAST} /> or have{' '}
          <SpellLink spell={TALENTS.VOLATILITY_TALENT} /> talented
        </>
      ),
    ),
  };
};
const disintegrate = (info: TalentInfo): Rule => {
  return {
    spell: SPELLS.DISINTEGRATE,
    condition: cnd.describe(
      hasEssenceRequirement(3, info.maxEssence),
      (tense) => (
        <>
          {tenseAlt(
            tense,
            <></>,
            <>
              because you had at least 3 <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} icon /> or{' '}
              <SpellLink spell={SPELLS.ESSENCE_BURST_DEV_BUFF} /> was present
            </>,
          )}
        </>
      ),
      '',
    ),
  };
};
const aoeAzureStrike: Rule = {
  spell: SPELLS.AZURE_STRIKE,
  condition: cnd.targetsHit(
    { atLeast: 2 },
    { lookahead: 1000, targetType: EventType.Damage, targetSpell: SPELLS.AZURE_STRIKE },
  ),
};
