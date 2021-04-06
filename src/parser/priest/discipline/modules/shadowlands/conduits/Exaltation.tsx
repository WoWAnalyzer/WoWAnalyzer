import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import { Options } from 'parser/core/Module';
import { EXALTATION_SPIRIT_SHELL_INCREASE } from 'parser/priest/discipline/constants';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ConduitSpellText from 'interface/statistics/components/ConduitSpellText';
import ItemHealingDone from 'interface/ItemHealingDone';
import AtonementAnalyzer, {
  AtonementAnalyzerEvent,
  SourceProvenance,
} from '../../core/AtonementAnalyzer';

class Exaltation extends Analyzer {
  conduitRank: number = 0;
  conduitIncrease: number = 0;
  bonusExaltationHealing: number = 0;

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.EXALTATION.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }
    this.conduitIncrease = EXALTATION_SPIRIT_SHELL_INCREASE[this.conduitRank];

    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.handleSpiritShell);
  }

  handleSpiritShell(event: AtonementAnalyzerEvent) {
    const { healEvent } = event;
    if (event.provenance !== SourceProvenance.SpiritShell) return;

    this.bonusExaltationHealing += calculateEffectiveHealing(healEvent, this.conduitIncrease);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spell={SPELLS.EXALTATION} rank={this.conduitRank}>
          <>
            <ItemHealingDone amount={this.bonusExaltationHealing} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default Exaltation;
