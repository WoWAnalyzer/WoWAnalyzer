import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../core/AtonementAnalyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import PurgeTheWicked from '../features/EncroachingShadows';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';

class ThroesOfPain extends Analyzer {
  static dependencies = {
    purgeTheWicked: PurgeTheWicked,
  };

  protected purgeTheWicked!: PurgeTheWicked;

  healing = 0;
  damage = 0;
  manaGained = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.THROES_OF_PAIN_TALENT);
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtonement);
    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.onManaGain);
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.PURGE_THE_WICKED_BUFF, SPELLS.SHADOW_WORD_PAIN]),
      this.onDamage,
    );
  }

  onAtonement(event: AtonementAnalyzerEvent) {
    const { healEvent, damageEvent } = event;

    if (
      !damageEvent ||
      (damageEvent.ability.guid !== SPELLS.PURGE_THE_WICKED_BUFF.id &&
        damageEvent.ability.guid !== SPELLS.SHADOW_WORD_PAIN.id)
    ) {
      return;
    }

    this.healing += calculateEffectiveHealing(healEvent, this.purgeTheWicked.throesOfPainIncrease);
  }

  onDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, this.purgeTheWicked.throesOfPainIncrease);
  }

  onManaGain(event: ResourceChangeEvent) {
    this.manaGained += event.resourceChange;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <SpellLink spell={TALENTS_PRIEST.THROES_OF_PAIN_TALENT} /> also restored{' '}
            {this.manaGained} mana.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.THROES_OF_PAIN_TALENT}>
          <>
            <ItemHealingDone amount={this.healing} /> <br />
            <ItemDamageDone amount={this.damage} /> <br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ThroesOfPain;
