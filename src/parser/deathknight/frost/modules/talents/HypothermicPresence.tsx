import React from "react";

import Analyzer, { Options } from "parser/core/Analyzer";
import SPELLS from "common/SPELLS";

import Statistic from "interface/statistics/Statistic";
import { STATISTIC_ORDER } from "interface/others/StatisticBox";
import BoringSpellValue from "interface/statistics/components/BoringSpellValue";

import RunicPowerTracker from "../runicpower/RunicPowerTracker";

/** reduces the Runic Power cost of your abilities by 35% for 8 sec */
class HypothermicPresence extends Analyzer {
  static dependencies = {
    runicPowerTracker: RunicPowerTracker,
  }
  
  protected runicPowerTracker!: RunicPowerTracker;
  
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HYPOTHERMIC_PRESENCE_TALENT.id);
    if (!this.active) {
      return;
    }
  }
  
  statistic() {
    return (
      <Statistic
      position={STATISTIC_ORDER.OPTIONAL(50)}
      size="flexible"
      >
        <BoringSpellValue 
          spell={SPELLS.HYPOTHERMIC_PRESENCE_TALENT}
          value={`${this.runicPowerTracker.totalHypothermicPresenceReduction}`}
          label="Runic Power saved"
        />
      </Statistic>
      )
    }
  }
  
  export default HypothermicPresence;