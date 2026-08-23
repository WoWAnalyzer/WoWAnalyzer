/** ReactiveWarding
 * When refreshing Earth Shield, your target is healed each stack of Earth Shield they are missing.
 * Additionally, Earth Shield and Water Shield can consume charges 1.0 sec faster.
 */
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ChangeBuffStackEvent, HealEvent } from 'parser/core/Events';
import CooldownThroughputTracker from '../features/CooldownThroughputTracker';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SpellLink from 'interface/SpellLink';
import ItemHealingDone from 'parser/ui/ItemHealingDone';

const EARTH_SHIELD_BUFFS = [TALENTS.EARTH_SHIELD_TALENT, SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF];

export default class ReactiveWarding extends Analyzer {
  static dependencies = {
    cooldownThroughputTracker: CooldownThroughputTracker,
  };

  protected cooldownThroughputTracker!: CooldownThroughputTracker;

  healing = 0;
  healCount = 0;
  totalStacksRestored = 0;
  earthShieldCasts = 0;
  totalStacksOverwritten = 0;
  recastsWithOverwrittenStacks = 0;

  private pendingHealsByTargetTimestamp = new Map<string, true>();
  private pendingStackChangesByTargetTimestamp = new Map<string, ChangeBuffStackEvent>();

  private static key(targetID: number, timestamp: number) {
    return `${targetID}:${timestamp}`;
  }

  get averageStacksOverwritten() {
    return this.recastsWithOverwrittenStacks === 0
      ? 0
      : this.totalStacksOverwritten / this.recastsWithOverwrittenStacks;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.REACTIVE_WARDING_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REACTIVE_WARDING_HEAL),
      this.onReactiveWardingHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.EARTH_SHIELD_TALENT),
      this.onEarthShieldCast,
    );
    this.addEventListener(
      Events.changebuffstack.by(SELECTED_PLAYER).spell(EARTH_SHIELD_BUFFS[0]),
      this.onEarthShieldStackChange,
    );
    this.addEventListener(
      Events.changebuffstack.by(SELECTED_PLAYER).spell(EARTH_SHIELD_BUFFS[1]),
      this.onEarthShieldStackChange,
    );
  }

  onReactiveWardingHeal(event: HealEvent) {
    const effective = event.amount + (event.absorbed || 0);
    this.healing += effective;
    if (effective > 0) {
      this.healCount += 1;
    }

    const key = ReactiveWarding.key(event.targetID, event.timestamp);
    const matchingStackChange = this.pendingStackChangesByTargetTimestamp.get(key);
    if (matchingStackChange) {
      this.pendingStackChangesByTargetTimestamp.delete(key);
      this.applyStackChange(matchingStackChange);
    } else {
      this.pendingHealsByTargetTimestamp.set(key, true);
    }
  }

  onEarthShieldCast(event: CastEvent) {
    this.earthShieldCasts += 1;
  }

  onEarthShieldStackChange(event: ChangeBuffStackEvent) {
    const key = ReactiveWarding.key(event.targetID, event.timestamp);
    if (this.pendingHealsByTargetTimestamp.has(key)) {
      this.pendingHealsByTargetTimestamp.delete(key);
      this.applyStackChange(event);
    } else {
      this.pendingStackChangesByTargetTimestamp.set(key, event);
    }
  }

  private applyStackChange(event: ChangeBuffStackEvent) {
    if (event.newStacks <= event.oldStacks) {
      return;
    }

    const stacksRestored = event.newStacks - event.oldStacks;
    this.totalStacksRestored += stacksRestored;

    if (event.oldStacks > 0) {
      this.totalStacksOverwritten += event.oldStacks;
      this.recastsWithOverwrittenStacks += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        tooltip={
          <>
            <strong>{this.healCount}</strong> effective healing procs from{' '}
            <SpellLink spell={TALENTS.REACTIVE_WARDING_TALENT} /> (full overheal not counted).
            <p>
              <strong>{this.earthShieldCasts}</strong> total{' '}
              <SpellLink spell={TALENTS.EARTH_SHIELD_TALENT} /> casts, of which{' '}
              <strong>{this.recastsWithOverwrittenStacks}</strong> overwrote remaining stacks
              (averaging <strong>{this.averageStacksOverwritten.toFixed(1)}</strong> stacks wasted
              per early recast).
            </p>
            <small>
              Triggers when refreshing <SpellLink spell={TALENTS.EARTH_SHIELD_TALENT} />, healing
              the target for each stack of Earth Shield they were missing. Recasting before all
              stacks are consumed overwrites the remaining stacks instead of letting them heal.
            </small>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.REACTIVE_WARDING_TALENT}>
          <>
            <div className="pad">
              <div className="value">
                <ItemHealingDone amount={this.healing} />
              </div>
            </div>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}
