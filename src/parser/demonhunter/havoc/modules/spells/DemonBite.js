import React from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatThousands, formatPercentage } from 'common/format';
import { t } from '@lingui/macro';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Example Report: https://www.warcraftlogs.com/reports/KGJgZPxanBX82LzV/#fight=4&source=20
 */
class DemonBite extends Analyzer {

  get furyPerMin() {
    return ((this.furyGain - this.furyWaste) / (this.owner.fightDuration / 60000)).toFixed(2);
  }

  get suggestionThresholds() {
    return {
      actual: this.furyWaste / this.furyGain,
      isGreaterThan: {
        minor: 0.03,
        average: 0.07,
        major: 0.1,
      },
      style: 'percentage',
    };
  }

  furyGain = 0;
  furyWaste = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    //The Demon Blades talent replaces the ability Demon Bite if picked
    this.active = !this.selectedCombatant.hasTalent(SPELLS.DEMON_BLADES_TALENT.id);

    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.DEMONS_BITE), this.onEnergizeEvent);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DEMONS_BITE), this.onDamageEvent);
  }

  onEnergizeEvent(event) {
    this.furyGain += event.resourceChange;
    this.furyWaste += event.waste;
  }

  onDamageEvent(event) {
    this.damage += event.amount;
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<> Try not to cast <SpellLink id={SPELLS.DEMONS_BITE.id} /> when close to max Fury.</>)
        .icon(SPELLS.DEMONS_BITE.icon)
        .actual(t({
      id: "demonhunter.havoc.suggestions.demonsBite.furyWasted",
      message: `${formatPercentage(actual)}% Fury wasted`
    }))
        .recommended(`${formatPercentage(recommended)}% is recommended.`));
  }

  statistic() {
    const effectiveFuryGain = this.furyGain - this.furyWaste;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(6)}
        size="flexible"
        tooltip={(
          <>
            {formatThousands(this.damage)} Total damage<br />
            {effectiveFuryGain} Effective Fury gained<br />
            {this.furyGain} Total Fury gained<br />
            {this.furyWaste} Fury wasted
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.DEMONS_BITE}>
          <>
            {this.furyPerMin} <small>Fury per min</small> <br />
            {this.owner.formatItemDamageDone(this.damage)}
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DemonBite;
