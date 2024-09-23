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
import { formatNumber } from 'common/format';

/*
  * Weal and Woe
Your Penance bolts increase the damage of your next Smite or Power Word: Solace by 12%, or the absorb of your next Power Word: Shield by 5%.

  When you cast penance, you get a weal and woe buff. If you cast smite, solace or shield while you have this buff, you get a bonus.
  The bonus is 12% for smite and solace, and 5% for shield.
  */

const WEAL_AND_WOE_BONUS_DAMAGE = 0.2;
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
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.SMITE, SPELLS.VOID_BLAST_DAMAGE_DISC]),
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
      event.ability.guid !== SPELLS.VOID_BLAST_DAMAGE_DISC.id
    ) {
      return;
    }

    const castEvent = getCastAbility(event)!;
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
    const damageEvent = getDamageEvent(event);
    if (!damageEvent) {
      return;
    }
    if (
      damageEvent.ability.guid !== SPELLS.SMITE.id &&
      damageEvent.ability.guid !== SPELLS.VOID_BLAST_DAMAGE_DISC.id
    ) {
      return;
    }

    const castEvent = getCastAbility(damageEvent)!;
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
    const totalHealing = this.healing + this.powerWordShield.wealValue;
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Healing Breakdown:
            <ul>
              <li>
                <SpellLink spell={SPELLS.SMITE} />: {formatNumber(this.healing)}{' '}
              </li>
              <li>
                <SpellLink spell={SPELLS.POWER_WORD_SHIELD} />:{' '}
                {formatNumber(this.powerWordShield.wealValue)}{' '}
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_PRIEST.WEAL_AND_WOE_TALENT}>
          <>
            <ItemHealingDone amount={totalHealing} /> <br />
            <ItemDamageDone amount={this.damage} />
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}
export default WealAndWoe;
