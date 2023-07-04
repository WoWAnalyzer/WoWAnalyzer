import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class DeathChakrams extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  damage: number = 0;
  focusGained: number = 0;
  focusWasted: number = 0;

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.DEATH_CHAKRAM_TALENT);

    if (!this.active) {
      return;
    }

    (options.abilities as Abilities).add({
      spell: TALENTS.DEATH_CHAKRAM_TALENT.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: 45,
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.9,
      },
    });

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DEATH_CHAKRAM_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.DEATH_CHAKRAM_ENERGIZE),
      this.onEnergize,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onEnergize(event: ResourceChangeEvent) {
    this.focusGained += event.resourceChange;
    this.focusWasted += event.waste;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.DEATH_CHAKRAM_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink /> {this.focusGained}/
            {this.focusWasted + this.focusGained} <small>Focus gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DeathChakrams;
