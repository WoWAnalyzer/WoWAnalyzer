import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, RemoveDebuffEvent, ResourceChangeEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import TalentSpellText from 'parser/ui/TalentSpellText';

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
    this.active = this.selectedCombatant.hasTalent(TALENTS.SERRATED_BONE_SPIKE_TALENT);
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([TALENTS.SERRATED_BONE_SPIKE_TALENT, SPELLS.SERRATED_BONE_SPIKE_DEBUFF]),
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
    if (this.spellUsable.isOnCooldown(TALENTS.SERRATED_BONE_SPIKE_TALENT.id)) {
      const expectedCooldownDuration = this.abilities.getExpectedCooldownDuration(
        TALENTS.SERRATED_BONE_SPIKE_TALENT.id,
      );
      if (expectedCooldownDuration) {
        this.spellUsable.reduceCooldown(
          TALENTS.SERRATED_BONE_SPIKE_TALENT.id,
          expectedCooldownDuration,
          event.timestamp,
        );
      }
    }
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <TalentSpellText talent={TALENTS.SERRATED_BONE_SPIKE_TALENT}>
          <ItemDamageDone amount={this.damage} />
          <br />
          <ResourceIcon id={RESOURCE_TYPES.COMBO_POINTS.id} noLink />
          {this.comboPointsGained}/{this.comboPointsWasted + this.comboPointsGained}
          <small> gained Combo Points</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SerratedBoneSpike;
