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
import { getCurrentRSKTalent, getCurrentRSKTalentDamage, MAX_CHIJI_STACKS } from '../../constants';
import BaseCelestialAnalyzer, { BaseCelestialTracker } from './BaseCelestialAnalyzer';
import InformationIcon from 'interface/icons/Information';

const debug = false;

/**
 * Blackout Kick, Totm BoKs, Rising Sun Kick and Spinning Crane Kick generate stacks of Invoke Chi-Ji, the Red Crane, which reduce the cast time and mana
 * cost of Enveloping Mist by 33% per stack, up to 3 stacks.
 * These abilities also heal 2 nearby allies for a Gust of Mist heal.
 * Casting Enveloping Mist while Chiji is active applies Enveloping Breath on up to 6 nearby allies within 10 yards.
 */

interface ChijiCastTracker extends BaseCelestialTracker {
  overcappedTotmStacks: number;
}

class InvokeChiJi extends BaseCelestialAnalyzer {
  castTrackers: ChijiCastTracker[] = [];
  //healing breakdown vars
  gustHealing = 0;
  envelopHealing = 0;
  chiCocoonHealing = 0;
  //stack breakdown vars
  //missed GCDs vars
  missedGlobals = 0;
  chijiStart = 0;
  chijiGlobals = 0;
  chijiUses = 0;
  lastGlobal = 0;
  checkForSckDamage = -1;
  castBokInWindow = false;

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
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.CHI_COCOON_BUFF_CHIJI),
      this.handleChiCocoon,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT),
      this.handleChijiStart,
    );

    //need a different eventlistener beacause chiji currently only applies 1 stack per cast of sck, not on each dmg event
    this.addEventListener(
      Events.GlobalCooldown.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK),
      this.handleSpinningCraneKick,
    );
    this.addEventListener(Events.GlobalCooldown.by(SELECTED_PLAYER), this.handleGlobal);
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
      overcappedTotmStacks: 0,
      siBuffId: this.currentSIBuffId,
      totalEnvM: 0,
      averageHaste: 0,
      deathTimestamp: 0,
      castRsk: false,
    });
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
  }

  onSCK(event: CastEvent) {
    if (!this.celestialActive) {
      return;
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

  handleChiCocoon(event: AbsorbedEvent) {
    this.chiCocoonHealing += event.amount;
  }

  handleSpinningCraneKick(event: GlobalCooldownEvent) {
    if (this.celestialActive) {
      this.checkForSckDamage = event.duration + this.lastGlobal;
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
        requires some preparation to be used optimally. Get all of your{' '}
        <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> charges and{' '}
        <SpellLink spell={getCurrentRSKTalent(this.selectedCombatant)} /> on cooldown. <hr />
        Your first ability after casting{' '}
        <SpellLink spell={TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT} /> should be{' '}
        <SpellLink spell={SPELLS.BLACKOUT_KICK} /> to immediately utilize the{' '}
        <SpellLink spell={TALENTS_MONK.TEACHINGS_OF_THE_MONASTERY_TALENT} /> stacks granted by{' '}
        <SpellLink spell={TALENTS_MONK.CELESTIAL_HARMONY_TALENT} />.
        <hr />
        During <SpellLink spell={TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT} />, aim to cast{' '}
        <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> only when other buffs like{' '}
        <SpellLink spell={TALENTS_MONK.SPIRITFONT_1_MISTWEAVER_TALENT} /> or{' '}
        <SpellLink spell={TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT} /> are active to maximize{' '}
        your healing. <br />
        It is important to avoid overcapping on{' '}
        <SpellLink spell={TALENTS_MONK.TEACHINGS_OF_THE_MONASTERY_TALENT} />.
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
          const superList = super.getCooldownExpandableItems(cast);
          const checklistItems: CooldownExpandableItem[] = superList[1];
          const allPerfs = [totmRefreshPerf].concat(superList[0]);
          if (!this.selectedCombatant.hasTalent(TALENTS_MONK.CELESTIAL_HARMONY_TALENT)) {
            let totmPerf = QualitativePerformance.Good;
            if (cast.totmStacks < 2) {
              totmPerf = QualitativePerformance.Fail;
            } else if (cast.totmStacks < 3) {
              totmPerf = QualitativePerformance.Ok;
            }
            checklistItems.push({
              label: (
                <>
                  <SpellLink spell={TALENTS_MONK.TEACHINGS_OF_THE_MONASTERY_TALENT} /> stacks on
                  cast{' '}
                  <Tooltip
                    hoverable
                    content={
                      <>
                        Get 4 stacks of{' '}
                        <SpellLink spell={TALENTS_MONK.TEACHINGS_OF_THE_MONASTERY_TALENT} /> so that
                        you can instantly cast <SpellLink spell={SPELLS.BLACKOUT_KICK} /> for 30
                        total <SpellLink spell={SPELLS.GUST_OF_MISTS_CHIJI} /> heals
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
            allPerfs.push(totmPerf);
          }
          checklistItems.push({
            label: (
              <>
                <SpellLink spell={SPELLS.TEACHINGS_OF_THE_MONASTERY} /> stacks wasted
              </>
            ),
            result: <PerformanceMark perf={totmRefreshPerf} />,
            details: <>{cast.overcappedTotmStacks}</>,
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
                {formatNumber(this.chiCocoonHealing)}{' '}
                <SpellLink spell={SPELLS.CHI_COCOON_BUFF_CHIJI} /> healing from{' '}
                <SpellLink spell={TALENTS_MONK.CELESTIAL_HARMONY_TALENT} />.
              </li>
            </ul>
            Activity:
            <ul>
              <li>
                {(this.chijiGlobals / this.chijiUses).toFixed(2)} average gcds inside Chi-Ji window
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
