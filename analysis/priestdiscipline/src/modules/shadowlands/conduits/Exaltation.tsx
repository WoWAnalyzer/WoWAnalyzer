import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import { Options } from 'parser/core/Module';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { EXALTATION_SPIRIT_SHELL_INCREASE } from '@wowanalyzer/priest-discipline/src/constants';

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
    if (event.provenance !== SourceProvenance.SpiritShell) {
      return;
    }

    this.bonusExaltationHealing += calculateEffectiveHealing(healEvent, this.conduitIncrease);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spellId={SPELLS.EXALTATION.id} rank={this.conduitRank}>
          <>
            <ItemHealingDone amount={this.bonusExaltationHealing} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default Exaltation;
