import { RABID_SHADOWS_INCREASE } from 'analysis/retail/priest-discipline/constants';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { SELECTED_PLAYER_PET } from 'parser/core/EventFilter';
import Events, { DamageEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../../core/AtonementAnalyzer';

const SHADOWFIEND_MANA_RESTORE = 500;
class RabidShadows extends Analyzer {
  conduitRank: number = 0;
  conduitIncrease: number = 0;
  bonusAtonementHealing: number = 0;
  shadowfiendHits: number = 0;

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.RABID_SHADOWS.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }
    this.conduitIncrease = RABID_SHADOWS_INCREASE[this.conduitRank];
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onDamage);
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtone);
  }

  onAtone(event: AtonementAnalyzerEvent) {
    if (
      event.damageEvent?.ability.guid !== SPELLS.MAGIC_MELEE.id &&
      event.damageEvent?.ability.guid !== SPELLS.LIGHTSPAWN_MELEE.id
    ) {
      return;
    }
    this.bonusAtonementHealing += calculateEffectiveHealing(
      event.healEvent,
      this.conduitIncrease / 100,
    );
  }

  onDamage(event: DamageEvent) {
    this.shadowfiendHits += 1;
  }

  statistic() {
    const extraHits =
      this.shadowfiendHits - this.shadowfiendHits / (1 + this.conduitIncrease / 100);
    const manaSaved = Math.floor(extraHits) * SHADOWFIEND_MANA_RESTORE;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spellId={SPELLS.RABID_SHADOWS.id} rank={this.conduitRank}>
          <>
            <ItemHealingDone amount={this.bonusAtonementHealing} />
            <br />
            <ItemManaGained amount={manaSaved} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default RabidShadows;
