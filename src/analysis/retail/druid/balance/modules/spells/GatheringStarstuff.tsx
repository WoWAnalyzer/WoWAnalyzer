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
//import { TALENTS_DRUID } from 'common/TALENTS';
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
  countCast = 0;
  countDamage = 0;
  //Wrath
  listCastWrath: number[];
  //  listDamageWrath: number[];
  listCastWrathTimestamps: number[];
  //  listCastWrathTimestamps2: number[];
  //  listDamageWrathTimestamps2: number[];
  //Cast
  listCastStarfire: number[];
  //  listDamageStarfire: number[];
  listCastStarfireTimestamps: number[];
  //  listDamageStarfireTimestamps: number[];
  //  listSize: number[];
  //  listSizeTimestamps: number[];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T29);
    this.buffStacks = Array.from({ length: GATHERING_STARSTUFF.MAX_STACKS + 1 }, (x) => [0]);
    this.stacksWhenCast = Array.from({ length: GATHERING_STARSTUFF.MAX_STACKS + 1 }, (x) => [0]);
    this.listCastWrath = [];
    this.listCastWrathTimestamps = [];
    //    this.listCastWrathTimestamps2 = [];
    //    this.listDamageWrathTimestamps2 = [];
    //    this.listDamageWrath = [];
    //    this.listDamageWrathTimestamps = [];
    this.listCastStarfire = [];
    this.listCastStarfireTimestamps = [];
    //    this.listDamageStarfire = [];
    //    this.listDamageStarfireTimestamps = [];
    //    this.listSize = [];
    //    this.listSizeTimestamps = [];

    Object.values(GATHERING_STARSTUFF.AFFECTED_CAST).forEach((spell) => {
      this.gastBuffedAbilities[spell.id] = 0;
    });

    //    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(GATHERING_STARSTUFF.TRIGGER_CAST), this.onCastTrigger);
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

  onCast(event: CastEvent) {
    const stacks = this.selectedCombatant.getBuff(SPELLS.GATHERING_STARSTUFF.id)?.stacks;
    this.gastCurrentStacks = stacks ?? 0;
    if (this.gastCurrentStacks > 0) {
      this.gastBuffedAbilities[event.ability.guid] += 1;
      //  this.countCast+=1;
    }
    if (event.ability.guid === SPELLS.WRATH_MOONKIN.id) {
      this.listCastWrath.push(this.gastCurrentStacks);
      this.listCastWrathTimestamps.push(event.timestamp);
      //  this.listCastWrathTimestamps2.push(event.timestamp);
      //  console.log('size - '+this.listCastWrath.length);
      //  this.listSize.push(this.listCastWrath.length);
      //  this.listSizeTimestamps.push(event.timestamp);
    }
    if (event.ability.guid === SPELLS.STARFIRE.id) {
      this.listCastStarfire.push(this.gastCurrentStacks);
      this.listCastStarfireTimestamps.push(event.timestamp);
    }
    //  console.log("onCast");
    //  console.log(event.timestamp);
    //  console.log(this.listCastWrath.length);
  }

  onDamage(event: DamageEvent) {
    let checkCastList = true;

    //Wrath
    if (event.ability.guid === SPELLS.WRATH_MOONKIN.id) {
      //  this.listDamageWrathTimestamps2.push(event.timestamp);
      while (checkCastList) {
        console.log('onDamage -- Wrath');
        if (!this.listCastWrath) {
          //          this.listSize.push(0);
          //          this.listSizeTimestamps.push(event.timestamp);
          return;
        }
        if (
          event.timestamp < (this.listCastWrathTimestamps[0] + GATHERING_STARSTUFF.WRATH_MIN || 0)
        ) {
          //          this.listSize.push(this.listCastWrath.length);
          //          this.listSizeTimestamps.push(event.timestamp);
          return;
        }
        if (
          event.timestamp >
          (this.listCastWrathTimestamps[0] || Infinity) + GATHERING_STARSTUFF.WRATH_DELAY
        ) {
          this.listCastWrath.shift();
          this.listCastWrathTimestamps.shift();
        } else {
          const stacks = this.listCastWrath.shift();
          //        console.log('size - '+this.listCastWrath.length)
          //        this.listSize.push(this.listCastWrath.length);
          //        this.listSizeTimestamps.push(event.timestamp);
          this.totalDamage += calculateEffectiveDamage(
            event,
            stacks ?? 0 * GATHERING_STARSTUFF.DAMAGE_PER_STACK,
          );
          this.listCastWrathTimestamps.shift();
          checkCastList = false;
          //    if (stacks??0>0){this.countDamage+=1;}
        }
      }
    }
    //Starfire
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
      //  if (stacks??0>0){this.countDamage+=1;}
    }
  }

  onEndConvoke(event: RemoveBuffEvent) {
    //  console.log("onEndConvoke")
    this.listCastWrath = [];
    this.listCastWrathTimestamps = [];
    //  this.listSize.push(this.listCastWrath.length);
    //  this.listSizeTimestamps.push(event.timestamp);
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
      // console.log("Cast");
      // console.log(this.listCastWrathTimestamps2);
      // console.log("Damage");
      // console.log(this.listDamageWrathTimestamps2);
      // console.log("Size");
      // console.log(this.listSize);
      // console.log(this.listSizeTimestamps);
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
    //const dpsAdded = formatNumber(this.totalDamage / (this.owner.fightDuration / 1000));
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
