import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import SPELLS from 'common/SPELLS';
import { getDamageEvent } from '../../normalizers/AtonementTracker';

const WORDS_OF_THE_PIOUS_INCREASE = 0.1;

class WordsOfThePious extends Analyzer {
  healing = 0;
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.WORDS_OF_THE_PIOUS_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.SMITE, TALENTS_PRIEST.HOLY_NOVA_TALENT]),
      this.onDamage,
    );
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ATONEMENT_HEAL_CRIT, SPELLS.ATONEMENT_HEAL_NON_CRIT]),
      this.onAtoneHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HOLY_NOVA_HEAL),
      this.onHeal,
    );
  }

  onAtoneHeal(event: HealEvent) {
    if (!getDamageEvent(event)) {
      return;
    }

    if (!this.selectedCombatant.hasBuff(SPELLS.WORDS_OF_THE_PIOUS_BUFF.id)) {
      return;
    }
    const damageEvent = getDamageEvent(event);

    if (
      damageEvent.ability.guid !== TALENTS_PRIEST.HOLY_NOVA_TALENT.id &&
      damageEvent.ability.guid !== SPELLS.SMITE.id
    ) {
      return;
    }
    this.healing += calculateEffectiveHealing(event, WORDS_OF_THE_PIOUS_INCREASE);
  }

  onHeal(event: HealEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.WORDS_OF_THE_PIOUS_BUFF.id)) {
      return;
    }
    this.healing += calculateEffectiveHealing(event, WORDS_OF_THE_PIOUS_INCREASE);
  }

  onDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.WORDS_OF_THE_PIOUS_BUFF.id)) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, WORDS_OF_THE_PIOUS_INCREASE);
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringSpellValueText spell={TALENTS_PRIEST.WORDS_OF_THE_PIOUS_TALENT}>
          <>
            <ItemHealingDone amount={this.healing} /> <br />
            <ItemDamageDone amount={this.damage} /> <br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WordsOfThePious;
