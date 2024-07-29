import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import SPECS from 'game/SPECS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  BeginChannelEvent,
  DamageEvent,
  EndChannelEvent,
  EventType,
  HealEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Haste from 'parser/shared/modules/Haste';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import {
  CELESTIAL_CONDUIT_INCREASE_PER_TARGET,
  CELESTIAL_CONDUIT_MAX_DURATION,
  CELESTIAL_CONDUIT_MAX_TARGETS,
} from '../constants';
import { CAST_BUFFER_MS } from 'analysis/retail/evoker/preservation/normalizers/EventLinking/constants';
import { getConduitEventGrouping } from '../normalizers/ConduitOfTheCelestialsEventLinks';
import { formatPercentage } from 'common/format';

class CelestialConduit extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

  protected haste!: Haste;
  damage: number = 0;
  damageHits: number = 0;
  healing: number = 0;
  healingHits: number = 0;
  cancelledCasts: number = 0;
  channelStart: number = 0;
  currentHaste: number = 0;
  healingIncreaseDataPoints: number[] = [];
  damageIncreaseDataPoints: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_MONK.CELESTIAL_CONDUIT_TALENT) &&
      this.selectedCombatant.specId === SPECS.MISTWEAVER_MONK.id;

    this.addEventListener(
      Events.BeginChannel.by(SELECTED_PLAYER).spell(TALENTS_MONK.CELESTIAL_CONDUIT_TALENT),
      this.onChannelStart,
    );
    this.addEventListener(
      Events.EndChannel.by(SELECTED_PLAYER).spell(TALENTS_MONK.CELESTIAL_CONDUIT_TALENT),
      this.onChannelEnd,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CELESTIAL_CONDUIT_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CELESTIAL_CONDUIT_HEAL),
      this.onHeal,
    );
  }

  private onDamage(event: DamageEvent) {
    this.onAction(event);
    this.damage += event.amount + (event.absorbed || 0);
  }

  private onHeal(event: HealEvent) {
    this.onAction(event);
    this.healing += event.amount + (event.absorbed || 0);
  }

  private onChannelStart(event: BeginChannelEvent) {
    this.currentHaste = this.haste.current;
    this.channelStart = event.timestamp;
  }

  private onChannelEnd(event: EndChannelEvent) {
    const actualChannelTime = event.timestamp - this.channelStart;
    const expectedChannelTime = CELESTIAL_CONDUIT_MAX_DURATION / (1 + this.currentHaste);

    if (actualChannelTime + CAST_BUFFER_MS < expectedChannelTime) {
      this.cancelledCasts += 1;
    }
  }

  private onAction(event: HealEvent | DamageEvent) {
    const groupHits = getConduitEventGrouping(event);
    if (!groupHits) {
      return;
    }
    //groupHits will be empty if the event passed is the only hit
    const totalHits = groupHits.length || 1;
    const increase =
      CELESTIAL_CONDUIT_INCREASE_PER_TARGET * Math.min(totalHits, CELESTIAL_CONDUIT_MAX_TARGETS);

    if (event.type === EventType.Heal) {
      this.healingIncreaseDataPoints.push(increase);
    } else {
      this.damageIncreaseDataPoints.push(increase);
    }
  }

  get avgHealIncrease() {
    return (
      this.healingIncreaseDataPoints.reduce((sum, cur) => (sum += cur), 0) /
      this.healingIncreaseDataPoints.length
    );
  }

  get avgDmgIncrease() {
    return (
      this.damageIncreaseDataPoints.reduce((sum, cur) => (sum += cur), 0) /
      this.damageIncreaseDataPoints.length
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
        position={STATISTIC_ORDER.CORE(0)}
        tooltip={
          <ul>
            <li>Casts cancelled early: {this.cancelledCasts}</li>
            <li>Average healing increase: {formatPercentage(this.avgHealIncrease)}%</li>
            <li>Average damage increase: {formatPercentage(this.avgDmgIncrease)}%</li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.CELESTIAL_CONDUIT_TALENT}>
          <ItemDamageDone amount={this.damage} />
          <div></div>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default CelestialConduit;
