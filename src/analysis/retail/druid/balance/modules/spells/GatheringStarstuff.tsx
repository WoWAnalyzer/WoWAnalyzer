import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  EventType,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  RefreshBuffEvent,
  FightEndEvent,
  CastEvent,
  DamageEvent,
} from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TIERS } from 'game/TIERS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SpellLink } from 'interface';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';

const GATHERING_STARSTUFF = {
  MAX_STACKS: 3,
  DAMAGE_PER_STACK: 0.2,
  STARFIRE_DELAY: 100,
  WRATH_DELAY: 3200,
  WRATH_MIN: 100,

  AFFECTED_DAMAGE: [SPELLS.WRATH_MOONKIN, SPELLS.STARFIRE],
  AFFECTED_CAST: [SPELLS.WRATH_MOONKIN, SPELLS.STARFIRE],
  TRIGGER_CAST: [SPELLS.STARSURGE_MOONKIN, SPELLS.STARFALL_CAST],
};

class GatheringStarstuff extends Analyzer {
  buffStacks: number[][];
  lastStacks = 0;
  lastUpdate = this.owner.fight.start_time;
  totalDamage = 0;
  stacksWhenCast: number[][];
  alreadyMaxStacksWhenCast = 0;
  gastBuffedAbilities: { [key: number]: number } = {};
  gastActivationTimestamp: number | null = null;
  gastConsumptionTimestamp: number | null = null;
  gastCurrentStacks = 0;
  totalStacks = 0;
  //Wrath
  listCastWrath: number[];
  listCastWrathTimestamps: number[];
  //Starfire
  listCastStarfire: number[];
  listCastStarfireTimestamps: number[];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T29);
    this.buffStacks = Array.from({ length: GATHERING_STARSTUFF.MAX_STACKS + 1 }, (x) => [0]);
    this.stacksWhenCast = Array.from({ length: GATHERING_STARSTUFF.MAX_STACKS + 1 }, (x) => [0]);
    this.listCastWrath = [];
    this.listCastWrathTimestamps = [];
    this.listCastStarfire = [];
    this.listCastStarfireTimestamps = [];

    Object.values(GATHERING_STARSTUFF.AFFECTED_CAST).forEach((spell) => {
      this.gastBuffedAbilities[spell.id] = 0;
    });

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(GATHERING_STARSTUFF.AFFECTED_CAST),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(GATHERING_STARSTUFF.AFFECTED_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.CONVOKE_SPIRITS),
      this.onEndConvoke,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GATHERING_STARSTUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.GATHERING_STARSTUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.GATHERING_STARSTUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.GATHERING_STARSTUFF),
      this.handleStacks,
    );
    this.addEventListener(Events.fightend, this.handleStacks);
  }

  // As stacks are consumed when the cast end but the damage are done when the spell lands, we need
  // to match CastEvent (on which we obtain the number of stacks) with their respective DamageEvent.
  // To do so we list all CastEvent and when a DamageEvent is read we check with the first CastEvent
  // on the list if they are in an acceptable time frame. If so we know how many stacks are associated
  // with a DamageEvent. We can then discard the first CastEvent and go on with our Event. If not,
  // we either discard the damage event if it's to early (can happen with precast or convoke
  // cast) or the cast event if it's to late (can happen with a targt dying after the cast but
  // before the spell lands).

  onCast(event: CastEvent) {
    const stacks = this.selectedCombatant.getBuff(SPELLS.GATHERING_STARSTUFF.id)?.stacks;
    this.gastCurrentStacks = stacks ?? 0;
    if (this.gastCurrentStacks > 0) {
      //Track which abilities are buffed
      this.gastBuffedAbilities[event.ability.guid] += 1;
    }
    if (event.ability.guid === SPELLS.WRATH_MOONKIN.id) {
      //Append a Wrath CastEvent and keep its timestamp
      this.listCastWrath.push(this.gastCurrentStacks);
      this.listCastWrathTimestamps.push(event.timestamp);
    }
    if (event.ability.guid === SPELLS.STARFIRE.id) {
      //Append a Starfire CastEvent and keep its timestamp
      this.listCastStarfire.push(this.gastCurrentStacks);
      this.listCastStarfireTimestamps.push(event.timestamp);
    }
  }

  onDamage(event: DamageEvent) {
    let checkCastList = true;

    //Wrath
    if (event.ability.guid === SPELLS.WRATH_MOONKIN.id) {
      while (checkCastList) {
        if (!this.listCastWrath) {
          // No CastEvent remaining, discard this source of damage. Ex: Wraths from Convoke
          return;
        }
        if (
          event.timestamp < (this.listCastWrathTimestamps[0] + GATHERING_STARSTUFF.WRATH_MIN || 0)
        ) {
          // DamageEvent before a CastEvent, discard this source of damage.
          return;
        }
        if (
          event.timestamp >
          (this.listCastWrathTimestamps[0] || Infinity) + GATHERING_STARSTUFF.WRATH_DELAY
        ) {
          // DamageEvent to long after a CastEvent, discard this CastEvent
          // (this is why their is a while loop) and try the next one.
          this.listCastWrath.shift();
          this.listCastWrathTimestamps.shift();
        } else {
          // DamageEvent and CastEvent are within an acceptable timeframe, match theem together
          const stacks = this.listCastWrath.shift();
          this.totalDamage += calculateEffectiveDamage(
            event,
            stacks ?? 0 * GATHERING_STARSTUFF.DAMAGE_PER_STACK,
          );
          this.listCastWrathTimestamps.shift();
          checkCastList = false;
        }
      }
    }
    //Starfire - same as with Wrath but less complexity since there is no travel time
    if (event.ability.guid === SPELLS.STARFIRE.id) {
      if (!this.listCastStarfire) {
        return;
      }
      if (event.timestamp < (this.listCastStarfireTimestamps[0] || 0)) {
        return;
      }
      if (
        event.timestamp >
        (this.listCastStarfireTimestamps[0] || Infinity) + GATHERING_STARSTUFF.STARFIRE_DELAY
      ) {
        return;
      }
      const stacks = this.listCastStarfire.shift();
      this.totalDamage += calculateEffectiveDamage(
        event,
        stacks ?? 0 * GATHERING_STARSTUFF.DAMAGE_PER_STACK,
      );
      this.listCastStarfireTimestamps.shift();
    }
  }

  onEndConvoke(event: RemoveBuffEvent) {
    //Reset stacks after convoke to minimize the impact of Wrath cast during Convoke
    this.listCastWrath = [];
    this.listCastWrathTimestamps = [];
  }

  handleStacks(
    event:
      | ApplyBuffEvent
      | ApplyBuffStackEvent
      | RemoveBuffEvent
      | RefreshBuffEvent
      | FightEndEvent,
    stack = null,
  ) {
    this.buffStacks[this.lastStacks].push(event.timestamp - this.lastUpdate);
    if (event.type === EventType.FightEnd) {
      return;
    }
    if (event.type === EventType.RefreshBuff) {
      this.alreadyMaxStacksWhenCast += 1;
      this.totalStacks += 1;
      this.lastUpdate = event.timestamp;
      this.lastStacks = GATHERING_STARSTUFF.MAX_STACKS;
      this.gastActivationTimestamp = event.timestamp;
      return;
    }
    if (event.type === EventType.ApplyBuff || event.type === EventType.ApplyBuffStack) {
      this.totalStacks += 1;
      this.gastActivationTimestamp = event.timestamp;
    }
    this.lastUpdate = event.timestamp;
    this.lastStacks = currentStacks(event);
  }

  statistic() {
    const wastePercentage = formatPercentage(this.alreadyMaxStacksWhenCast / this.totalStacks);
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        size="flexible"
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Ability</th>
                  <th>Number of Buffed Casts</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(this.gastBuffedAbilities).map((e) => (
                  <tr key={e}>
                    <th>
                      <SpellLink id={Number(e)} />
                    </th>
                    <td>{this.gastBuffedAbilities[Number(e)]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.GATHERING_STARSTUFF.id}>
          <>
            {this.alreadyMaxStacksWhenCast} <small>charges overcapped ({wastePercentage}%)</small>
            <br />
            <ItemPercentDamageDone greaterThan amount={this.totalDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GatheringStarstuff;
