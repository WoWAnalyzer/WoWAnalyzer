import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';

export const SAVE_THEM_ALL_MAX_INCREASE = 0.1;

// taken from simc as of 12.0.7 - https://github.com/simulationcraft/simc/blob/477193a647d7af8fb92c951419cf7f38ef470bb5/SpellDataDump/monk.txt#L11126
export const ABILITIES_AFFECTED_BY_HEALING_INCREASES = [
  TALENTS_MONK.SOOTHING_MIST_TALENT.id,
  TALENTS_MONK.REVIVAL_TALENT.id,
  SPELLS.VIVIFY.id,
  SPELLS.RENEWING_MIST_HEAL.id,
  TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
  SPELLS.CHI_BURST_HEAL.id,
  SPELLS.CHI_WAVE_TALENT_HEAL.id,
  SPELLS.GUSTS_OF_MISTS.id,
  SPELLS.ZEN_PULSE_HEAL.id,
  SPELLS.SOOTHING_MIST_STATUE.id,
  // 227344, // surging mist (not in the game)
  273354, // overflowing mists
  SPELLS.ENVELOPING_MIST_TFT.id,
  274774, // strength of spirit
  SPELLS.RISING_MIST_HEAL.id,
  278564, // burst of life
  297850, // revival
  311123, // weapons of order
  SPELLS.EXPEL_HARM.id,
  325209, // enveloping breath
  328748, // gust of mists
  337268, // yu'lon's whisper
  // 337993, // tear of morning (not in the game)
  SPELLS.SOOTHING_BREATH.id,
  SPELLS.GUST_OF_MISTS_CHIJI.id,
  // 345727, // faeline stomp (not in the game)
  // 358560, // enveloping breath (not in the game)
  // 387995, // tear of morning (not in the game)
  SPELLS.AT_HEAL.id,
  SPELLS.AT_CRIT_HEAL.id,
  SPELLS.YULONS_WHISPER_HEAL.id,
  SPELLS.JADEFIRE_STOMP_HEAL.id,
  388514, // overflowing mists
  TALENTS_MONK.RESTORAL_TALENT.id,
  388668, // zen pulse
  SPELLS.WOTC_HEAL.id,
  SPELLS.WOTC_CRIT_HEAL.id,
  SPELLS.BURST_OF_LIFE_HEAL.id,
  TALENTS_MONK.SHEILUNS_GIFT_TALENT.id,
  407058, // thunderous focus tea
  SPELLS.INVIGORATING_MISTS_HEAL.id,
  SPELLS.CELESTIAL_CONDUIT_HEAL.id,
  448430, // renewing mist
  SPELLS.MANTRA_OF_PURITY_HEAL.id,
  451968, // expel harm
  SPELLS.INSURANCE_HOT_MONK.id,
  SPELLS.INSURANCE_PROC_MONK.id,
  1238851, // renewing mist
  SPELLS.RUSHING_WIND_KICK_HEAL.id,
  1271045, // harmonic surge
];
