import SPELLS from 'common/SPELLS';
import SPECS from 'game/SPECS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

/**
 * Example log:
 * https://www.warcraftlogs.com/reports/kvaBpJcMdqG2FKXC#fight=1&type=damage-done&source=4 Rank 7
 * https://www.warcraftlogs.com/reports/bwk8aGzgdcYMKfCF#fight=1&type=damage-done&source=17 Rank 6
 */

class FelDefender extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  conduitRank: number = 0;
  abilityCasts: number = 0;
  cdrAbility =
    this.selectedCombatant.spec === SPECS.HAVOC_DEMON_HUNTER ? SPELLS.BLUR : SPELLS.FEL_DEVASTATION;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.FEL_DEFENDER.id);
    if (!this.active) {
      return;
    }

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.FEL_DEFENDER.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.cdrAbility), this.onCast);
  }

  onCast(event: CastEvent) {
    this.abilityCasts += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            <SpellLink id={this.cdrAbility.id} /> Cooldown Reduced to:{' '}
            {this.abilities.getAbility(this.cdrAbility.id)!.cooldown}s
          </>
        }
      >
        <ConduitSpellText spellId={SPELLS.FEL_DEFENDER.id} rank={this.conduitRank}>
          {this.abilityCasts} Cast(s)
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default FelDefender;
