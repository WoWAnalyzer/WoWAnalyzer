import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Events, { ApplyBuffEvent, DamageEvent, EnergizeEvent, RemoveBuffEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Combatants from 'parser/shared/modules/Combatants';
import ItemManaGained from 'parser/ui/ItemManaGained';
import ItemInsanityGained from 'parser/priest/shadow/interface/ItemInsanityGained';
import { formatNumber } from 'common/format';
import Abilities from 'parser/core/modules/Abilities';
import SPECS from 'game/SPECS';

const GUARDIAN_DAMAGE_REDUCTION = .1;

// Holy: https://www.warcraftlogs.com/reports/2frFV7hnRg4ZxXcA#fight=5
// Shadow: https://www.warcraftlogs.com/reports/WqcaKR9nNkChXyfm#fight=5
// Disc: https://www.warcraftlogs.com/reports/6bRMLg9fr4wThkdP#fight=37
class FaeGuardians extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
  };
  protected combatants!: Combatants;
  protected abilities!: Abilities;

  totalCasts = 0;

  // Wrathful Faerie
  manaGenerated = 0;
  insanityGenerated = 0;

  // Guardian Faerie
  currentShieldedTargetId = -1;
  damageReduced = 0;

  // Benevolent Faerie
  benevolentApplicationTime = 0;
  benevolentBuffUptime = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);
    if (!this.active) {
      return;
    }

    const castEfficiency = this.selectedCombatant.spec === SPECS.SHADOW_PRIEST ? {
      suggestion: true,
      recommendedEfficiency: 0.9,
      averageIssueEfficiency: 0.8,
      majorIssueEfficiency: 0.7,
    } : {
      suggestion: true,
      recommendedEfficiency: 0.8,
      averageIssueEfficiency: 0.6,
      majorIssueEfficiency: 0.4,
    };
    (options.abilities as Abilities).add({
      spell: SPELLS.FAE_GUARDIANS,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      cooldown: 90,
      enabled: true,
      gcd: {
        base: 1500,
      },
      castEfficiency: castEfficiency,
    });

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FAE_GUARDIANS), this.onCast);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.WRATHFUL_FAERIE_ENERGIZE), this.onEnergize);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GUARDIAN_FAERIE), this.onGuardianApply);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.GUARDIAN_FAERIE), this.onGuardianRemove);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BENEVOLENT_FAERIE), this.onBenevolentApply);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BENEVOLENT_FAERIE), this.onBenevolentRemove);
    this.addEventListener(Events.damage, this.onDamage);
  }

  onDamage(event: DamageEvent) {
    if (event.targetID !== this.currentShieldedTargetId) {
      return;
    }
    this.damageReduced += (event.amount || 0) / (1 - GUARDIAN_DAMAGE_REDUCTION);
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

  onBenevolentApply(event: ApplyBuffEvent) {
    this.benevolentApplicationTime = event.timestamp;
  }

  onBenevolentRemove(event: RemoveBuffEvent) {
    this.benevolentBuffUptime += event.timestamp - this.benevolentApplicationTime;
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
            {this.manaGenerated > 0 && <><ItemManaGained amount={this.manaGenerated} /><br /></>}
            {this.insanityGenerated > 0 && <><ItemInsanityGained amount={this.insanityGenerated} /><br /></>}
            {formatNumber(this.damageReduced)} Dmg Reduced<br />
            {formatNumber(this.benevolentBuffUptime / 1000)} Seconds CDR
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FaeGuardians;
