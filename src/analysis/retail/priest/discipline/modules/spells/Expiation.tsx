import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';
import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../core/AtonementAnalyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

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
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtonement);

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

  onAtonement(event: AtonementAnalyzerEvent) {
    const { healEvent, damageEvent } = event;

    if (
      damageEvent?.ability.guid !== SPELLS.EXPIATION_DAMAGE.id &&
      damageEvent?.ability.guid !== TALENTS_PRIEST.SHADOW_WORD_DEATH_TALENT.id &&
      damageEvent?.ability.guid !== SPELLS.MIND_BLAST.id
    ) {
      return;
    }

    if (damageEvent.ability.guid === SPELLS.EXPIATION_DAMAGE.id) {
      this.expiationHealing += healEvent.amount;
    }

    if (damageEvent.ability.guid === SPELLS.MIND_BLAST.id) {
      this.mindBlastHealing += calculateEffectiveHealing(healEvent, this.expiationIncrease);
    }

    if (damageEvent.ability.guid === TALENTS_PRIEST.SHADOW_WORD_DEATH_TALENT.id) {
      this.deathHealing += calculateEffectiveHealing(healEvent, this.expiationIncrease);
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
                <SpellLink id={TALENTS_PRIEST.EXPIATION_TALENT.id} />:{' '}
                {formatNumber(this.expiationHealing)}{' '}
              </li>
              <li>
                <SpellLink id={TALENTS_PRIEST.SHADOW_WORD_DEATH_TALENT.id} />:{' '}
                {formatNumber(this.deathHealing)}{' '}
              </li>
              <li>
                <SpellLink id={SPELLS.MIND_BLAST.id} />: {formatNumber(this.mindBlastHealing)}{' '}
              </li>
            </ul>
            The bonus damage to <SpellLink id={SPELLS.MIND_BLAST.id} /> and{' '}
            <SpellLink id={TALENTS_PRIEST.SHADOW_WORD_DEATH_TALENT.id} /> was:{' '}
            {formatNumber(this.bonusDamage)}.
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS_PRIEST.EXPIATION_TALENT.id}>
          <>
            <ItemHealingDone amount={totalHealing} /> <br />
            <ItemDamageDone amount={this.bonusDamage + this.expiationDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Expiation;
