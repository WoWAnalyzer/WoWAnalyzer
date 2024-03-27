import SPELLS from 'common/SPELLS/evoker';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, Rule } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import TALENTS from 'common/TALENTS/evoker';
import { AnyEvent } from 'parser/core/Events';
import Spell from 'common/SPELLS/Spell';
import { getRules, Rules } from './rules';

export type TalentInfo = {
  maxEssenceBurst: number;
  maxEssence: number;
  eternitySurgeSpell: Spell[];
  fireBreathSpell: Spell[];
  hasEventHorizon: boolean;
  hasIridescence: boolean;
  hasProtractedTalons: boolean;
};

const default_rotation = (rules: Rules): Rule[] => {
  return [
    /** Top priority spells */
    rules.snapFireFirestorm,
    rules.ehEternitySurge,
    rules.fireBreath,
    rules.aoeEternitySurge,
    rules.shatteringStar,
    rules.stEternitySurge,
    rules.aoeFirestorm,
    rules.aoeLivingFlame,
    rules.stBurnoutLivingFlame,

    /** Spenders */
    rules.aoePyre,
    rules.threeTargetPyre,
    rules.disintegrate,

    /** Fillers */
    rules.stFirestorm,
    rules.aoeAzureStrike,
    rules.greenSpells,
    rules.dragonRageFillerLivingFlame,
    rules.fillerLivingFlame,
    SPELLS.AZURE_STRIKE,
  ];
};

const talentCheck = (info: PlayerInfo): TalentInfo => {
  const talentInfo: TalentInfo = {
    maxEssenceBurst: 1,
    maxEssence: 5,
    /** The reason for defining only one version of our empower spell
     * is that if we include both font and non font version it will show up as
     * "Cast Fire Breath or Fire Breath...", since it then assumes we have both available.
     * This looks a bit weird so we try to define the version that is actively talented. */
    eternitySurgeSpell: [SPELLS.ETERNITY_SURGE],
    fireBreathSpell: [SPELLS.FIRE_BREATH],
    /** Below talents have rotational changes */
    hasEventHorizon: false,
    hasIridescence: false,
    hasProtractedTalons: false,
  };
  if (!info || !info?.combatant) {
    /** If we don't know whether the player has font talented or not
     * we need to make sure we have both included */
    talentInfo.fireBreathSpell = [SPELLS.FIRE_BREATH, SPELLS.FIRE_BREATH_FONT];
    talentInfo.eternitySurgeSpell = [SPELLS.ETERNITY_SURGE, SPELLS.ETERNITY_SURGE_FONT];
    return talentInfo;
  }

  const combatant = info.combatant;

  talentInfo.maxEssenceBurst = combatant.hasTalent(TALENTS.ESSENCE_ATTUNEMENT_TALENT) ? 2 : 1;
  talentInfo.maxEssence = combatant.hasTalent(TALENTS.POWER_NEXUS_TALENT) ? 6 : 5;

  if (combatant.hasTalent(TALENTS.FONT_OF_MAGIC_DEVASTATION_TALENT)) {
    talentInfo.fireBreathSpell = [SPELLS.FIRE_BREATH_FONT];
    talentInfo.eternitySurgeSpell = [SPELLS.ETERNITY_SURGE_FONT];
  }

  talentInfo.hasEventHorizon = combatant.hasTalent(TALENTS.EVENT_HORIZON_TALENT);
  talentInfo.hasIridescence = combatant.hasTalent(TALENTS.IRIDESCENCE_TALENT);
  talentInfo.hasProtractedTalons = combatant.hasTalent(TALENTS.PROTRACTED_TALONS_TALENT);

  return talentInfo;
};

export const apl = (info: PlayerInfo): Apl => {
  const talentInfo = talentCheck(info);

  const rules: Rules = getRules(talentInfo);

  return build(default_rotation(rules));
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
