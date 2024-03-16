import SPELLS from 'common/SPELLS/evoker';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, build, CheckResult, PlayerInfo } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import TALENTS from 'common/TALENTS/evoker';
import { AnyEvent } from 'parser/core/Events';
import Spell from 'common/SPELLS/Spell';
import { getSpells, SpellRules } from './spells';

export type TalentInfo = {
  maxEssenceBurst: number;
  maxEssence: number;
  eternitySurgeSpell: Spell[];
  fireBreathSpell: Spell[];
  hasEventHorizon: boolean;
  hasIridescence: boolean;
};

const default_rotation = (spells: SpellRules) => {
  return [
    /** Top priority spells */
    spells.snapFireFirestorm,
    spells.ehEternitySurge,
    spells.fireBreath,
    spells.aoeEternitySurge,
    spells.shatteringStar,
    spells.stEternitySurge,
    spells.aoeFirestorm,
    spells.aoeLivingFlame,
    spells.stBurnoutLivingFlame,

    /** Spenders */
    spells.aoePyre,
    spells.threeTargetPyre,
    spells.disintegrate,

    /** Fillers */
    spells.stFirestorm,
    spells.aoeAzureStrike,
    spells.greenSpells,
    spells.dragonRageFillerLivingFlame,
    spells.fillerLivingFlame,
    SPELLS.AZURE_STRIKE,
  ];
};

const talentCheck = (info: PlayerInfo) => {
  const talentInfo = {
    maxEssenceBurst: 1,
    maxEssence: 5,
    eternitySurgeSpell: [SPELLS.ETERNITY_SURGE],
    fireBreathSpell: [SPELLS.FIRE_BREATH],
    hasEventHorizon: false,
    hasIridescence: false,
  };
  if (!info || !info?.combatant) {
    /** If we don't know whether the player has font talented or not
     * we need to make sure we have both included */
    talentInfo.fireBreathSpell = [SPELLS.FIRE_BREATH, SPELLS.FIRE_BREATH_FONT];
    talentInfo.eternitySurgeSpell = [SPELLS.ETERNITY_SURGE, SPELLS.ETERNITY_SURGE_FONT];
    return talentInfo;
  }

  const combatant = info.combatant;

  if (combatant.hasTalent(TALENTS.ESSENCE_ATTUNEMENT_TALENT)) {
    talentInfo.maxEssenceBurst = 2;
  }
  if (combatant.hasTalent(TALENTS.POWER_NEXUS_TALENT)) {
    talentInfo.maxEssence = 6;
  }
  if (combatant.hasTalent(TALENTS.FONT_OF_MAGIC_DEVASTATION_TALENT)) {
    talentInfo.fireBreathSpell = [SPELLS.FIRE_BREATH_FONT];
    talentInfo.eternitySurgeSpell = [SPELLS.ETERNITY_SURGE_FONT];
  }
  if (combatant.hasTalent(TALENTS.EVENT_HORIZON_TALENT)) {
    talentInfo.hasEventHorizon = true;
  }
  if (combatant.hasTalent(TALENTS.IRIDESCENCE_TALENT)) {
    talentInfo.hasIridescence = true;
  }

  return talentInfo;
};

export const apl = (info: PlayerInfo): Apl => {
  const talentInfo = talentCheck(info);

  const spells: SpellRules = getSpells(talentInfo);

  return build(default_rotation(spells));
};

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl(info));
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});
