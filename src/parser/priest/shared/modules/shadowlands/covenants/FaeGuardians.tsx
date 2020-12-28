import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Events, { ApplyBuffEvent, DamageEvent, EnergizeEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Combatants from 'parser/shared/modules/Combatants';
import ItemManaGained from 'interface/ItemManaGained';
import ItemInsanityGained from 'parser/priest/shadow/interface/ItemInsanityGained';
import { formatNumber } from 'common/format';

const GUARDIAN_DAMAGE_REDUCTION = .1;

// Holy: https://www.warcraftlogs.com/reports/2frFV7hnRg4ZxXcA#fight=5
// Shadow: https://www.warcraftlogs.com/reports/WqcaKR9nNkChXyfm#fight=5
// Disc: https://www.warcraftlogs.com/reports/6bRMLg9fr4wThkdP#fight=37
class FaeGuardians extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  }
  protected combatants!: Combatants;

  totalCasts = 0;

  // Wrathful Faerie
  manaGenerated = 0;
  insanityGenerated = 0;

  // Guardian Faerie
  currentShieldedTargetId = -1;
  damageReduced = 0;

  get benevolentUptime(){
    return this.combatants.getBuffUptime(SPELLS.BENEVOLENT_FAERIE.id);
  }

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FAE_GUARDIANS), this.onCast);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.WRATHFUL_FAERIE_ENERGIZE), this.onEnergize);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GUARDIAN_FAERIE), this.onGuardianApply);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.GUARDIAN_FAERIE), this.onGuardianRemove);
    this.addEventListener(Events.damage, this.onDamage);
  }

  onDamage(event: DamageEvent) {
    if (event.targetID !== this.currentShieldedTargetId){
      return;
    }
    this.damageReduced += (event.amount || 0)/(1-GUARDIAN_DAMAGE_REDUCTION)
  }

  onEnergize(event: EnergizeEvent) {
    if (event.resourceChangeType === RESOURCE_TYPES.MANA.id) {
      this.manaGenerated += (event.resourceChange || 0);
    }
    if (event.resourceChangeType === RESOURCE_TYPES.INSANITY.id) {
      this.insanityGenerated += (event.resourceChange || 0);
    }
  }

  onGuardianApply(event: ApplyBuffEvent) {
    this.currentShieldedTargetId = event.targetID;
  }

  onGuardianRemove() {
    this.currentShieldedTargetId = -1;
  }

  onCast() {
    this.totalCasts += 1;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.COVENANTS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.FAE_GUARDIANS}>
          <>
            {this.manaGenerated > 0 && <><ItemManaGained amount={this.manaGenerated} /><br/></>}
            {this.insanityGenerated > 0 && <><ItemInsanityGained amount={this.insanityGenerated} /><br/></>}
            {formatNumber(this.damageReduced)} Dmg Reduced<br />
            {formatNumber(this.benevolentUptime/1000)} Seconds CDR
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FaeGuardians;
