import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Penance from './Penance';
import Statistic from 'parser/ui/Statistic';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { getDamageEvent } from '../../normalizers/AtonementTracker';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import TalentSpellText from 'parser/ui/TalentSpellText';
import PowerWordShield from './PowerWordShield';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { SpellLink } from 'interface';
import { getCastAbility } from '../../normalizers/DamageCastLink';

/*
  * Weal and Woe
Your Penance bolts increase the damage of your next Smite or Power Word: Solace by 12%, or the absorb of your next Power Word: Shield by 5%.

  When you cast penance, you get a weal and woe buff. If you cast smite, solace or shield while you have this buff, you get a bonus.
  The bonus is 12% for smite and solace, and 5% for shield.
  */

const WEAL_AND_WOE_BONUS_DAMAGE = 0.12;
// const WEAL_AND_WOE_BONUS_SHIELD = 0.05;

class WealAndWoe extends Analyzer {
  static dependencies = {
    penance: Penance, // we need this to add `penanceBoltNumber` to the damage and heal events
    powerWordShield: PowerWordShield,
  };

  protected powerWordShield!: PowerWordShield;
  healing = 0;
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.WEAL_AND_WOE_TALENT);
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.SMITE, TALENTS_PRIEST.POWER_WORD_SOLACE_TALENT]),
      this.onDamage,
    );
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ATONEMENT_HEAL_CRIT, SPELLS.ATONEMENT_HEAL_NON_CRIT]),
      this.onAtoneHeal,
    );
  }

  onDamage(event: DamageEvent) {
    if (
      event.ability.guid !== SPELLS.SMITE.id &&
      event.ability.guid !== TALENTS_PRIEST.POWER_WORD_SOLACE_TALENT.id
    ) {
      return;
    }

    const castEvent = getCastAbility(event);
    const WEAL_AND_WOE_STACKS = this.selectedCombatant.getBuffStacks(
      SPELLS.WEAL_AND_WOE_BUFF.id,
      castEvent.timestamp,
    );
    if (WEAL_AND_WOE_STACKS > 0) {
      this.damage += calculateEffectiveDamage(
        event,
        WEAL_AND_WOE_BONUS_DAMAGE * WEAL_AND_WOE_STACKS,
      );
    }
  }

  onAtoneHeal(event: HealEvent) {
    if (!getDamageEvent(event)) {
      return;
    }

    const damageEvent = getDamageEvent(event);

    if (
      damageEvent.ability.guid !== SPELLS.SMITE.id &&
      damageEvent.ability.guid !== TALENTS_PRIEST.POWER_WORD_SOLACE_TALENT.id
    ) {
      return;
    }

    const castEvent = getCastAbility(damageEvent);
    const WEAL_AND_WOE_STACKS = this.selectedCombatant.getBuffStacks(
      SPELLS.WEAL_AND_WOE_BUFF.id,
      castEvent.timestamp,
    );

    if (WEAL_AND_WOE_STACKS > 0) {
      this.healing += calculateEffectiveHealing(
        event,
        WEAL_AND_WOE_BONUS_DAMAGE * WEAL_AND_WOE_STACKS,
      );
    }
  }

  statistic() {
    // const totalHealing = this.healing + this.powerWordShield.wealValue;
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            The healing represents healing done by <SpellLink id={SPELLS.SMITE} />,{' '}
            <SpellLink id={TALENTS_PRIEST.POWER_WORD_SOLACE_TALENT} /> and{' '}
            <SpellLink id={SPELLS.POWER_WORD_SHIELD} />.
          </>
        }
      >
        <TalentSpellText talent={TALENTS_PRIEST.WEAL_AND_WOE_TALENT}>
          <>
            <ItemHealingDone amount={this.healing} /> <br />
            <ItemDamageDone amount={this.damage} />
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}
export default WealAndWoe;
