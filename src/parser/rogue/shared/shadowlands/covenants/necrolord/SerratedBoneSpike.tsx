import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent, EnergizeEvent, RemoveDebuffEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import COVENANTS from 'game/shadowlands/COVENANTS';
import ItemDamageDone from 'interface/ItemDamageDone';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ResourceIcon from 'common/ResourceIcon';

class SerratedBoneSpike extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };
  damage: number = 0;
  comboPointsGained: number = 0;
  comboPointsWasted: number = 0;

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NECROLORD.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SERRATED_BONE_SPIKE), this.onDamage);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.SERRATED_BONE_SPIKE_ENERGIZE), this.onEnergize);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.SERRATED_BONE_SPIKE_DEBUFF), this.onSBSRemoveDebuff);
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onEnergize(event: EnergizeEvent) {
    if (event.resourceChangeType === RESOURCE_TYPES.COMBO_POINTS.id) {
      this.comboPointsGained += event.resourceChange;
      this.comboPointsWasted += event.waste;
    }
  }

  onSBSRemoveDebuff(event: RemoveDebuffEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.SERRATED_BONE_SPIKE.id)) {
      const expectedCooldownDuration = this.abilities.getExpectedCooldownDuration(SPELLS.SERRATED_BONE_SPIKE.id, this.spellUsable.cooldownTriggerEvent(SPELLS.SERRATED_BONE_SPIKE.id));
      if (expectedCooldownDuration) {
        this.spellUsable.reduceCooldown(SPELLS.SERRATED_BONE_SPIKE, expectedCooldownDuration, event.timestamp);
      }
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.SERRATED_BONE_SPIKE_DEBUFF}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            <ResourceIcon id={RESOURCE_TYPES.COMBO_POINTS.id} noLink />
            {this.comboPointsGained}/{this.comboPointsWasted + this.comboPointsGained}
            <small> gained Combo Points</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SerratedBoneSpike;
