import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { ResourceIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent, RemoveDebuffEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SPELLS from 'common/SPELLS';

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
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.SERRATED_BONE_SPIKE, SPELLS.SERRATED_BONE_SPIKE_DEBUFF]),
      this.onDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.SERRATED_BONE_SPIKE_ENERGIZE),
      this.onEnergize,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.SERRATED_BONE_SPIKE_DEBUFF),
      this.onSBSRemoveDebuff,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onEnergize(event: ResourceChangeEvent) {
    if (event.resourceChangeType === RESOURCE_TYPES.COMBO_POINTS.id) {
      this.comboPointsGained += event.resourceChange;
      this.comboPointsWasted += event.waste;
    }
  }

  onSBSRemoveDebuff(event: RemoveDebuffEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.SERRATED_BONE_SPIKE.id)) {
      const expectedCooldownDuration = this.abilities.getExpectedCooldownDuration(
        SPELLS.SERRATED_BONE_SPIKE.id,
      );
      if (expectedCooldownDuration) {
        this.spellUsable.reduceCooldown(
          SPELLS.SERRATED_BONE_SPIKE.id,
          expectedCooldownDuration,
          event.timestamp,
        );
      }
    }
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.COVENANTS}>
        <BoringSpellValueText spellId={SPELLS.SERRATED_BONE_SPIKE_DEBUFF.id}>
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
