import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import fetchWcl from 'common/fetchWclApi';
import SpellIcon from 'common/SpellIcon';
import { formatThousands, formatNumber } from 'common/format';

import LazyLoadStatisticBox, { STATISTIC_ORDER } from 'interface/others/LazyLoadStatisticBox';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import makeWclUrl from 'common/makeWclUrl';
import SpellLink from 'common/SpellLink';
import Events, { EventType } from 'parser/core/Events';

// Source: https://github.com/MartijnHols/HolyPaladin/blob/master/Spells/Talents/60/DevotionAura.md#about-the-passive-effect
const DEVOTION_AURA_PASSIVE_DAMAGE_REDUCTION = .03;
const DEVOTION_AURA_ACTIVE_DAMAGE_REDUCTION = 0.2;

/**
 * Falling damage is considered "pure" or w/e damage meaning it doesn't get reduced by damage reductions. The ability description of such an event can look like this: {
		"name": "Falling",
		"guid": 3,
		"type": 1,
		"abilityIcon": "inv_axe_02.jpg"
	},
 * `type: 1` seems to only be used by Falling, but I was unable to verify this. I want to ignore this kind of damage taken. I figured the savest solution would be to filter by ability id instead of type, but if you find another such ability that needs to be ignored and it has `type: 1` while nothing else does, we may want to refactor this.
 */
// const THIS_MIGHT_BE_PURE_ABILITY_TYPE_ID = 1;
const FALLING_DAMAGE_ABILITY_ID = 3;

/**
 * Devotion Aura
 * Damage dealt to allies within 10 yards is reduced by up to 10%, diminishing as more allies enter the aura.
 * While Aura Mastery is active, all affected allies gain 20% damage reduction.
 * ---
 * See the markdown file next to this module for info about how this is analyzed.
 */
