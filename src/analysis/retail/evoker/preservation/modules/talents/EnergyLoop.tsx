import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import EssenceBurst from './EssenceBurst';

class EnergyLoop extends Analyzer {
  static dependencies = {
    essenceBurst: EssenceBurst,
  };
  protected essenceBurst!: EssenceBurst;
  rawManaGained: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.ENERGY_LOOP_TALENT);
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.ENERGY_LOOP_BUFF),
      this.onGainMana,
    );
  }

  onGainMana(event: ResourceChangeEvent) {
    this.rawManaGained += event.resourceChange - event.waste;
  }

  get totalManaSaved() {
    return this.rawManaGained - this.potentialManaLost;
  }

  get potentialManaLost() {
    return (
      this.essenceBurst.consumptionCount.Disintegrate *
      this.essenceBurst.averageManaSavedForHealingSpells
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>Raw mana gained: {formatNumber(this.rawManaGained)}</li>
            <li>
              Potential mana lost from using <SpellLink id={TALENTS_EVOKER.ESSENCE_BURST_TALENT} />{' '}
              on <SpellLink id={SPELLS.DISINTEGRATE} />: {formatNumber(this.potentialManaLost)}
            </li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.ENERGY_LOOP_TALENT}>
          <ItemManaGained amount={this.totalManaSaved} useAbbrev />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default EnergyLoop;
