import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  CastEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const debug = true;

interface DarkPactCast {
  applyEvent: ApplyBuffEvent;
  removeEvent?: RemoveBuffEvent;
  castEvent?: CastEvent;
  hpPostCast?: number;
  hpPercentPreCast?: number;
  maxHpPostCast?: number;
  totalAbsorb?: number;
  amountAbsorbed: number;
  unusedAbsorb?: number;
}

// TODO: needs guide, defensives section, this can and should be used as often as possible to help healers out
// Expected event order is ApplyBuff > CastEvent > Absorbs > RemoveBuff
class DarkPact extends Analyzer {
  casts: DarkPactCast[] = [];
  darkPactActive = false;
  hasIchor: boolean;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DARK_PACT_TALENT);
    this.hasIchor = this.selectedCombatant.hasTalent(TALENTS.ICHOR_OF_DEVILS_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DARK_PACT_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(TALENTS.DARK_PACT_TALENT),
      this.onApplyShield,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(TALENTS.DARK_PACT_TALENT),
      this.onRemoveShield,
    );
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(TALENTS.DARK_PACT_TALENT),
      this.onAbsorb,
    );
  }

  onCast(event: CastEvent) {
    if (!this.darkPactActive) {
      this.warn('Unexpected Dark Pact CastEvent, no ApplyBuffEvent before?');
      return;
    }
    debug &&
      (!event.hitPoints || !event.maxHitPoints) &&
      this.debug('Dark Pact CastEvent has no HP data');

    this.casts[this.casts.length - 1].castEvent = event;
    this.casts[this.casts.length - 1].hpPostCast = event.hitPoints;
    this.casts[this.casts.length - 1].maxHpPostCast = event.maxHitPoints;
    this.casts[this.casts.length - 1].hpPercentPreCast =
      (event.hitPoints || 0) / (this.hasIchor ? 0.95 : 0.8) / (event.maxHitPoints || 1);
  }

  // this is still sent by wowa at 00 if the buff is active on pull
  onApplyShield(event: ApplyBuffEvent) {
    this.darkPactActive = true;
    this.casts.push({
      applyEvent: event,
      totalAbsorb: event.absorb,
      amountAbsorbed: 0,
    });

    debug &&
      !event.absorb &&
      this.debug("Dark Pact ApplyBuffEvent doesn't have shield value", event);
  }

  onRemoveShield(event: RemoveBuffEvent) {
    if (!this.darkPactActive) {
      this.warn('Unexpected Dark Pact RemoveBuffEvent, no ApplyBuffEvent before?');
      return;
    }
    this.casts[this.casts.length - 1].removeEvent = event;
    this.casts[this.casts.length - 1].unusedAbsorb = event.absorb;
    this.darkPactActive = false;
    debug && this.debug('shield down, last cast: ', this.casts[this.casts.length - 1]);
  }

  onAbsorb(event: AbsorbedEvent) {
    if (!this.darkPactActive) {
      this.warn('Unexpected Dark Pact AbsorbedEvent, no ApplyBuffEvent before?');
      return;
    }
    this.casts[this.casts.length - 1].amountAbsorbed += event.amount;
  }

  get darkPactNumCasts() {
    return this.casts.length;
  }

  get darkPactAvgHpWhenCast() {
    let total = 0;
    this.casts.forEach((cast) => (total += cast.hpPercentPreCast || 0));
    return total / this.darkPactNumCasts;
  }

  get darkPactAvgAbsorbed() {
    let total = 0;
    this.casts.forEach((cast) => (total += cast.amountAbsorbed));
    return total / this.darkPactNumCasts;
  }

  get darkPactTotalUnused() {
    let total = 0;
    this.casts.forEach((cast) => (total += cast.unusedAbsorb || 0));
    return total;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        tooltip={<p>{formatNumber(this.darkPactAvgAbsorbed)} Avg. absorbed</p>}
      >
        <BoringSpellValueText spell={TALENTS.DARK_PACT_TALENT}>
          <p>
            {formatNumber(this.darkPactNumCasts)}{' '}
            <small> Dark Pact{this.darkPactNumCasts === 1 ? '' : 's'} cast </small>
          </p>
          <p>
            {formatPercentage(this.darkPactAvgHpWhenCast, 0)}
            {'% '}
            <small> Avg. hp when cast</small>
          </p>
          {this.darkPactTotalUnused > 0 && (
            <p>
              {formatNumber(this.darkPactTotalUnused)} <small> Total Amount unused</small>
            </p>
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DarkPact;
