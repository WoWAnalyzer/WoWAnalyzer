import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, SummonEvent } from 'parser/core/Events';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const ETERNAL_HUNGER_BASE_INCREASE = 0.054;
const ETERNAL_HUNGER_PER_RANK = 0.006;

class EternalHunger extends Analyzer {
  conduitRank: number = 0;
  addedDamage: number = 0;
  increase!: number;
  pets: Array<{ sourceID: number; sourceInstance: number }> = [];

  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.ETERNAL_HUNGER.id);

    if (!this.conduitRank) {
      this.active = false;
      return;
    }
    this.increase = ETERNAL_HUNGER_BASE_INCREASE + this.conduitRank * ETERNAL_HUNGER_PER_RANK;

    // Can't filter this .by(SELECTED_PLAYER_PET) since that only includes pets present
    // in the combatant info, not temporary ones tracked during combat as they are summoned.
    this.addEventListener(Events.damage, this.onDamage);
    this.addEventListener(Events.summon.by(SELECTED_PLAYER), this.onSummon);
  }

  isPet(event: DamageEvent) {
    return (
      event.sourceID != null &&
      event.sourceInstance != null &&
      this.pets.some(
        (pet) => event.sourceID === pet.sourceID && event.sourceInstance === pet.sourceInstance,
      )
    );
  }

  onSummon(event: SummonEvent) {
    this.pets.push({ sourceID: event.targetID, sourceInstance: event.targetInstance });
  }

  onDamage(event: DamageEvent) {
    if (this.isPet(event) || this.owner.byPlayerPet(event)) {
      this.addedDamage += calculateEffectiveDamage(event, this.increase);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spellId={SPELLS.ETERNAL_HUNGER.id} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default EternalHunger;
