import React from 'react';

import SPELLS from 'common/SPELLS';
import makeWclUrl from 'common/makeWclUrl';
import SpellIcon from 'common/SpellIcon';

import LazyLoadStatisticBox from 'Main/LazyLoadStatisticBox';

import ModuleComponent from 'Parser/Core/ModuleComponent';

// Protection of Tyr is applied to everyone that benefits from the AM effect. This is simply the easiest way to see if someone is affected by AM, other more robust solutions take a lot more effort/complexity.
const PROTECTION_OF_TYR_ID = 211210;
const DEVOTION_AURA_DAMAGE_REDUCTION = 0.2;

function formatThousands(number) {
  return (Math.round(number || 0) + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
function formatNumber(number) {
  if (number > 1000000) {
    return `${(number / 1000000).toFixed(2)}m`;
  }
  if (number > 10000) {
    return `${Math.round(number / 1000)}k`;
  }
  return formatThousands(number);
}

class DevotionAura extends ModuleComponent {
  get damageReducedDuringAuraMastery() {
    return this.state.totalDamageTakenDuringAuraMastery / (1 - DEVOTION_AURA_DAMAGE_REDUCTION) * DEVOTION_AURA_DAMAGE_REDUCTION;
  }
  get averagePassiveDamageReduction() {
    return DEVOTION_AURA_DAMAGE_REDUCTION / this.owner.playerCount;
  }
  get damageReducedOutsideAuraMastery() {
    const averagePassiveDamageReduction = this.averagePassiveDamageReduction;
    return this.state.totalDamageTakenOutsideAuraMastery / (1 - averagePassiveDamageReduction) * averagePassiveDamageReduction;
  }
  get damageReduced() {
    return this.damageReducedDuringAuraMastery + this.damageReducedOutsideAuraMastery;
  }

  constructor(props) {
    super(props);
    this.state = {
      active: this.owner.selectedCombatant.hasTalent(SPELLS.DEVOTION_AURA_TALENT.id),
      totalDamageTakenDuringAuraMastery: 0,
      totalDamageTakenOutsideAuraMastery: 0,
    };
  }

  load() {
    const amDamageTakenPromise = fetch(makeWclUrl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `(IN RANGE FROM type='applybuff' AND ability.id=${PROTECTION_OF_TYR_ID} AND source.name='${this.owner.selectedCombatant.name}' TO type='removebuff' AND ability.id=${PROTECTION_OF_TYR_ID} AND source.name='${this.owner.selectedCombatant.name}' GROUP BY target ON target END)`,
    }))
      .then(response => response.json())
      .then((json) => {
        console.log('Received AM damage taken', json);
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else {
          this.setState({
            totalDamageTakenDuringAuraMastery: json.entries.reduce((damageTaken, entry) => damageTaken + entry.total, 0),
          });
        }
      });
    const regularDamageTakenPromise = fetch(makeWclUrl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `(NOT IN RANGE FROM type='applybuff' AND ability.id=${PROTECTION_OF_TYR_ID} AND source.name='${this.owner.selectedCombatant.name}' TO type='removebuff' AND ability.id=${PROTECTION_OF_TYR_ID} AND source.name='${this.owner.selectedCombatant.name}' GROUP BY target ON target END)`,
    }))
      .then(response => response.json())
      .then((json) => {
        console.log('Received regular damage taken', json);
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else {
          this.setState({
            totalDamageTakenOutsideAuraMastery: json.entries.reduce((damageTaken, entry) => damageTaken + entry.total, 0),
          });
        }
      });

    return Promise.all([
      amDamageTakenPromise,
      regularDamageTakenPromise,
    ]);
  }

  render() {
    const fightDuration = this.owner.fightDuration;

    const averagePassiveDamageReductionPercentage = Math.round(this.averagePassiveDamageReduction * 10000) / 100;

    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.DEVOTION_AURA_TALENT.id} />}
        value={`${formatNumber(this.damageReduced / fightDuration * 1000)} DRPS`}
        label="Estimated damage reduced"
        tooltip={`The total estimated damage reduced <b>during</b> Aura Mastery was ${formatThousands(this.damageReducedDuringAuraMastery)} (${formatNumber(this.damageReducedDuringAuraMastery / fightDuration * 1000)} DRPS). This has a high accuracy.<br />
          The total estimated damage reduced <b>outside</b> Aura Mastery was ${formatThousands(this.damageReducedOutsideAuraMastery)} (${formatNumber(this.damageReducedOutsideAuraMastery / fightDuration * 1000)} DRPS). This has medium accuracy.<br /><br />

          Calculating exact Devotion Aura damage reduced is near impossible and takes a very long time. This gets the total damage taken during and outside Aura Mastery and calculates the damage reduced for those totals by taking 20% of the original damage taken during Aura Mastery and ${averagePassiveDamageReductionPercentage}% (20% / ${this.owner.playerCount} members in the raid) of all damage taken outside Aura Mastery. This ${averagePassiveDamageReductionPercentage}% is the estimated average damage reduced assuming this averages out to be the same on all members. More extensive tests that go over all damage events and that is aware of the exact Devotion Aura reduction at each event have shown that this is usually a close approximation.`}
      />
    );
  }
}

export default DevotionAura;
