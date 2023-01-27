import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/rogue';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

class EchoingReprimand extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  damage: number = 0;
  comboPointsGained: number = 0;
  comboPointsWasted: number = 0;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ECHOING_REPRIMAND_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.ECHOING_REPRIMAND_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS.ECHOING_REPRIMAND_TALENT),
      this.onEnergize,
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

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`${formatNumber(this.damage)} total damage done.`}
      >
        <TalentSpellText talent={TALENTS.ECHOING_REPRIMAND_TALENT}>
          <ItemDamageDone amount={this.damage} />
          <br />
          <ResourceIcon id={RESOURCE_TYPES.COMBO_POINTS.id} noLink />
          {this.comboPointsGained}/{this.comboPointsWasted + this.comboPointsGained}
          <small> Combo Points gained</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default EchoingReprimand;
