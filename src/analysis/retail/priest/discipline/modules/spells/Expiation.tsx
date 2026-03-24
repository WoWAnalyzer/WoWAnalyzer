import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { getDamageEvent } from '../../normalizers/AtonementTracker';
import TalentSpellText from 'parser/ui/TalentSpellText';

const EXPIATION_RANK_INCREASE = 0.1;
class Expiation extends Analyzer {
  expiationHealing = 0;
  deathHealing = 0;
  mindBlastHealing = 0;
  talentRank = 0;
  expiationIncrease = 0;
  expiationDamage = 0;
  bonusDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.EXPIATION_TALENT);

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ATONEMENT_HEAL_CRIT, SPELLS.ATONEMENT_HEAL_NON_CRIT]),
      this.onAtoneHeal,
    );

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.EXPIATION_DAMAGE,
          TALENTS_PRIEST.SHADOW_WORD_DEATH_TALENT,
          SPELLS.MIND_BLAST,
        ]),
      this.onDamage,
    );
    this.talentRank = this.selectedCombatant.getTalentRank(TALENTS_PRIEST.EXPIATION_TALENT);
    this.expiationIncrease = this.talentRank * EXPIATION_RANK_INCREASE;
  }

  onAtoneHeal(event: HealEvent) {
    if (!getDamageEvent(event)) {
      return;
    }
    const damageEvent = getDamageEvent(event);

    if (
      damageEvent?.ability.guid !== SPELLS.EXPIATION_DAMAGE.id &&
      damageEvent?.ability.guid !== TALENTS_PRIEST.SHADOW_WORD_DEATH_TALENT.id &&
      damageEvent?.ability.guid !== SPELLS.MIND_BLAST.id
    ) {
      return;
    }

    if (damageEvent.ability.guid === SPELLS.EXPIATION_DAMAGE.id) {
      this.expiationHealing += event.amount;
    }

    if (damageEvent.ability.guid === SPELLS.MIND_BLAST.id) {
      this.mindBlastHealing += calculateEffectiveHealing(event, this.expiationIncrease);
    }

    if (damageEvent.ability.guid === TALENTS_PRIEST.SHADOW_WORD_DEATH_TALENT.id) {
      this.deathHealing += calculateEffectiveHealing(event, this.expiationIncrease);
    }
  }

  onDamage(event: DamageEvent) {
    if (event.ability.guid === SPELLS.EXPIATION_DAMAGE.id) {
      this.expiationDamage += event.amount;
    } else {
      this.bonusDamage += calculateEffectiveDamage(event, this.expiationIncrease);
    }
  }

  statistic() {
    const totalHealing = this.expiationHealing + this.deathHealing + this.mindBlastHealing;
    return (
      <Statistic
        size="flexible"
        tooltip={
          <>
            Healing Breakdown:
            <ul>
              <li>
                <SpellLink spell={TALENTS_PRIEST.EXPIATION_TALENT} />:{' '}
                {formatNumber(this.expiationHealing)}{' '}
              </li>
              <li>
                <SpellLink spell={TALENTS_PRIEST.SHADOW_WORD_DEATH_TALENT} />:{' '}
                {formatNumber(this.deathHealing)}{' '}
              </li>
              <li>
                <SpellLink spell={SPELLS.MIND_BLAST} />:{formatNumber(this.mindBlastHealing)}{' '}
              </li>
            </ul>
            The bonus damage to <SpellLink spell={SPELLS.MIND_BLAST} /> and{' '}
            <SpellLink spell={TALENTS_PRIEST.SHADOW_WORD_DEATH_TALENT} /> was:{' '}
            {formatNumber(this.bonusDamage)}.
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_PRIEST.EXPIATION_TALENT}>
          <>
            <ItemHealingDone amount={totalHealing} /> <br />
            <ItemDamageDone amount={this.bonusDamage + this.expiationDamage} />
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Expiation;
