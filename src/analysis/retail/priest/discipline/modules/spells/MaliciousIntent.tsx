import AtonementAnalyzer, {
  AtonementAnalyzerEvent,
} from 'analysis/retail/priest/discipline/modules/core/AtonementAnalyzer';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import AtonementDamageSource from '../features/AtonementDamageSource';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class MaliciousIntent extends Analyzer {
  protected enemies!: Enemies;
  protected atonementDamageSource!: AtonementDamageSource;

  static dependencies = {
    enemies: Enemies,
    atonementDamageSource: AtonementDamageSource,
  };

  bonus = 0.15;

  private damage = 0;
  private healing = 0;
  private lastSchismCast: CastEvent | null = null;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.MALICIOUS_INTENT_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.SCHISM_TALENT),
      this.onSchismCast,
    );
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtonement);
  }

  private onAtonement(event: AtonementAnalyzerEvent) {
    const { healEvent, damageEvent } = event;
    if (!damageEvent) {
      return;
    }
    const target = this.enemies.getEntity(damageEvent);

    if (
      this.inMaliciousIntentWindow(damageEvent) &&
      this.lastSchismCast?.targetID === (target?._baseInfo.id || 0)
    ) {
      this.healing += calculateEffectiveHealing(healEvent, this.bonus);
    }
  }

  onSchismCast(event: CastEvent) {
    this.lastSchismCast = event;
  }

  inMaliciousIntentWindow(event: DamageEvent) {
    if (!this.lastSchismCast) {
      return false;
    }

    const start = this.lastSchismCast.timestamp + 9000;
    const end = this.lastSchismCast.timestamp + 15000;
    const inWindow = event.timestamp > start && event.timestamp < end ? true : false;
    return inWindow;
  }

  /**
   * Processes the passive damage added by Schism on a target
   * @param event The damage event being considered
   */
  private onDamage(event: DamageEvent) {
    const target = this.enemies.getEntity(event);

    if (
      this.inMaliciousIntentWindow(event) &&
      this.lastSchismCast?.targetID === (target?._baseInfo.id || 0)
    ) {
      this.damage += calculateEffectiveDamage(event, this.bonus);
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(20)}
        size="flexible"
      >
        <BoringSpellValueText spellId={TALENTS_PRIEST.MALICIOUS_INTENT_TALENT.id}>
          <ItemHealingDone amount={this.healing} /> <br />
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MaliciousIntent;
