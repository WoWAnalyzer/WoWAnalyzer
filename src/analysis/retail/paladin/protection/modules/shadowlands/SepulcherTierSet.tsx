import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  CastEvent,
  DamageEvent,
  EventType,
  FreeCastEvent,
  GlobalCooldownEvent,
} from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { COOLDOWN_LAG_MARGIN } from 'parser/shared/modules/SpellUsable';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TIERS } from 'game/TIERS';

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
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T28);

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

  public isPotential4pcProc(event: CastEvent): boolean {
    if (!this.active) {
      return false;
    }

    // force it even without checking for a damage event if we have an impossible gcd
    if (this.remainingGcd(event) > COOLDOWN_LAG_MARGIN) {
      return true;
    }

    const triggerOffset = Math.abs(event.timestamp - (this.lastTriggerEvent?.timestamp ?? 0));
    const damageOffset = Math.abs(event.timestamp - (this.lastDamageEvent?.timestamp ?? 0));

    return triggerOffset >= 3000 - COOLDOWN_LAG_MARGIN && damageOffset < COOLDOWN_LAG_MARGIN;
  }

  public triggerInferredProc(event: CastEvent) {
    const freeCast = (event as unknown) as FreeCastEvent;
    freeCast.type = EventType.FreeCast;

    freeCast.meta = {
      isEnhancedCast: true,
      enhancedCastReason: (
        <>
          Triggered by <SpellLink id={SPELLS.GLORIOUS_PURPOSE_4PC.id} /> due to damage from{' '}
          <SpellLink id={this.lastDamageEvent?.ability.guid ?? 0} />.
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
