import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';
import AtonementAnalyzer from '../core/AtonementAnalyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';

const EXPIATION_RANK_INCREASE = 0.1;
class Expiation extends Analyzer {
  expiationHealing = 0;
  deathHealing = 0;
  mindBlastHealing = 0;
  talentRank = 0;
  expiationIncrease = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.EXPIATION_DISCIPLINE_TALENT.id);
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtonement);

    this.talentRank = this.selectedCombatant.getTalentRank(
      TALENTS_PRIEST.EXPIATION_DISCIPLINE_TALENT.id,
    );
    this.expiationIncrease = this.talentRank * EXPIATION_RANK_INCREASE;
  }

  onAtonement(event: any) {
    const { healEvent, damageEvent } = event;

    if (
      damageEvent.ability.guid !== SPELLS.EXPIATION_DAMAGE.id &&
      damageEvent.ability.guid !== TALENTS_PRIEST.SHADOW_WORD_DEATH_TALENT.id &&
      damageEvent.ability.guid !== SPELLS.MIND_BLAST.id
    ) {
      return;
    }

    if (damageEvent.ability.guid === SPELLS.EXPIATION_DAMAGE.id) {
      this.expiationHealing += healEvent.amount + (event.absorbed || 0);
    }

    if (damageEvent.ability.guid === SPELLS.MIND_BLAST.id) {
      this.mindBlastHealing += calculateEffectiveHealing(healEvent, this.expiationIncrease);
    }

    if (damageEvent.ability.guid === TALENTS_PRIEST.SHADOW_WORD_DEATH_TALENT.id) {
      this.deathHealing += calculateEffectiveHealing(healEvent, this.expiationIncrease);
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
                <SpellLink id={TALENTS_PRIEST.EXPIATION_DISCIPLINE_TALENT.id} />:{' '}
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
          </>
        }
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spellId={TALENTS_PRIEST.EXPIATION_DISCIPLINE_TALENT.id}>
          <>
            <ItemHealingDone amount={totalHealing} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Expiation;
