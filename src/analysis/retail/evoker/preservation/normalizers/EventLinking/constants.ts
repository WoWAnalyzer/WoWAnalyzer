export const ANCIENT_FLAME = 'AncientFlame'; // links cast to buff apply
export const ANCIENT_FLAME_CONSUME = 'AncientFlameConnsume'; // links buff remove to buff apply
// BEGIN ECHO constants
export const FROM_HARDCAST = 'FromHardcast'; // for linking a buffapply or heal to its cast
export const ECHO_REMOVAL = 'EchoRemoval'; // for linking echo removal to echo apply
export const TA_ECHO_REMOVAL = 'TaEchoRemoval'; // for linking TA echo removal to echo apply
export const ECHO_TEMPORAL_ANOMALY = 'TemporalAnomaly'; // for linking BuffApply/Heal to echo removal
export const ECHO = 'Echo'; // for linking BuffApply/Heal to echo removal
// END ECHO constants
export const ESSENCE_BURST_LINK = 'EssenceBurstLink'; // link eb removal to apply
export const DREAM_BREATH_CALL_OF_YSERA = 'DreamBreathCallOfYsera'; // link DB hit to buff removal
export const DREAM_BREATH_CALL_OF_YSERA_HOT = 'DreamBreathCallOfYseraHoT'; // link DB hot to buff removal
export const FIELD_OF_DREAMS_PROC = 'FromFieldOfDreams'; // link EB heal to fluttering heal
export const GOLDEN_HOUR = 'GoldenHour'; // link GH heal to reversion application
export const LIFEBIND = 'Lifebind'; // link lifebind buff apply to lifebind heal event
export const LIFEBIND_APPLY = 'LifebindApply'; // link lifebind apply to verdant embrace
export const LIFEBIND_HEAL = 'LifebindHeal'; // link lifebind heal to trigger heal event
export const LIVING_FLAME_CALL_OF_YSERA = 'LivingFlameCallOfYsera'; // link buffed living flame to buff removal
export const HEAL_GROUPING = 'HealGrouping'; // link EB healevents and TA pulses together to easily fetch groups of heals/absorbs
export const ECHO_HEAL_GROUPING = 'HealGrouping'; // link EB healevents and TA pulses together to easily fetch groups of heals/absorbs
export const BUFF_GROUPING = 'BuffGrouping'; // link ApplyBuff events together
export const SHIELD_FROM_TA_CAST = 'ShieldFromTACast';
export const SPARK_OF_INSIGHT = 'SparkOfInsight'; // link TC stack removals to Spark
export const STASIS = 'Stasis';
export const STASIS_FOR_RAMP = 'ForRamp';
export const STASIS_FILLING = 'StasisFilling';
export const EB_REVERSION = 'EssenceBurstReversion';
export const TIME_OF_NEED_HEALING = 'TimeOfNeedHealing';
export const LIFESPARK_LIVING_FLAME = 'LifesparkLivingFlame'; //Instant living flame from Lifespark
export const REVERSION = 'Reversion';
export const EMERALD_BLOSSOM_CAST = 'EmeraldBlossomCast'; //Find first heal event from a Blossom cast
export const DREAM_BREATH = 'DreamBreath';
export const DREAM_BREATH_CAST = 'DreamBreathCast'; //Apply buff and Refresh buff to Cast event
export const DREAM_BREATH_FROM_STASIS = 'DreamBreathFromStasis';
export const FIRE_BREATH = 'FireBreath';
export const FIRE_BREATH_CAST = 'FireBreathCast';
export const ENGULF_DREAM_BREATH = 'EngulfDreamBreath';
export const ENGULF_CONSUME_FLAME = 'EngulfConsumeFlame';
export const SPIRITBLOOM_CAST = 'SpiritbloomCast';
export const SPIRITBLOOM_FROM_STASIS = 'SpiritbloomFromStasis';
export const TEMPORAL_COMPRESSION_REVERSION = 'TemporalCompressionReversion';
export const LIFEBIND_HEAL_EMPOWER = 'LifebindHealEmpower'; //Lifebind heal event to the empower that caused it

export enum ECHO_TYPE {
  NONE,
  TA,
  HARDCAST,
}

export const CAST_BUFFER_MS = 100;
export const ECHO_BUFFER = 5000;
export const EB_BUFFER_MS = 1500;
export const EB_VARIANCE_BUFFER = 150; // servers are bad and EB can take over or under 1.5s to actually trigger
export const LIFEBIND_BUFFER = 5000 + CAST_BUFFER_MS; // 5s duration
export const MAX_ECHO_DURATION = 20000; // 15s with 30% inc = 19s
export const MAX_ESSENCE_BURST_DURATION = 32000; // 15s duration can refresh to 30s with 2s of buffer
export const MAX_REVERSION_DURATION = 60000;
export const TA_BUFFER_MS = 6000 + CAST_BUFFER_MS; //TA pulses over 6s at 0% haste
export const STASIS_BUFFER = 1000;
export const TIME_OF_NEED_DURATION = 8000;
export const LIVING_FLAME_FLIGHT_TIME = 1000;
export const MAX_DREAM_BREATH_DURATION = 28000;
export const MAX_FIRE_BREATH_DURATION = 36000;
export const TITANS_GIFT_INC = 0.25;
export const FULL_STASIS_DURATION = 60000; //Need to grab all the way from stasis release back to spells that filled it. Maybe better way?
export const ENGULF_CONSUME_BUFFER = 500;
export const SPIRITBLOOM_HOT_DURATION = 8000;
