import AtonementAnalyzer, {
  AtonementAnalyzerEvent,
} from 'analysis/retail/priest/discipline/modules/core/AtonementAnalyzer';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Events, { DamageEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import AtonementDamageSource from '../features/AtonementDamageSource';

class Schism extends Analyzer {
  protected enemies!: Enemies;
  protected atonementDamageSource!: AtonementDamageSource;

  static dependencies = {
    enemies: Enemies,
    atonementDamageSource: AtonementDamageSource,
  };

  static bonus = 0.25;

  private directDamage = 0;
  private damageFromBuff = 0;
  private healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.SCHISM_TALENT.id);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtonement);
  }

  private onAtonement(event: AtonementAnalyzerEvent) {
    const { healEvent, damageEvent } = event;
    if (!damageEvent) {
      return;
    }
    const target = this.enemies.getEntity(damageEvent);
    if (!target?.hasBuff(TALENTS_PRIEST.SCHISM_TALENT.id)) {
      return;
    }

    // Schism isn't buffed by itself, so requires a different path
    if (damageEvent.ability.guid === TALENTS_PRIEST.SCHISM_TALENT.id) {
      this.healing += healEvent.amount;
    }

    this.healing += calculateEffectiveHealing(healEvent, Schism.bonus);
  }

  /**
   * Processes the passive damage added by Schism on a target
   * @param event The damage event being considered
   */
  private onDamage(event: DamageEvent) {
    const spellId = event.ability.guid;
    const target = this.enemies.getEntity(event);

    if (spellId === TALENTS_PRIEST.SCHISM_TALENT.id) {
      this.directDamage += event.amount + (event.absorbed || 0);
      return;
    }
    if (target?.hasBuff(TALENTS_PRIEST.SCHISM_TALENT.id)) {
      return;
    }

    this.damageFromBuff += calculateEffectiveDamage(event, Schism.bonus);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            The effective healing contributed by Schism was{' '}
            {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))}% of total
            healing done.
            <br />
            The direct damage contributed by the Schism talent was{' '}
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.directDamage))}% of
            total damage done.
            <br />
            The effective damage contributed by the Schism bonus was{' '}
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damageFromBuff))}% of
            total damage done. <br />
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_PRIEST.SCHISM_TALENT.id}>
          <ItemHealingDone amount={this.healing} /> <br />
          <ItemDamageDone amount={this.directDamage + this.damageFromBuff} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Schism;
