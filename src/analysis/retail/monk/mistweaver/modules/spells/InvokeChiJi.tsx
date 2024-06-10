import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink, Tooltip } from 'interface';
import { PerformanceMark } from 'interface/guide';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  CastEvent,
  DamageEvent,
  GlobalCooldownEvent,
  HealEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { getAveragePerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { MAX_CHIJI_STACKS } from '../../constants';
import BaseCelestialAnalyzer, { BaseCelestialTracker } from './BaseCelestialAnalyzer';
import InformationIcon from 'interface/icons/Information';
import EnvelopingBreath from './EnvelopingBreath';

const debug = false;

/**
 * Blackout Kick, Totm BoKs, Rising Sun Kick and Spinning Crane Kick generate stacks of Invoke Chi-Ji, the Red Crane, which reduce the cast time and mana
 * cost of Enveloping Mist by 33% per stack, up to 3 stacks.
 * These abilities also heal 2 nearby allies for a Gust of Mist heal.
 * Casting Enveloping Mist while Chiji is active applies Enveloping Breath on up to 6 nearby allies within 10 yards.
 */

interface ChijiCastTracker extends BaseCelestialTracker {
  overcappedTotmStacks: number;
  overcappedChijiStacks: number;
}

class InvokeChiJi extends BaseCelestialAnalyzer {
  protected envb!: EnvelopingBreath;
  castTrackers: ChijiCastTracker[] = [];
  //healing breakdown vars
  gustHealing: number = 0;
  envelopHealing: number = 0;
  chiCocoonHealing: number = 0;
  //stack breakdown vars
  chijiStackCount: number = 0;
  castsBelowMaxStacks: number = 0;
  wastedStacks: number = 0;
  freeCasts: number = 0;
  //missed GCDs vars
  missedGlobals: number = 0;
  chijiStart: number = 0;
  chijiGlobals: number = 0;
  chijiUses: number = 0;
  lastGlobal: number = 0;
  checkForSckDamage: number = -1;
  castBokInWindow: boolean = false;

  get totalHealing() {
    return this.gustHealing + this.envelopHealing + this.chiCocoonHealing;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUST_OF_MISTS_CHIJI),
      this.handleGust,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH_HEAL),
      this.handleEnvelopingBreath,
    );
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.CHI_COCOON_HEAL_CHIIJI),
      this.handleChiCocoon,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.handleEnvelopCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT),
      this.handleChijiStart,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.BLACKOUT_KICK,
          SPELLS.RISING_SUN_KICK_DAMAGE,
          SPELLS.BLACKOUT_KICK_TOTM,
          SPELLS.SPINNING_CRANE_KICK_DAMAGE,
        ]),
      this.handleStackGenerator,
    );
    //need a different eventlistener beacause chiji currently only applies 1 stack per cast of sck, not on each dmg event
    this.addEventListener(
      Events.GlobalCooldown.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK),
      this.handleSpinningCraneKick,
    );
    this.addEventListener(Events.GlobalCooldown.by(SELECTED_PLAYER), this.handleGlobal);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.RISING_SUN_KICK_TALENT),
      this.onRSK,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK),
      this.onRSK,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK), this.onBOK);
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY),
      this.onTotmRefresh,
    );
  }

  //missed gcd mangement
  handleChijiStart(event: CastEvent) {
    this.celestialActive = true;
    this.chijiStart = this.lastGlobal = event.timestamp;
    this.chijiGlobals += 1;
    this.chijiUses += 1;
    this.castBokInWindow = false;
    this.castTrackers.push({
      timestamp: event.timestamp,
      totmStacks: this.selectedCombatant.getBuffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY.id),
      overcappedChijiStacks: 0,
      overcappedTotmStacks: 0,
      lessonsDuration: 0,
      infusionDuration: 0,
      totalEnvB: 0,
      totalEnvM: 0,
      averageHaste: 0,
      deathTimestamp: 0,
      castRsk: false,
    });
  }

  onRSK(event: CastEvent) {
    if (!this.celestialActive) {
      return;
    }
    if (
      this.selectedCombatant.getBuffStacks(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.id) ===
      MAX_CHIJI_STACKS
    ) {
      debug && console.log('wasted chiji stack at ', this.owner.formatTimestamp(event.timestamp));
      this.castTrackers.at(-1)!.overcappedChijiStacks += 1;
    }
  }

  onBOK(event: CastEvent) {
    if (!this.celestialActive) {
      return;
    }
    // the first cast of BoK in the window should overcap (intentionally). ignore it
    if (!this.castBokInWindow) {
      this.castBokInWindow = true;
      return;
    }
    const stacksGained =
      1 + this.selectedCombatant.getBuffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY.id);
    if (
      this.selectedCombatant.getBuffStacks(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.id) +
        stacksGained >
      MAX_CHIJI_STACKS
    ) {
      debug && console.log('wasted chiji stack at ', this.owner.formatTimestamp(event.timestamp));
      this.castTrackers.at(-1)!.overcappedChijiStacks +=
        this.selectedCombatant.getBuffStacks(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.id) +
        stacksGained -
        MAX_CHIJI_STACKS;
    }
  }

  onSCK(event: CastEvent) {
    if (!this.celestialActive) {
      return;
    }
    if (this.selectedCombatant.getBuffStacks(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.id) === 3) {
      this.castTrackers.at(-1)!.overcappedChijiStacks += 1;
      debug && console.log('wasted chiji stack at ', this.owner.formatTimestamp(event.timestamp));
    }
  }

  onTotmRefresh(event: RefreshBuffEvent) {
    if (this.celestialActive) {
      debug && console.log('wasted totm stack at ', this.owner.formatTimestamp(event.timestamp));
      this.castTrackers.at(-1)!.overcappedTotmStacks += 1;
    }
  }

  handleGlobal(event: GlobalCooldownEvent) {
    if (this.celestialActive) {
      this.chijiGlobals += 1;
      //if timebetween globals is longer than the gcd add the difference to the missed gcd tally
      if (event.timestamp - this.lastGlobal > event.duration) {
        this.missedGlobals += (event.timestamp - this.lastGlobal - event.duration) / event.duration;
      }
      this.lastGlobal = event.timestamp;
    }
  }

  //healing management
  handleGust(event: HealEvent) {
    this.gustHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  handleEnvelopingBreath(event: HealEvent) {
    this.envelopHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  handleChiCocoon(event: AbsorbedEvent) {
    this.chiCocoonHealing += event.amount;
  }

  //stackbreakown management
  handleStackGenerator(event: DamageEvent) {
    if (this.celestialActive) {
      if (event.ability.guid === SPELLS.SPINNING_CRANE_KICK_DAMAGE.id) {
        if (this.checkForSckDamage > event.timestamp) {
          this.stackCount();
          this.checkForSckDamage = -1;
        }
      } else {
        this.stackCount();
      }
    }
  }

  handleSpinningCraneKick(event: GlobalCooldownEvent) {
    if (this.celestialActive) {
      this.checkForSckDamage = event.duration + this.lastGlobal;
    }
  }

  handleEnvelopCast(event: CastEvent) {
    //in some cases the last envelop is cast after chiji has expired but the buff can still be consumed
    if (
      this.celestialActive ||
      this.selectedCombatant.hasBuff(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.id)
    ) {
      if (this.chijiStackCount === MAX_CHIJI_STACKS) {
        this.freeCasts += 1;
      } else if (this.chijiStackCount < MAX_CHIJI_STACKS) {
        this.castsBelowMaxStacks += 1;
      }
      this.chijiStackCount = 0;
    }
  }

  stackCount() {
    if (this.chijiStackCount === MAX_CHIJI_STACKS) {
      this.wastedStacks += 1;
    } else {
      this.chijiStackCount += 1;
    }
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  get guideCastBreakdown() {
    const explanationPercent = 55;
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT} />
        </strong>{' '}
        requires some preparation to be used optimally. Press{' '}
        <SpellLink spell={SPELLS.TIGER_PALM} /> to stack{' '}
        <SpellLink spell={TALENTS_MONK.TEACHINGS_OF_THE_MONASTERY_TALENT} /> to maximum stacks, get
        all of your <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> charges on cooldown.
        <br />
        During <SpellLink spell={TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT} />, aim to cast{' '}
        <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> when at two stacks of{' '}
        <SpellLink spell={SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF} /> to maximize mana efficiency and
        healing. <br />
        Choose your target carefully to to maximize targets hit by{' '}
        <SpellLink spell={SPELLS.ENVELOPING_BREATH_HEAL} />, which is where the majority of your
        healing comes from. It is important to avoid overcapping on{' '}
        <SpellLink spell={TALENTS_MONK.TEACHINGS_OF_THE_MONASTERY_TALENT} /> and{' '}
        <SpellLink spell={SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF} /> stacks.
      </p>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.castTrackers.map((cast, ix) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink spell={TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT} />
            </>
          );
          const totmRefreshPerf =
            cast.overcappedTotmStacks > 0
              ? QualitativePerformance.Fail
              : QualitativePerformance.Good;
          const chijiRefreshPerf =
            cast.overcappedChijiStacks > 0
              ? QualitativePerformance.Fail
              : QualitativePerformance.Good;
          const superList = super.getCooldownExpandableItems(cast);
          const checklistItems: CooldownExpandableItem[] = superList[1];
          let totmPerf = QualitativePerformance.Good;
          if (cast.totmStacks < 2) {
            totmPerf = QualitativePerformance.Fail;
          } else if (cast.totmStacks < 3) {
            totmPerf = QualitativePerformance.Ok;
          }
          checklistItems.push({
            label: (
              <>
                <SpellLink spell={TALENTS_MONK.TEACHINGS_OF_THE_MONASTERY_TALENT} /> stacks on cast{' '}
                <Tooltip
                  hoverable
                  content={
                    <>
                      Get 3 stacks of{' '}
                      <SpellLink spell={TALENTS_MONK.TEACHINGS_OF_THE_MONASTERY_TALENT} /> so that
                      you can instantly cast <SpellLink spell={SPELLS.BLACKOUT_KICK} /> for 8 total{' '}
                      <SpellLink spell={SPELLS.GUST_OF_MISTS_CHIJI} /> heals
                    </>
                  }
                >
                  <span>
                    <InformationIcon />
                  </span>
                </Tooltip>
              </>
            ),
            result: <PerformanceMark perf={totmPerf} />,
            details: <>{cast.totmStacks}</>,
          });
          const allPerfs = [totmRefreshPerf, chijiRefreshPerf, totmPerf].concat(superList[0]);
          checklistItems.push({
            label: (
              <>
                <SpellLink spell={SPELLS.TEACHINGS_OF_THE_MONASTERY} /> stacks wasted
              </>
            ),
            result: <PerformanceMark perf={totmRefreshPerf} />,
            details: <>{cast.overcappedTotmStacks}</>,
          });
          checklistItems.push({
            label: (
              <>
                <SpellLink spell={SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF} /> stacks wasted
              </>
            ),
            result: <PerformanceMark perf={chijiRefreshPerf} />,
            details: <>{cast.overcappedChijiStacks}</>,
          });
          const avgPerf = getAveragePerf(allPerfs);
          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={avgPerf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data, explanationPercent);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Healing Breakdown:
            <ul>
              <li>
                {formatNumber(this.gustHealing)} healing from{' '}
                <SpellLink spell={SPELLS.GUST_OF_MISTS_CHIJI} />.
              </li>
              <li>
                {formatNumber(this.envelopHealing)}{' '}
                <SpellLink spell={SPELLS.ENVELOPING_BREATH_HEAL} /> healing from{' '}
                <SpellLink spell={TALENTS_MONK.CELESTIAL_HARMONY_TALENT} />.
              </li>
              <li>
                {formatNumber(this.chiCocoonHealing)}{' '}
                <SpellLink spell={SPELLS.CHI_COCOON_HEAL_CHIIJI} /> healing from{' '}
                <SpellLink spell={TALENTS_MONK.CELESTIAL_HARMONY_TALENT} />.
              </li>
            </ul>
            Stack Breakdown:
            <ul>
              <li>
                {formatNumber(this.freeCasts)} free{' '}
                <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> cast(s).
              </li>
              <li>
                {formatNumber(this.castsBelowMaxStacks)}{' '}
                <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> cast(s) below max (
                {MAX_CHIJI_STACKS}) Chi-Ji stacks.
              </li>
              <li>
                {formatNumber(this.wastedStacks)} stack(s) wasted from overcapping Chi-Ji stacks.
              </li>
            </ul>
            Activity:
            <ul>
              <li>
                {(this.chijiGlobals / this.chijiUses).toFixed(2)} average gcds inside Chi-Ji window
              </li>
              <li>
                {this.envb.averageEnvBPerEnv.toFixed(2)} average{' '}
                <SpellLink spell={SPELLS.ENVELOPING_BREATH_HEAL} /> per{' '}
                <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> cast
              </li>
            </ul>
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT} /> and
              <br />
              <SpellLink spell={TALENTS_MONK.CELESTIAL_HARMONY_TALENT} />
            </>
          }
        >
          <>
            <ItemHealingDone amount={this.totalHealing} />
            <br />
            {formatNumber(this.missedGlobals)} <small>missed GCDs</small>
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default InvokeChiJi;
