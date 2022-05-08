import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  Event,
  AnyEvent,
  CastEvent,
  DamageEvent,
  EventType,
  FreeCastEvent,
  GlobalCooldownEvent,
} from 'parser/core/Events';
import { INVALID_COOLDOWN_CONFIG_LAG_MARGIN } from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import BoringValueText from 'parser/ui/BoringValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

export default class SepulcherTierSet extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  abilityTracker!: AbilityTracker;

  lastDamageEvent?: DamageEvent;
  lastTriggerEvent?: FreeCastEvent;
  gcd?: GlobalCooldownEvent;

  triggers: FreeCastEvent[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4Piece();

    this.addEventListener(
      Events.damage.to(SELECTED_PLAYER),
      (event) => (this.lastDamageEvent = event),
    );

    this.addEventListener(Events.GlobalCooldown, (event) => (this.gcd = event));
  }

  private remainingGcd(event: AnyEvent): number {
    if (this.gcd === undefined) {
      return 0;
    }

    return Math.max(this.gcd.timestamp + this.gcd.duration - event.timestamp, 0);
  }

  public isPotential4pcProc(event: CastEvent | DamageEvent): boolean {
    if (!this.active || event.type === EventType.Damage) {
      // not even going to try to do timestamp stuff with judgment damage events due to travel time
      return false;
    }

    // force it even without checking for a damage event if we have an impossible gcd
    if (this.remainingGcd(event) > INVALID_COOLDOWN_CONFIG_LAG_MARGIN) {
      return true;
    }

    const triggerOffset = Math.abs(event.timestamp - (this.lastTriggerEvent?.timestamp ?? 0));
    const damageOffset = Math.abs(event.timestamp - (this.lastDamageEvent?.timestamp ?? 0));
    // console.log(event, triggerOffset, damageOffset, this.lastTriggerEvent, this.lastDamageEvent);

    return (
      triggerOffset >= 3000 - INVALID_COOLDOWN_CONFIG_LAG_MARGIN &&
      damageOffset < INVALID_COOLDOWN_CONFIG_LAG_MARGIN
    );
  }

  public triggerInferredProc(event: CastEvent | DamageEvent) {
    if (event.type === EventType.Damage) {
      console.warn('Damage event somehow reached SepulcherTierSet.triggerInferredProc', event);
      return;
    }

    const freeCast = (event as unknown) as FreeCastEvent;
    freeCast.type = EventType.FreeCast;

    freeCast.meta = {
      isEnhancedCast: true,
      enhancedCastReason: (
        <>
          Triggered by <SpellLink id={SPELLS.GLORIOUS_PURPOSE_4PC.id} />
        </>
      ),
    };

    this.lastTriggerEvent = freeCast;
    this.triggers.push(freeCast);

    this.abilityTracker.getAbility(SPELLS.JUDGMENT_CAST_PROTECTION.id).casts -= 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringValueText
          label={
            <>
              <SpellIcon id={SPELLS.GLORIOUS_PURPOSE_4PC.id} /> Bonus{' '}
              <SpellLink id={SPELLS.JUDGMENT_CAST_PROTECTION.id} /> triggers
            </>
          }
        >
          ~{this.triggers.length}
        </BoringValueText>
      </Statistic>
    );
  }
}
