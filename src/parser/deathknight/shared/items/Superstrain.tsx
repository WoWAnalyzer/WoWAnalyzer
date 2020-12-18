import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Events, { DamageEvent, EnergizeEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPECS from 'game/SPECS';
import ItemDamageDone from 'interface/ItemDamageDone';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { formatNumber } from 'common/format';
import { LegendarySpell } from 'common/SPELLS/Spell';

class Superstrain extends Analyzer {

  frostFeverRPGained: number = 0
  frostFeverRPWasted: number = 0
  frostFeverDamage: number = 0
  bloodPlagueDamage: number = 0
  virulentPlagueDamage: number = 0

  constructor(options: Options) {
    super(options);
    const SUPERSTRAIN: LegendarySpell = SPELLS.SUPERSTRAIN as LegendarySpell
    const active = this.selectedCombatant.hasLegendaryByBonusID(SUPERSTRAIN.bonusID!)
    this.active = active
    if (!active) {
      return;
    }

    if ([SPECS.BLOOD_DEATH_KNIGHT, SPECS.UNHOLY_DEATH_KNIGHT].includes(this.selectedCombatant.spec)) {
      this.addEventListener(Events.energize, this._onFrostFeverEnergize)
    }


    if (this.selectedCombatant.spec === SPECS.BLOOD_DEATH_KNIGHT) {
      this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FROST_FEVER), this._onFrostFeverDamage)
      this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.VIRULENT_PLAGUE), this._onVirulentPlagueDamage)
    }

    if (this.selectedCombatant.spec === SPECS.UNHOLY_DEATH_KNIGHT) {
      this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FROST_FEVER), this._onFrostFeverDamage)
      this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLOOD_PLAGUE), this._onBloodPlagueDamage)
    }

    if (this.selectedCombatant.spec === SPECS.FROST_DEATH_KNIGH) {
      this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.VIRULENT_PLAGUE), this._onVirulentPlagueDamage)
      this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLOOD_PLAGUE), this._onBloodPlagueDamage)
    }
  }

  _onFrostFeverDamage(event: DamageEvent) {
    this.frostFeverDamage += event.amount + (event.absorb || 0)
  }

  _onBloodPlagueDamage(event: DamageEvent) {
    this.bloodPlagueDamage += event.amount + (event.absorb || 0)
  }

  _onVirulentPlagueDamage(event: DamageEvent) {
    this.virulentPlagueDamage += event.amount + (event.absorb || 0)
  }

  _onFrostFeverEnergize(event: EnergizeEvent) {
    if (event.resourceChangeType !== RESOURCE_TYPES.RUNIC_POWER.id || event.ability.guid !== SPELLS.FROST_FEVER_RP_GAIN.id) {
      return;
    }

    this.frostFeverRPGained += event.resourceChange
    this.frostFeverRPWasted += event.waste
  }

  get frostFeverTotalRP() {
    return this.frostFeverRPGained + this.frostFeverRPWasted
  }

  get superStrainDamage() {
    return this.frostFeverDamage + this.bloodPlagueDamage + this.virulentPlagueDamage
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={(
          <>
            {this.frostFeverTotalRP > 0 && <><strong>Runic Power:</strong> {this.frostFeverRPGained} RP gained ({this.frostFeverRPWasted} wasted)<br /></>}
            {this.frostFeverDamage > 0 && <><strong>Frost Fever:</strong> {formatNumber(this.frostFeverDamage)} damage<br /></>}
            {this.bloodPlagueDamage > 0 && <><strong>Blood Plague:</strong> {formatNumber(this.bloodPlagueDamage)} damage<br /></>}
            {this.virulentPlagueDamage > 0 && <><strong>Virulent Plague:</strong> {formatNumber(this.virulentPlagueDamage)} damage<br /></>}
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.SUPERSTRAIN}>
          <>
            <ItemDamageDone amount={this.superStrainDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default Superstrain;
