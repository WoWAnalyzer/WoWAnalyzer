import React from 'react';

import ItemHealingDone from 'interface/ItemHealingDone';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import COVENANTS from 'game/shadowlands/COVENANTS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, DamageEvent, EnergizeEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

import AtonementDamageSource from 'parser/priest/discipline/modules/features/AtonementDamageSource';
import isAtonement from 'parser/priest/discipline/modules/core/isAtonement';
import SPECS from 'game/SPECS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ItemInsanityGained from 'parser/priest/shadow/interface/ItemInsanityGained';
import ItemDamageDone from 'interface/ItemDamageDone';
import ItemManaGained from 'interface/ItemManaGained';

// Shadow: https://www.warcraftlogs.com/reports/Bx7h3bzGKm9CHqF6#fight=1&type=damage-done&source=10
// Holy: https://www.warcraftlogs.com/reports/MCyn6jhQf13YbRHt#fight=14&type=healing&source=41
// Disc: https://www.warcraftlogs.com/reports/NWctPky1vKapJVM8#fight=10&type=healing&graphperf=1&source=183
class Mindgames extends Analyzer {
  directHealing = 0;
  preventedDamage = 0;
  totalDamage = 0;
  manaGenerated = 0;

  // Disc Specific
  atonementDamageSource: AtonementDamageSource | null = null;
  atonementHealing = 0;

  // Shadow Specific
  insanityGenerated = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);

    if(this.selectedCombatant.spec === SPECS.DISCIPLINE_PRIEST) {
      this.atonementDamageSource = this.owner.getModule(AtonementDamageSource);
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.MINDGAMES_ABSORB), this.onMindgamesAbsorbed);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.MINDGAMES_HEAL), this.onEnergize);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MINDGAMES), this.onDamage);
  }

  onHeal(event: HealEvent) {
    if (isAtonement(event) && this.atonementDamageSource) {
      const atonenementDamageEvent = this.atonementDamageSource.event;
      if (!atonenementDamageEvent || atonenementDamageEvent.ability.guid !== SPELLS.MINDGAMES.id) {
        return;
      }

      this.atonementHealing += event.amount + (event.absorbed || 0);
      return;
    }

    const spellId = event.ability.guid;
    if (spellId === SPELLS.MINDGAMES_HEAL.id) {
      this.directHealing += event.amount + (event.absorbed || 0);
      return;
    }
  }

  onMindgamesAbsorbed(event: AbsorbedEvent) {
    this.preventedDamage += event.amount;
  }

  onEnergize(event: EnergizeEvent) {
    if (event.resourceChangeType === RESOURCE_TYPES.MANA.id) {
      this.manaGenerated += (event.resourceChange || 0);
    }
    if (event.resourceChangeType === RESOURCE_TYPES.INSANITY.id) {
      this.insanityGenerated += (event.resourceChange || 0);
    }
  }

  onDamage(event: DamageEvent) {
    this.totalDamage += event.amount;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={(
          <>
            Healing Breakdown:
            <ul>
              {this.atonementHealing > 0 && <li>{formatNumber(this.atonementHealing)} Atonement Healing</li>}
              <li>{formatNumber(this.directHealing)} Direct Healing</li>
              <li>{formatNumber(this.preventedDamage)} Prevented Damage</li>
            </ul>
          </>
        )}
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.MINDGAMES}>
          <>
            <ItemDamageDone amount={this.totalDamage} /><br/>
            <ItemHealingDone amount={this.atonementHealing + this.directHealing + this.preventedDamage} /><br/>
            {this.insanityGenerated > 0 && <><ItemInsanityGained amount={this.insanityGenerated} /><br/></>}
            {this.manaGenerated > 0 && <><ItemManaGained amount={this.manaGenerated} /><br/></>}
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Mindgames;
