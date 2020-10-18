import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import ItemLink from 'common/ItemLink';
import { formatPercentage } from 'common/format';
import ItemHealingDone from 'interface/ItemHealingDone';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import Events from 'parser/core/Events';

/**
 * Inoculating Extract -
 * Use: Inject 5 stacks of Mutating Antibodies into a friendly target for 30 sec. your direct heals on
 * that ally will consume a Mutating Antibody to restore an additional 3135 health. (1 Min, 30 Sec
 * Cooldown).
 *
 * Test Log: /report/LnhTFvq9fxWRHQrJ/10-LFR+Champion+of+the+Light+-+Kill+(2:28)/Medizin
 */

const MINOR = 0.95;
const AVERAGE = 0.9;
const MAJOR = 0.8;


class InoculatingExtract extends Analyzer{
  static dependencies = {
    abilities: Abilities,
  };

  healing = 0;
  charges = 0;
  uses = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.INOCULATING_EXTRACT.id);

    if(this.active){
      this.abilities.add({
        spell: SPELLS.MUTATING_ANTIBODIES_INOCULATION,
        name: ITEMS.INOCULATING_EXTRACT.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.MUTATING_ANTIBODY), this.onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MUTATING_ANTIBODIES_INOCULATION), this.onCast);
  }

  onHeal(event){
    this.healing += (event.amount || 0) + (event.absorbed || 0);
    this.charges += 1;
  }

  onCast(event){
    this.uses += 1;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={<>Used <strong>{this.uses}</strong> times, consuming <strong>{this.charges}</strong> charges.</>}
      >
        <BoringItemValueText item={ITEMS.INOCULATING_EXTRACT}>
          <ItemHealingDone amount={this.healing} />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }

  suggestions(when){
    const chargeEff = this.charges / (this.uses * 5);
    when(chargeEff).isLessThan(MINOR)
      .addSuggestion((suggest, actual, recommended) => suggest(
          <>
            You had wasted charges from your <ItemLink id={ITEMS.INOCULATING_EXTRACT.id} />.
            Make sure that every buff placed on a target is consumed.
          </>,
        ).icon(ITEMS.INOCULATING_EXTRACT.icon)
          .actual(`${formatPercentage(actual)}% charges used.`)
          .recommended(` ${formatPercentage(recommended)}% is recommended`)
          .regular(AVERAGE).major(MAJOR));
  }

}


export default InoculatingExtract;
