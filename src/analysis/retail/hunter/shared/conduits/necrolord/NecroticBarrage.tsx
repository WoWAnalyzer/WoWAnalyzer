import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { NECROTIC_BARRAGE_DAMAGE_INCREASE } from '../../constants';

/**
 * Death Chakram generates an additional 2 Focus and the damage is increased by 5.0%.
 *
 * Example log
 *
 */
class NecroticBarrage extends Analyzer {
  conduitRank: number = 0;
  gainedFocus: number = 0;
  wastedFocus: number = 0;
  addedDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasCovenant(COVENANTS.NECROLORD.id) &&
      this.selectedCombatant.hasConduitBySpellID(SPELLS.NECROTIC_BARRAGE_CONDUIT.id);
    if (!this.active) {
      return;
    }

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(
      SPELLS.NECROTIC_BARRAGE_CONDUIT.id,
    );

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.DEATH_CHAKRAM_SINGLE_TARGET, SPELLS.DEATH_CHAKRAM_INITIAL_AND_AOE]),
      this.onDeathChakramDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.DEATH_CHAKRAM_ENERGIZE),
      this.onEnergize,
    );
  }

  onDeathChakramDamage(event: DamageEvent) {
    this.addedDamage += calculateEffectiveDamage(
      event,
      NECROTIC_BARRAGE_DAMAGE_INCREASE[this.conduitRank],
    );
  }

  onEnergize(event: ResourceChangeEvent) {
    this.gainedFocus += event.resourceChange;
    this.wastedFocus += event.waste;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spellId={SPELLS.NECROTIC_BARRAGE_CONDUIT.id} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
            <br />
            {this.gainedFocus}/{this.gainedFocus + this.wastedFocus} <small>Focus gained</small>
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default NecroticBarrage;
