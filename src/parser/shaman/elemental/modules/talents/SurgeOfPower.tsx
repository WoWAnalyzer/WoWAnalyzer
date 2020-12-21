import React from 'react';

import Analyzer, { Options } from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import { formatPercentage } from 'common/format';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Statistic from 'interface/statistics/Statistic';
import { t } from '@lingui/macro';

const SURGE_OF_POWER = {
  AFFECTED_CASTS: [
    SPELLS.FLAME_SHOCK,
    SPELLS.FROST_SHOCK,
    SPELLS.LAVA_BURST,
    SPELLS.LIGHTNING_BOLT,
  ],
};

class SurgeOfPower extends Analyzer {
  sopBuffedAbilities: { [key: number]: number } = {};
  // total SK + SoP lightning bolt casts
  skSopCasts = 0;
  // total SK lightning bolt casts
  skCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SURGE_OF_POWER_TALENT.id);

    for (const key in SURGE_OF_POWER.AFFECTED_CASTS) {
      const spellid = SURGE_OF_POWER.AFFECTED_CASTS[key].id;
      this.sopBuffedAbilities[spellid] = 0;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SURGE_OF_POWER.AFFECTED_CASTS), this._onCast);
  }

  get suggestionThresholds() {
    return {
      actual: this.skSopCasts / this.skCasts,
      isLessThan: {
        minor: 0.9,
        average: 0.75,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  _onCast(event: CastEvent) {
    // cast lightning bolt with only SK buff active
    if (this.selectedCombatant.hasBuff(SPELLS.STORMKEEPER_TALENT.id, event.timestamp) && event.ability.guid === SPELLS.LIGHTNING_BOLT.id) {
      this.skCasts += 1;
    }

    if (!this.selectedCombatant.hasBuff(SPELLS.SURGE_OF_POWER_BUFF.id)) {
      return;
    }

    event.meta = event.meta || {};
    event.meta.isEnhancedCast = true;
    this.sopBuffedAbilities[event.ability.guid] += 1;

    // cast lightning bolt with SoP and SK buffs active
    if (this.selectedCombatant.hasBuff(SPELLS.STORMKEEPER_TALENT.id, event.timestamp) && event.ability.guid === SPELLS.LIGHTNING_BOLT.id) {
      this.skSopCasts += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Ability</th>
              <th>Number of Buffed Casts</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(this.sopBuffedAbilities).map((e) => (
              <tr key={e}>
                <th><SpellLink id={Number(e)} /></th>
                <td>{this.sopBuffedAbilities[Number(e)]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Statistic>
    );
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>You should aim to empower all of your Stormkeeper lightning bolts with Surge of Power. You can accomplish this
        consistently by pooling to 95+ maelstrom right before Stormkeeper is available, then casting ES {'->'} SK {'->'} LB {'->'} LvB {'->'} ES {'->'} LB.</span>)
        .icon(SPELLS.SURGE_OF_POWER_TALENT.icon)
        .actual(t({
      id: "shaman.elemental.suggestions.surgeOfPower.stormKeeperEmpowered",
      message: `${formatPercentage(actual)}% of Stormkeeper Lightning Bolts empowered with Surge`
    }))
        .recommended(`100% is recommended.`));
  }
}

export default SurgeOfPower;
