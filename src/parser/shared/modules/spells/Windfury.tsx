import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'interface/ItemDamageDone';
import HIT_TYPES from 'game/HIT_TYPES';
import { formatPercentage } from 'common/format';
import SPECS from 'game/SPECS';

/*
  Checks if the player had windfury uptime, if so this module will look at the time between melee swings
  A swing within 200ms of the previous one is counted as windfury proc

  Parrying a hit reduces the next swing timer by 40%, thats why we ignore them
*/

// ToDo: look how dualwielding timers and hunters work

const WINDFURY_TRESHOLD = 200 // every melee 200ms after its previous one are windfury procs
const WHITELIST =[
  SPECS.HOLY_PALADIN,
  SPECS.PROTECTION_PALADIN,
  SPECS.RETRIBUTION_PALADIN,
  SPECS.ARMS_WARRIOR,
  // fury
  SPECS.PROTECTION_WARRIOR,
  SPECS.FERAL_DRUID, // feral & guardian are singlehanded
  SPECS.GUARDIAN_DRUID,
  SPECS.BLOOD_DEATH_KNIGHT,
  SPECS.UNHOLY_DEATH_KNIGHT,
  SPECS.FROST_DEATH_KNIGHT, // 2h only
  // range hunters
  SPECS.SURVIVAL_HUNTER,
  // rogues
  // enh shaman
  SPECS.BREWMASTER_MONK,
  // windwalker
  SPECS.MISTWEAVER_MONK
]

class Windfury extends Analyzer {
  swingResets: number = 0;
  swingResetDamage: number = 0;

  lastSwing: number = 0;
  lastParry: boolean = false;

  constructor(options: Options) {
    super(options);

    const isWhitelisted = Boolean(WHITELIST.find((spec: { id: number; }) => spec.id === this.selectedCombatant.specId)?.id)
    const isUsing2h = Boolean(this.selectedCombatant.mainHand.id) && !this.selectedCombatant.offHand.id
    const active = isWhitelisted && isUsing2h;
    this.active = active;
    if (!active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MELEE), this._onMelee);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this._onParry);
  }

  _onParry(event: DamageEvent) {
    if (![HIT_TYPES.PARRY].includes(event.hitType)) {
      return;
    }

    this.lastParry = true;
  }

  _onMelee(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.WINDFURY_TOTEM_BUFF.id)) {
      return;
    }

    // parries reduce the new swing timer by 40%, ignore melees after parries 
    if (this.lastParry) {
      this.lastParry = false
      return;
    }

    const diff = event.timestamp - this.lastSwing;
    if (diff <= WINDFURY_TRESHOLD) {
      this.swingResets += 1;
      this.swingResetDamage += event.amount + (event.absorb || 0);
    }
    this.lastSwing = event.timestamp;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.WINDFURY_TOTEM_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    // show this stat for all specs whitelisted specs that had uptime
    if (this.uptime === 0) {
      return
    }

    return (
      <Statistic
        category={STATISTIC_CATEGORY.GENERAL}
        size="flexible"
        tooltip={(
          <>
            <strong>{this.swingResets}</strong> windfury procs (totem uptime was {formatPercentage(this.uptime)}%).<br/><br/>
            Tracking windfury at 100% accuracy is impossible as they just appear as additional melee hits, but tracking the time between melee swings and ignoring parry-hasted ones makes it a fairly reliable method.<br/>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.WINDFURY_TOTEM}>
          <>
            <ItemDamageDone amount={this.swingResetDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default Windfury;
