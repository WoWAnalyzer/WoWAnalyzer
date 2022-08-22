import { formatThousands } from 'common/format';
import DH_SPELLS from 'common/SPELLS/demonhunter';
import DH_CONDUITS from 'common/SPELLS/shadowlands/conduits/demonhunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { GROWING_INFERNO_DAMAGE_INCREASE } from '@wowanalyzer/demonhunter';

/**
 * Example logs
 * Rank 5: https://www.warcraftlogs.com/reports/aW8GMv69NBY2CxbK#fight=1&type=damage-done&source=13
 * Rank 4: https://www.warcraftlogs.com/reports/nwRNF864JYTCkW3P#fight=80&type=damage-done&source=175
 */

class GrowingInferno extends Analyzer {
  conduitRank: number = 0;
  addedDamage: number = 0;
  ImmolationDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(DH_CONDUITS.GROWING_INFERNO.id);
    if (!this.active) {
      return;
    }

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(DH_CONDUITS.GROWING_INFERNO.id);
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([
          DH_SPELLS.IMMOLATION_AURA_INITIAL_HIT_DAMAGE,
          DH_SPELLS.IMMOLATION_AURA_BUFF_DAMAGE,
        ]),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.ImmolationDamage += event.amount + (event.absorbed || 0);
    this.addedDamage += calculateEffectiveDamage(
      event,
      GROWING_INFERNO_DAMAGE_INCREASE[this.conduitRank],
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={<>Total damage of Immolation Aura {formatThousands(this.ImmolationDamage)}</>}
      >
        <ConduitSpellText spellId={DH_CONDUITS.GROWING_INFERNO.id} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default GrowingInferno;
