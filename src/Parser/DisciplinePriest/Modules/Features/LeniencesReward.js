import React from 'react';

import SPELLS from 'common/SPELLS';
import makeWclUrl from 'common/makeWclUrl';
import SpellIcon from 'common/SpellIcon';
import { formatThousands, formatNumber } from 'common/format';

import LazyLoadStatisticBox from 'Main/LazyLoadStatisticBox';

import ModuleComponent from 'Parser/Core/ModuleComponent';

const LENIENCES_REWARD_DR_PER_RANK = 0.005;

class LeniencesReward extends ModuleComponent {
  _leniencesRewardRank = 0;
  _leniencesRewardDR = 0;

  init() {
    this._leniencesRewardRank = this.owner.selectedCombatant.traitsBySpellId[SPELLS.LENIENCES_REWARD_TRAIT.id];
    this._leniencesRewardDR = this._leniencesRewardRank * LENIENCES_REWARD_DR_PER_RANK;
  }

  get damageReducedDuringLeniencesReward() {
    return this.state.totalDamageTakenDuringAtonement / (1 - this._leniencesRewardDR) * this._leniencesRewardDR;
  }

  get damageReduced() {
    return this.damageReducedDuringLeniencesReward;
  }

  constructor(props) {
    super(props);
    this.state = {
      active: true,
      totalDamageTakenDuringAtonement: 0,
    };
  }

  load() {
    this.init();

    const damageTakenPromise = fetch(makeWclUrl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `(NOT IN RANGE FROM type='applybuff' AND ability.id=${SPELLS.ATONEMENT_BUFF.id} AND source.name='${this.owner.selectedCombatant.name}' TO type='removebuff' AND ability.id=${SPELLS.ATONEMENT_BUFF.id} AND source.name='${this.owner.selectedCombatant.name}' GROUP BY target ON target END)`,
    }))
      .then(response => response.json())
      .then((json) => {
        console.log('Received LR damage taken', json);
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else {
          this.setState({
            totalDamageTakenDuringAtonement: json.entries.reduce((damageTaken, entry) => damageTaken + entry.total, 0),
          });
        }
      });

    return damageTakenPromise;
  }

  render() {
    if (!this.active) {
      return null;
    }
    const fightDuration = this.owner.fightDuration;

    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.LENIENCES_REWARD_TRAIT.id} />}
        value={`~${formatNumber(this.damageReducedDuringLeniencesReward / fightDuration * 1000)} EHPS`}
        label="Lenience's Reward EHPS"
        tooltip={
          `The total effective health granted by Lenience's Reward was ${formatThousands(this.damageReducedDuringLeniencesReward)} (${formatNumber(this.damageReducedDuringLeniencesReward / fightDuration * 1000)} EHPS).`
        }
      />
    );
  }
}

export default LeniencesReward;