class DevotionAuraDamageReduction extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  passiveDamageReduced = 0;
  get passiveDrps() {
    return (this.passiveDamageReduced / this.owner.fightDuration) * 1000;
  }
  activeDamageReduced = 0;
  get activeDrps() {
    return (this.activeDamageReduced / this.owner.fightDuration) * 1000;
  }
  get totalDamageReduced() {
    return this.passiveDamageReduced + this.activeDamageReduced;
  }
  get totalDrps() {
    return (this.totalDamageReduced / this.owner.fightDuration) * 1000;
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DEVOTION_AURA_TALENT.id);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this.onApplyBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER), this.onRemoveBuff);
  }

  onDamageTaken(event) {
    const spellId = event.ability.guid;
    if (spellId === FALLING_DAMAGE_ABILITY_ID) {
      return;
    }

    const isAuraMasteryActive = this.selectedCombatant.hasBuff(
      SPELLS.AURA_MASTERY.id,
      event.timestamp,
      0,
      0,
      this.owner.playerId,
    );

    if (!isAuraMasteryActive) {
      const damageTaken = event.amount + (event.absorbed || 0);
      const damageReduced =
        (damageTaken / (1 - this.totalPassiveDamageReduction)) * this.totalPassiveDamageReduction;
      this.passiveDamageReduced += damageReduced;
    }
  }

  buffsActive = 1;
  get singleTargetDamageReduction() {
    return DEVOTION_AURA_PASSIVE_DAMAGE_REDUCTION * this.buffsActive;
  }
  get totalPassiveDamageReduction() {
    return this.singleTargetDamageReduction * this.buffsActive;
  }
  isApplicableBuffEvent(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DEVOTION_AURA_BUFF.id) {
      return false;
    }
    if (this.owner.toPlayer(event)) {
      // We already include the selected player by default, if he dies the buff might show up. So to make sure it's not accidentally considered, we exclude it here.
      return false;
    }
    const combatant = this.combatants.players[event.targetID];
    if (!combatant) {
      // Only players scale the buff, while pets can get it they do not affect the DR split
      return false;
    }

    return true;
  }
  onApplyBuff(event) {
    if (!this.isApplicableBuffEvent(event)) {
      return;
    }
    this.buffsActive += 1;
    // this.debug('devo applied to', this.combatants.players[event.targetID].name, this.buffsActive);
  }
  onRemoveBuff(event) {
    if (!this.isApplicableBuffEvent(event)) {
      return;
    }
    this.buffsActive -= 1;
    // this.debug('devo removed from', this.combatants.players[event.targetID].name, this.buffsActive);
    if (this.buffsActive === 0) {
      console.error(
        'We lost more Devotion Aura buffs than we gained, this should not be possible as applybuffs are fabricated for all removebuffs.',
      );
      this.buffsActive = 1;
    }
  }

  get auraMasteryUptimeFilter() {
    const buffHistory = this.selectedCombatant.getBuffHistory(
      SPELLS.AURA_MASTERY.id,
      this.owner.playerId,
    );
    if (buffHistory.length === 0) {
      return null;
    }
    // WCL's filter requires the timestamp to be relative to fight start
    return buffHistory
      .map(
        buff =>
          `(timestamp>=${buff.start - this.owner.fight.start_time} AND timestamp<=${buff.end -
            this.owner.fight.start_time})`,
      )
      .join(' OR ');
  }
  get filter() {
    const playerName = this.owner.player.name;
    // Include any damage while selected player has AM, and is above the health requirement,
    // and the mitigation percentage is greater than 19% (we use this to reduce the false positives. We use DR-1% to account for rounding)
    return `(IN RANGE FROM target.name='${playerName}' AND type='${
      EventType.ApplyBuff
    }' AND ability.id=${SPELLS.AURA_MASTERY.id} TO target.name='${playerName}' AND type='${
      EventType.RemoveBuff
    }' AND ability.id=${SPELLS.AURA_MASTERY.id} END)
      AND (mitigatedDamage/rawDamage*100)>${DEVOTION_AURA_ACTIVE_DAMAGE_REDUCTION * 100 - 1}`;
  }

  load() {
    return fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: this.filter,
    }).then(json => {
      console.log('Received AM damage taken', json);
      const totalDamageTaken = json.entries.reduce(
        (damageTaken, entry) => damageTaken + entry.total,
        0,
      );
      this.activeDamageReduced =
        (totalDamageTaken / (1 - DEVOTION_AURA_ACTIVE_DAMAGE_REDUCTION)) *
        DEVOTION_AURA_ACTIVE_DAMAGE_REDUCTION;
    });
  }

  statistic() {
    const tooltip = (
      <Trans>
        The total estimated damage reduced <strong>by the passive</strong> was{' '}
        {formatThousands(this.passiveDamageReduced)} ({formatNumber(this.passiveDrps)} DRPS). This
        has high accuracy.
        <br />
        The total estimated damage reduced <strong>during Aura Mastery</strong> was{' '}
        {formatThousands(this.activeDamageReduced)} ({formatNumber(this.activeDrps)} DRPS). This has
        a 99% accuracy.
        <br />
        <br />
        This value is calculated using the <i>Optional DRs</i> method. This results in the lowest
        possible damage reduction value being shown. This should be the correct value in most
        circumstances.
        <br />
        <br />
        Calculating the exact damage reduced by Devotion Aura is very time and resource consuming.
        This method uses a very close estimation. The active damage reduced is calculated by taking
        the total damage taken of the entire raid during <SpellLink
          id={SPELLS.AURA_MASTERY.id}
        />{' '}
        and calculating the damage reduced during this time. The passive damage reduction is
        calculated by taking the exact damage reduction factor applicable and calculating the damage
        reduced if that full effect was applied to the Paladin. Even though the passive damage
        reduction is split among other nearby players, using your personal damage taken should
        average it out very closely. More extensive tests that go over all damage events have shown
        that this is usually a close approximation.
      </Trans>
    );

    return (
      <LazyLoadStatisticBox
        position={STATISTIC_ORDER.OPTIONAL(60)}
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.DEVOTION_AURA.id} />}
        value={<Trans>≈{formatNumber(this.totalDrps)} DRPS</Trans>}
        label={<Trans>Damage reduction</Trans>}
        tooltip={tooltip}
        drilldown={makeWclUrl(this.owner.report.code, {
          fight: this.owner.fightId,
          type: 'damage-taken',
          pins: `2$Off$#244F4B$expression$${this.filter}`,
          view: 'events',
        })}
      />
    );
  }
}

export default DevotionAuraDamageReduction;
