import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Wrapper from 'common/Wrapper';
import { formatMilliseconds, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import EnemyInstances, { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';

const debug = false;

const GUARANTEE_CRIT_SPELLS = [
  SPELLS.FIRE_BLAST.id,
  SPELLS.PHOENIXS_FLAMES.id,
];

class HeatingUp extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
    enemies: EnemyInstances,
  };

  fireBlastWithoutHeatingUp = 0;
  phoenixFlamesWithoutHeatingUp = 0;
  fireBlastWithHotStreak = 0;
  phoenixFlamesWithHotStreak = 0;
  targetId = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PHOENIXS_FLAMES.id) {
      return;
    }
    this.targetId = encodeTargetString(event.targetID, event.targetInstance);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
    if (!GUARANTEE_CRIT_SPELLS.includes(spellId) || (spellId === SPELLS.PHOENIXS_FLAMES.id && (this.targetId !== damageTarget))) {
      return;
    }
    const hasHeatingUp = this.combatants.selected.hasBuff(SPELLS.HEATING_UP.id);
    const hasHotStreak = this.combatants.selected.hasBuff(SPELLS.HOT_STREAK.id);

    if (spellId === SPELLS.FIRE_BLAST.id) {
      if (hasHotStreak) {
        this.fireBlastWithHotStreak += 1;
        debug && console.log("Fire Blast with Hot Streak @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
      } else if (!hasHeatingUp) {
        this.fireBlastWithoutHeatingUp += 1;
        debug && console.log("Fire Blast without Heating Up @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
      }
    } else if (spellId === SPELLS.PHOENIXS_FLAMES.id) {
        if (hasHotStreak) {
          this.phoenixFlamesWithHotStreak += 1;
          debug && console.log("Phoenix Flames with Hot Streak @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
        } else if (!hasHeatingUp) {
          this.phoenixFlamesWithoutHeatingUp += 1;
          debug && console.log("Phoenix Flames without Heating Up @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
        }
    }
  }

  get fireBlastWasted() {
    return this.fireBlastWithoutHeatingUp + this.fireBlastWithHotStreak;
  }

  get phoenixFlamesWasted() {
    return this.phoenixFlamesWithoutHeatingUp + this.phoenixFlamesWithHotStreak;
  }

  get totalWasted() {
    return this.fireBlastWasted + this.phoenixFlamesWasted;
  }

  get fireBlastUtil() {
    return 1 - this.fireBlastMissedPercent;
  }

  get phoenixFlamesUtil() {
    return 1 - this.phoenixFlamesMissedPercent;
  }

  get fireBlastMissedPercent() {
    return this.fireBlastWasted / this.abilityTracker.getAbility(SPELLS.FIRE_BLAST.id).casts;
  }

  get phoenixFlamesMissedPercent() {
    return this.phoenixFlamesWasted / this.abilityTracker.getAbility(SPELLS.PHOENIXS_FLAMES.id).casts;
  }

  get fireBlastUtilSuggestionThresholds() {
    return {
      actual: this.fireBlastUtil,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.70,
      },
      style: 'percentage',
    };
  }

  get phoenixFlamesUtilSuggestionThresholds() {
    return {
      actual: this.phoenixFlamesUtil,
      isLessThan: {
        minor: 0.90,
        average: 0.80,
        major: 0.70,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
		when(this.fireBlastUtilSuggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<Wrapper>You cast <SpellLink id={SPELLS.FIRE_BLAST.id} /> {this.fireBlastWithHotStreak} times while <SpellLink id={SPELLS.HOT_STREAK.id}/> was active and {this.fireBlastWithoutHeatingUp} times while you didnt have <SpellLink id={SPELLS.HEATING_UP.id}/>. Make sure that you are only using Fire Blast to convert Heating Up into Hot Streak.</Wrapper>)
					.icon(SPELLS.FIRE_BLAST.icon)
					.actual(`${formatPercentage(this.fireBlastUtil)}% Utilization`)
					.recommended(`<${formatPercentage(recommended)}% is recommended`);
			});
    when(this.phoenixFlamesUtilSuggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<Wrapper>You cast <SpellLink id={SPELLS.PHOENIXS_FLAMES.id} /> {this.phoenixFlamesWithHotStreak} times while <SpellLink id={SPELLS.HOT_STREAK.id}/> was active and {this.phoenixFlamesWithoutHeatingUp} times while you didnt have <SpellLink id={SPELLS.HEATING_UP.id}/>. While ideally you should only be using these to convert Heating Up into Hot Streak, there are some minor circumstances where it is acceptable (i.e. If you are about to cap on Phoenixs Flames charges or when used alongside <SpellLink id={SPELLS.FIREBALL.id}/> to bait Heating Up or Hot Streak just before <SpellLink id={SPELLS.COMBUSTION.id}/>.</Wrapper>)
					.icon(SPELLS.PHOENIXS_FLAMES.icon)
					.actual(`${formatPercentage(this.phoenixFlamesUtil)}% Utilization`)
					.recommended(`<${formatPercentage(recommended)}% is recommended`);
			});
	}

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HEATING_UP.id} />}
        value={(
          <span>
            <SpellIcon
              id={SPELLS.FIRE_BLAST.id}
              style={{
                height: '1.2em',
                marginBottom: '.15em',
              }}
            />
            {' '}{formatPercentage(this.fireBlastUtil, 0)}{' %'}
            <br />
            <SpellIcon
              id={SPELLS.PHOENIXS_FLAMES.id}
              style={{
                height: '1.2em',
                marginBottom: '.15em',
              }}
            />
            {' '}{formatPercentage(this.phoenixFlamesUtil, 0)}{' %'}
          </span>
        )}
        label="Heating Up Utilization"
        tooltip={`Spells that are guaranteed to crit like Fire Blast and Phoenix's Flames should only be used to convert Heating Up to Hot Streak. While there are minor exceptions to this (like if you are about to cap on Phoenixs Flames charges or using Fireball & Phoenixs Flames to bait Heating Up/Hot Streak just before Combustion), the goal should be to waste as few of these as possible.
          <ul>
            <li>Fireblast Used with no procs: ${this.fireBlastWithoutHeatingUp}</li>
            <li>Fireblast used during Hot Streak: ${this.fireBlastWithHotStreak}</li>
            <li>Phoenix's Flames used with no procs: ${this.phoenixFlamesWithoutHeatingUp}</li>
            <li>Phoenix's Flames used during Hot Streak: ${this.phoenixFlamesWithHotStreak}</li>
          </ul>`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(14);

}

export default HeatingUp;
