import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import SPELLS from 'common/SPELLS';
import React from 'react';
import Events, { CastEvent } from 'parser/core/Events';
import { FEL_DEFENDER_COOLDOWN_REDUCTION } from '@wowanalyzer/demonhunter'
import { SpellLink } from 'interface';

/**
 * Example log:
 * https://www.warcraftlogs.com/reports/kvaBpJcMdqG2FKXC#fight=1&type=damage-done&source=4 Rank 7
 * https://www.warcraftlogs.com/reports/bwk8aGzgdcYMKfCF#fight=1&type=damage-done&source=17 Rank 6
 */

class FelDefender extends Analyzer {

  conduitRank: number = 0;
  blurCount: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.FEL_DEFENDER.id);
    if (!this.active) {
      return;
    }

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.FEL_DEFENDER.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLUR), this.onBlurCast);
  }

  onBlurCast(event: CastEvent) {
    this.blurCount += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={(
          <>
            Blur Cooldown: {60 - FEL_DEFENDER_COOLDOWN_REDUCTION[this.selectedCombatant.conduitRankBySpellID(SPELLS.FEL_DEFENDER.id)]}
          </>
        )}
      >
        <ConduitSpellText spell={SPELLS.FEL_DEFENDER} rank={this.conduitRank}>
            <>
              <SpellLink id={SPELLS.BLUR.id}>Blur's</SpellLink> casted: {this.blurCount}
            </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default FelDefender;
