import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  EventType,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  RefreshBuffEvent,
  CastEvent,
  DamageEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TIERS } from 'game/TIERS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SpellLink } from 'interface';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

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

type CastStacksTimestamp = { stacks: number; timestamp: number };
class GatheringStarstuff extends Analyzer {
  totalDamage = 0;
  stacksWhenCast: number[][];
  alreadyMaxStacksWhenCast = 0;
  castBuffedAbilities: { [key: number]: number } = {};
  totalStacks = 0;
  //Wrath
  castWraths: CastStacksTimestamp[];
  //Starfire
  castStarfires: CastStacksTimestamp[];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.DF1);
    this.stacksWhenCast = Array.from({ length: GATHERING_STARSTUFF.MAX_STACKS + 1 }, (x) => [0]);

    this.castWraths = [];
    this.castStarfires = [];

    this.castBuffedAbilities = {
      [SPELLS.WRATH_MOONKIN.id]: 0,
      [SPELLS.STARFIRE.id]: 0,
    };

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
    const stacks = this.selectedCombatant.getBuff(SPELLS.GATHERING_STARSTUFF.id)?.stacks ?? 0;
    if (stacks > 0) {
      //Track which abilities are buffed
      this.castBuffedAbilities[event.ability.guid] += 1;
    }
    if (event.ability.guid === SPELLS.WRATH_MOONKIN.id) {
      //Append a Wrath CastEvent and keep its timestamp
      this.castWraths.push({
        stacks,
        timestamp: event.timestamp,
      });
    }
    if (event.ability.guid === SPELLS.STARFIRE.id) {
      //Append a Starfire CastEvent and keep its timestamp
      this.castStarfires.push({ stacks, timestamp: event.timestamp });
    }
  }

  onDamage(event: DamageEvent) {
    //Wrath
    if (event.ability.guid === SPELLS.WRATH_MOONKIN.id) {
      while (this.castWraths.length > 0) {
        const wrath = this.castWraths[0];

        if (event.timestamp < (wrath.timestamp + GATHERING_STARSTUFF.WRATH_MIN || 0)) {
          // DamageEvent before a CastEvent, discard this source of damage.
          return;
        }
        // Do this here to avoid possibility of inifnite loop
        this.castWraths.shift();

        if (event.timestamp > (wrath.timestamp || Infinity) + GATHERING_STARSTUFF.WRATH_DELAY) {
          // DamageEvent to long after a CastEvent, discard this CastEvent and move on
          continue;
        }
        this.totalDamage += calculateEffectiveDamage(
          event,
          wrath.stacks ?? 0 * GATHERING_STARSTUFF.DAMAGE_PER_STACK,
        );
        break;
      }
    }

    //Starfire - same as with Wrath but less complexity since there is no travel time
    if (event.ability.guid === SPELLS.STARFIRE.id) {
      while (this.castStarfires.length > 0) {
        const starfire = this.castStarfires[0];

        if (event.timestamp < (starfire.timestamp || 0)) {
          // DamageEvent before a CastEvent, discard this source of damage.
          return;
        }
        // Do this here to avoid possibility of inifnite loop
        this.castStarfires.shift();

        if (
          event.timestamp >
          (starfire.timestamp || Infinity) + GATHERING_STARSTUFF.STARFIRE_DELAY
        ) {
          // DamageEvent to long after a CastEvent, discard this CastEvent and move on
          continue;
        }

        this.totalDamage += calculateEffectiveDamage(
          event,
          starfire.stacks ?? 0 * GATHERING_STARSTUFF.DAMAGE_PER_STACK,
        );
        break;
      }
    }
  }

  onEndConvoke(event: RemoveBuffEvent) {
    //Reset stacks after convoke to minimize the impact of Wrath cast during Convoke
    this.castWraths = [];
  }

  handleStacks(event: ApplyBuffEvent | ApplyBuffStackEvent | RemoveBuffEvent | RefreshBuffEvent) {
    if (event.type === EventType.RefreshBuff) {
      this.alreadyMaxStacksWhenCast += 1;
      this.totalStacks += 1;
      return;
    }
    if (event.type === EventType.ApplyBuff || event.type === EventType.ApplyBuffStack) {
      this.totalStacks += 1;
    }
  }

  statistic() {
    const wastePercentage = formatPercentage(this.alreadyMaxStacksWhenCast / this.totalStacks);
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
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
                {Object.keys(this.castBuffedAbilities).map((e) => (
                  <tr key={e}>
                    <th>
                      <SpellLink spell={Number(e)} />
                    </th>
                    <td>{this.castBuffedAbilities[Number(e)]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.GATHERING_STARSTUFF}>
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
