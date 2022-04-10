import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class TheRotten extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  cpGained: number = 0;
  cpWasted: number = 0;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.THE_ROTTEN);
    this.addEventListener(
      Events.resourcechange
        .by(SELECTED_PLAYER)
        .spell([SPELLS.SHADOWSTRIKE, SPELLS.BACKSTAB, SPELLS.GLOOMBLADE_TALENT]),
      this.onDamage,
    );
  }

  onDamage(event: ResourceChangeEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.SYMBOLS_OF_DEATH.id)) {
      this.cpGained += event.resourceChange;
      this.cpWasted += event.waste;
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            The Rotten helped you gain {this.cpGained + this.cpWasted} extra Combo Points with{' '}
            {this.cpWasted} Combo Points being wasted.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.THE_ROTTEN.id}>
          <ResourceIcon id={RESOURCE_TYPES.COMBO_POINTS.id} noLink />
          {this.cpGained}/{this.cpWasted + this.cpGained}
          <small> extra Combo Points gained.</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TheRotten;
