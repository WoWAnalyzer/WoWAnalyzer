import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class DashingScoundrel extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  critCount: number = 0;
  comboPointsGained: number = 0;
  comboPointsWasted: number = 0;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.DASHING_SCOUNDREL_ITEM);
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.DASHING_SCOUNDREL),
      this.onEnergize,
    );
  }

  onEnergize(event: ResourceChangeEvent) {
    this.critCount += 1;
    this.comboPointsGained += event.resourceChange;
    this.comboPointsWasted += event.waste;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            Dashing Scoundrel was responsible for {this.critCount} critical hits resulting in{' '}
            {this.comboPointsGained + this.comboPointsWasted} bonus ComboPoints being earned.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.DASHING_SCOUNDREL.id}>
          <ResourceIcon id={RESOURCE_TYPES.COMBO_POINTS.id} noLink /> {this.comboPointsGained}/
          {this.comboPointsWasted + this.comboPointsGained}{' '}
          <small> extra Combo Points gained.</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DashingScoundrel;
