import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Events, { HealEvent } from 'parser/core/Events';
import { getDamageEvent } from '../../normalizers/AtonementTracker';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import TalentSpellText from 'parser/ui/TalentSpellText';

const ABYSSAL_REVERIE_INCREASE = 0.05;

class AbyssalReverie extends Analyzer {
  healing = 0;
  abyssalReverieIncrease = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.ABYSSAL_REVERIE_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ATONEMENT_HEAL_CRIT, SPELLS.ATONEMENT_HEAL_NON_CRIT]),
      this.onAtoneHeal,
    );
    this.abyssalReverieIncrease =
      this.selectedCombatant.getTalentRank(TALENTS_PRIEST.ABYSSAL_REVERIE_TALENT) *
      ABYSSAL_REVERIE_INCREASE;
  }

  onAtoneHeal(event: HealEvent) {
    const damageEvent = getDamageEvent(event);
    if (!damageEvent) {
      return;
    }
    if (
      // Shadow spells only
      damageEvent.ability.type !== MAGIC_SCHOOLS.ids.SHADOW ||
      // no pets here
      damageEvent.ability.guid === -MAGIC_SCHOOLS.ids.SHADOW
    ) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, this.abyssalReverieIncrease);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(15)}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_PRIEST.ABYSSAL_REVERIE_TALENT}>
          <>
            <ItemHealingDone amount={this.healing} /> <br />
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default AbyssalReverie;
