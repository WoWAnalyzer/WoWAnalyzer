import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import GameBranch from 'game/GameBranch';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';
import HotTrackerMW from '../core/HotTrackerMW';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static dependencies = {
    ...CoreCooldownThroughputTracker.dependencies,
    hotTracker: HotTrackerMW,
  };

  protected hotTracker!: HotTrackerMW;

  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
      branch: GameBranch.Retail,
    },
    {
      spell: TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
      branch: GameBranch.Retail,
    },
    {
      spell: TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.id,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
      branch: GameBranch.Retail,
    },
  ];
  static castCooldowns = [
    ...CoreCooldownThroughputTracker.castCooldowns,
    {
      spell: TALENTS_MONK.MANA_TEA_TALENT.id,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
      branch: GameBranch.Retail,
    },
  ];

  static ignoredSpells = [
    ...CoreCooldownThroughputTracker.ignoredSpells,
    SPELLS.CHI_BURST_HEAL.id,
    SPELLS.REFRESHING_JADE_WIND_HEAL.id,
    TALENTS_MONK.TRANSCENDENCE_TALENT.id,
  ];
}

export default CooldownThroughputTracker;
