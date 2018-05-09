import React from 'react';

import SPELLS from 'common/SPELLS';
import fetchWcl from 'common/fetchWcl';
import SpellIcon from 'common/SpellIcon';
import { formatThousands, formatNumber } from 'common/format';

import LazyLoadStatisticBox from 'Main/LazyLoadStatisticBox';

import Analyzer from 'Parser/Core/Analyzer';

const LENIENCE_DR = 0.03;

class Lenience extends Analyzer {

  totalDamageTakenDuringAtonement = 0;

  get damageReducedDuringLenience() {
    return this.totalDamageTakenDuringAtonement / (1 - LENIENCE_DR) * LENIENCE_DR;
  }

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasTalent(SPELLS.LENIENCE.id);
  }

  load() {
    return fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `(IN RANGE FROM type='applybuff' AND ability.id=${SPELLS.ATONEMENT_BUFF.id} AND source.name='${this.owner.modules.combatants.selected.name}' TO type='removebuff' AND ability.id=${SPELLS.ATONEMENT_BUFF.id} AND source.name='${this.owner.modules.combatants.selected.name}' GROUP BY target ON target END)`,
    })
      .then(json => {
        console.log('Received LR damage taken', json);
        this.totalDamageTakenDuringAtonement = json.entries.reduce((damageTaken, entry) => damageTaken + entry.total, 0);
      });
  }

  statistic() {
    const fightDuration = this.owner.fightDuration;

    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.LENIENCE.id} />}
        value={`>=${formatNumber(this.damageReducedDuringLenience / fightDuration * 1000)} DRPS`}
        label="Damage reduced"
        tooltip={
          `The estimated damage reduced by Lenience's damage reduction was ${formatThousands(this.damageReducedDuringLenience)} (${formatNumber(this.damageReducedDuringLenience / fightDuration * 1000)} per second average). This is the lowest possible value. This value is 100% accurate for this log if you are looking at the actual gain over not having the Lenience bonus at all, but the gain may end up higher when taking interactions with other damage reductions into account.`
        }
      />
    );
  }
}

export default Lenience;
