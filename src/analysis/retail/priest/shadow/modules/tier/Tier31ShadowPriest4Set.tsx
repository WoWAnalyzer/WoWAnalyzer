import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RefreshBuffEvent,
  DamageEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

const MAX_DURATION = 60000; //max duration of the buff

class Tier31ShadowPriest4Set extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    eventHistory: EventHistory,
    spellUsable: SpellUsable,
  };
  protected abilities!: Abilities;
  protected eventHistory!: EventHistory;
  protected spellUsable!: SpellUsable;
  has4Piece: boolean = true;

  stacks = 0; //current stacks of buff
  recentStacks = 0; // stacks used to calculate damage, since stacks are sometimes removed before damage event
  totalStacks = 0; //total Possible Stacks

  damageSC = 0; //damage to Shadow Crash
  stacksSC = 0; //Stacks spent on Shadow Crash

  castSWP = false; //this tells if a cast of shadow word Pain has happened
  stacksSWP = 0; //Stacks spent on Shadow Word Pain
  damageSWP = 0; //damage to Shadow Word Pain

  castSC = false; //this tells if a cast of Shadow Crash has happened
  recentSCTimestamp = 0; //This is the time of the first instance of shadowcrash damage to a target from one cast.
  bonusSWP = 2.25; // multiplier per stack for Shadow Word Pain
  bonusSC = 0.5; // multiplier per stack for Shadow Crash

  recentApplied = false; //the order of the events requires this for edge cases.
  timestampOfLast = 0; //Used to calculate unused buffs

  constructor(options: Options) {
    super(options);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.T31);
    this.active = this.has4Piece;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_PRIEST_TIER_31_4_SET_BUFF),
      this.onBuffApplied,
    );

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_PRIEST_TIER_31_4_SET_BUFF),
      this.onBuffStack,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_PRIEST_TIER_31_4_SET_BUFF),
      this.onBuffRefresh,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_CRASH_TALENT_DAMAGE),
      this.onShadowCrash,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_WORD_PAIN),
      this.onShadowWordPain,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_WORD_DEATH_TALENT),
      this.onShadowWordDeath,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_CRASH_TALENT),
      this.onShadowCrashCast,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_PRIEST_TIER_31_4_SET_BUFF),
      this.onBuffRemoved,
    );
  }

  onBuffApplied(Event: ApplyBuffEvent) {
    this.timestampOfLast = Event.timestamp;
    this.stacks = 1;
    this.recentApplied = true;
  }

  onBuffStack(Event: ApplyBuffStackEvent) {
    this.timestampOfLast = Event.timestamp;
    this.stacks = Event.stack;
  }

  onBuffRefresh(Event: RefreshBuffEvent) {
    this.timestampOfLast = Event.timestamp;
  }

  onBuffRemoved(Event: RemoveBuffEvent) {
    this.recentStacks = this.stacks;
    if (MAX_DURATION <= Event.timestamp - this.timestampOfLast) {
      this.recentStacks = 0;
    }
    this.stacks = 0;
  }

  onShadowCrashCast() {
    this.castSC = true;
    //SC hits multiple targets, but we only want to count the stacks used once.
  }

  onShadowCrash(Event: DamageEvent) {
    //Since the damage event of the inital hit occurs right after the cast, this will only allow that damage event to be added and increased and not further ticks of the dot.
    //In addition, the recentStacks is not reset until a new stack is gained. This way, if two shadow Crashes (or shadow word pains) are cast without gaining the buff since the last cast, the damage will not be counted.
    //Since Shadow crash can damage multiple targets, if a damage event occurs at the same time as another, then it's damage would also be increased, but we do not count the stacks again.
    if (this.recentSCTimestamp === Event.timestamp || this.recentApplied) {
      this.recentApplied = false;
      if (this.castSC) {
        this.stacksSC += this.recentStacks;
        this.castSC = false;
        this.recentSCTimestamp = Event.timestamp;
      }
      this.damageSC += calculateEffectiveDamage(Event, this.recentStacks * this.bonusSC);
    }
  }

  onShadowWordPain(Event: DamageEvent) {
    //Since the damage event increase is only for the initial damage, we ignore ticks of the dot.
    //In addition, the recentStacks is not reset until a new stack is gained. This way, if two shadow word pains are cast (or shadow crashes) without gaining the buff since the last cast, the damage will not be counted.
    if (!Event.tick && this.recentApplied) {
      this.recentApplied = false;
      this.stacksSWP += this.recentStacks;
      this.damageSWP += calculateEffectiveDamage(Event, this.recentStacks * this.bonusSWP);
      this.castSWP = false;
    }
  }

  onShadowWordDeath() {
    this.totalStacks += 1;
  }

  statistic() {
    const damageTotal = this.damageSC + this.damageSWP;
    const sumStacks = this.stacksSC + this.stacksSWP;
    if (this.has4Piece) {
      return (
        <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
          <BoringSpellValueText spell={SPELLS.SHADOW_PRIEST_TIER_31_4_SET_BUFF}>
            <ItemDamageDone amount={damageTotal} />
            <div>
              {sumStacks}/{this.totalStacks} <small>Used/Total Stacks</small>
            </div>
          </BoringSpellValueText>
          <BoringSpellValueText spell={TALENTS.SHADOW_CRASH_TALENT}>
            <div>{this.stacksSC} stacks used</div>
            <ItemDamageDone amount={this.damageSC} />{' '}
          </BoringSpellValueText>
          <BoringSpellValueText spell={SPELLS.SHADOW_WORD_PAIN}>
            <div>{this.stacksSWP} stacks used</div>
            <ItemDamageDone amount={this.damageSWP} />
          </BoringSpellValueText>
        </Statistic>
      );
    }
  }
}
export default Tier31ShadowPriest4Set;
