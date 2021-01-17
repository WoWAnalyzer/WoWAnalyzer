import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, EnergizeEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import React from 'react';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { NECROTIC_BARRAGE_DAMAGE_INCREASE } from 'parser/hunter/shared/constants';
import COVENANTS from 'game/shadowlands/COVENANTS';
import ConduitSpellText from 'interface/statistics/components/ConduitSpellText';

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
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NECROLORD.id) && this.selectedCombatant.hasConduitBySpellID(SPELLS.NECROTIC_BARRAGE_CONDUIT.id);
    if (!this.active) {
      return;
    }

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.NECROTIC_BARRAGE_CONDUIT.id);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.DEATH_CHAKRAM_SINGLE_TARGET, SPELLS.DEATH_CHAKRAM_INITIAL_AND_AOE]), this.onDeathChakramDamage);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.DEATH_CHAKRAM_ENERGIZE), this.onEnergize);
  }

  onDeathChakramDamage(event: DamageEvent) {
    this.addedDamage += calculateEffectiveDamage(event, NECROTIC_BARRAGE_DAMAGE_INCREASE[this.conduitRank]);
  }

  onEnergize(event: EnergizeEvent) {
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
        <ConduitSpellText spell={SPELLS.NECROTIC_BARRAGE_CONDUIT} rank={this.conduitRank}>
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
