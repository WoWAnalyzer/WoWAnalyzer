import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import { Panel, SpellIcon, SpellLink } from 'interface';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent, CastEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HotTracker, { Attribution, Tracker } from 'parser/shared/modules/HotTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { ATTRIBUTION_STRINGS, RISING_MIST_EXTENSION, SPELL_COLORS } from '../../constants';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import HotTrackerMW from '../core/HotTrackerMW';
import Vivify from './Vivify';
import { Section, SubSection } from 'interface/guide';
import { CSSProperties } from 'react';
import '../../ui/RisingMist.scss';
import T32TierSet from '../tier/T32TierSet';

const debug = false;

const ATTRIBUTION_PREFIX = 'RisingMist #';

class RisingMist extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
    vivify: Vivify,
    tier32: T32TierSet,
  };

  hotTracker!: HotTrackerMW;
  abilityTracker!: AbilityTracker;
  spellUsable!: SpellUsable;
  vivify!: Vivify;
  tier32!: T32TierSet;

  get averageExtension() {
    return this.risingMistCount === 0
      ? 0
      : this.risingMists.reduce(
          (acc: number, risingMist: Attribution) => acc + risingMist.totalExtension,
          0,
        ) /
          this.risingMistCount /
          1000;
  }

  get hotHealing() {
    return (
      this.renewingMistExtensionHealing +
      this.envHardcastExtensionHealing +
      this.envMistyPeaksExtensionHealing
    );
  }

  get renewingMistExtensionHealing() {
    return (
      this.getExtensionHealingBySpell(SPELLS.RENEWING_MIST_HEAL.id) -
      this.tier32.fourPieceRemHealing
    );
  }

  get renewingMistHardcastExtensionHealing() {
    return this.getExtensionHealingBySpell(
      SPELLS.RENEWING_MIST_HEAL.id,
      ATTRIBUTION_STRINGS.HARDCAST_RENEWING_MIST,
    );
  }

  get renewingMistRapidDiffusionExtensionHealing() {
    return this.getExtensionHealingBySpell(
      SPELLS.RENEWING_MIST_HEAL.id,
      ATTRIBUTION_STRINGS.RAPID_DIFFUSION_RENEWING_MIST,
    );
  }

  get renewingMistDancingMistExtensionHealing() {
    return this.getExtensionHealingBySpell(
      SPELLS.RENEWING_MIST_HEAL.id,
      ATTRIBUTION_STRINGS.DANCING_MIST_RENEWING_MIST,
    );
  }

  get envHardcastExtensionHealing() {
    return this.getExtensionHealingBySpell(
      TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
      ATTRIBUTION_STRINGS.HARDCAST_ENVELOPING_MIST,
    );
  }

  get envMistyPeaksExtensionHealing() {
    return this.getExtensionHealingBySpell(
      TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
      ATTRIBUTION_STRINGS.MISTY_PEAKS_ENVELOPING_MIST,
    );
  }

  get directHealing() {
    return this.abilityTracker.getAbilityHealing(SPELLS.RISING_MIST_HEAL.id);
  }

  get totalHealing() {
    return (
      this.hotHealing + this.directHealing + this.vivHealing + this.envBonusHealing + this.zpHealing
    );
  }

  get averageHealing() {
    return this.risingMistCount === 0 ? 0 : this.directHealing / this.risingMistCount;
  }

  get averageTargetsPerRM() {
    return this.targetCount / this.risingMistCount || 0;
  }

  get calculateVivOverHealing() {
    return formatPercentage(this.vivOverhealing / (this.vivHealing + this.vivOverhealing));
  }

  hotsBySpell = new Map<number, Tracker[]>();
  risingMistCount: number = 0;
  risingMists: Attribution[] = [];
  remCount: number = 0;
  evmCount: number = 0;
  targetCount: number = 0;
  trackUplift = false;
  //zen pulse
  zpHits: number = 0;
  zpHealing: number = 0;
  zpHealingFromHardcastRems: number = 0;
  zpHealingFromRapidDiffusionRems: number = 0;
  zphealingFromDancingMistRems: number = 0;
  zpOverhealing: number = 0;
  //vivify
  vivCleaves: number = 0;
  vivHealing: number = 0;
  vivHealingFromHardcastRems: number = 0;
  vivHealingFromRapidDiffusionRems: number = 0;
  vivhealingFromDancingMistRems: number = 0;
  vivOverhealing: number = 0;
  vivAbsorbed: number = 0;
  //enveloping mist
  envHits: number = 0;
  envBonusHealing: number = 0;
  envBonusMistyPeaks: number = 0;
  envBonusHardcast: number = 0;
  envmHealingIncrease: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT);
    this.envmHealingIncrease = this.selectedCombatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT)
      ? 0.4
      : 0.3;
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.RISING_SUN_KICK_TALENT),
      this.extendHots,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RISING_MIST_HEAL),
      this.countRisingMistHits,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.INVIGORATING_MISTS_HEAL),
      this.handleVivify,
    );
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.ZEN_PULSE_TALENT)) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_HEAL),
        this.handleZenPulse,
      );
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.calculateEnv); //gotta just look at all heals tbh
  }

  countRisingMistHits(event: HealEvent) {
    this.targetCount += 1;
  }

  calculateEnv(event: HealEvent) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;
    if (
      !this.hotTracker.hots[targetId] ||
      (!this.hotTracker.hots[targetId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id] &&
        !this.hotTracker.hots[targetId][SPELLS.ENVELOPING_MIST_TFT.id])
    ) {
      return;
    }
    const hot = this.hotTracker.hots[targetId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id];

    if (
      spellId === TALENTS_MONK.ENVELOPING_MIST_TALENT.id // envm doesn't buff itself
    ) {
      return;
    }

    if (hot.originalEnd < event.timestamp) {
      this.envHits += 1;
      if (this.hotTracker.fromHardcast(hot)) {
        this.envBonusHardcast += calculateEffectiveHealing(event, this.envmHealingIncrease);
      } else if (this.hotTracker.fromMistyPeaks(hot)) {
        this.envBonusMistyPeaks += calculateEffectiveHealing(event, this.envmHealingIncrease);
      }
      this.envBonusHealing += calculateEffectiveHealing(event, this.envmHealingIncrease);
    }
  }

  handleVivify(event: HealEvent) {
    const spellId = SPELLS.RENEWING_MIST_HEAL.id;
    if (!this.hotTracker.hasHot(event, spellId)) {
      return;
    }
    const hot = this.hotTracker.hots[event.targetID][spellId];

    if (hot.originalEnd < event.timestamp) {
      if (this.hotTracker.fromHardcast(hot)) {
        this.vivHealingFromHardcastRems += event.amount + (event.absorbed || 0);
      }
      if (this.hotTracker.fromRapidDiffusion(hot)) {
        this.vivHealingFromRapidDiffusionRems += event.amount + (event.absorbed || 0);
      }
      if (this.hotTracker.fromDancingMists(hot)) {
        this.vivhealingFromDancingMistRems += event.amount + (event.absorbed || 0);
      }
      this.vivCleaves += 1;
      this.vivHealing += event.amount || 0;
      this.vivOverhealing += event.overheal || 0;
      this.vivAbsorbed += event.absorbed || 0;
    }
  }

  handleZenPulse(event: HealEvent) {
    const spellId = SPELLS.RENEWING_MIST_HEAL.id;
    if (!this.hotTracker.hasHot(event, spellId)) {
      return;
    }
    const hot = this.hotTracker.hots[event.targetID][spellId];
    if (hot.originalEnd < event.timestamp) {
      if (this.hotTracker.fromHardcast(hot)) {
        this.zpHealingFromHardcastRems += event.amount + (event.absorbed || 0);
      }
      if (this.hotTracker.fromRapidDiffusion(hot)) {
        this.zpHealingFromRapidDiffusionRems += event.amount + (event.absorbed || 0);
      }
      if (this.hotTracker.fromDancingMists(hot)) {
        this.zphealingFromDancingMistRems += event.amount + (event.absorbed || 0);
      }
      this.zpHits += 1;
      this.zpHealing += event.amount + (event.absorbed || 0);
      this.zpOverhealing += event.overheal || 0;
    }
  }

  extendHots(event: CastEvent) {
    const spellId = event.ability.guid;
    if (TALENTS_MONK.RISING_SUN_KICK_TALENT.id !== spellId) {
      return;
    }

    this.risingMistCount += 1;
    debug && console.log(`risingMist cast #: ${this.risingMistCount}`);

    const newRisingMist = HotTracker.getNewAttribution(ATTRIBUTION_PREFIX + this.risingMistCount);
    this.risingMists.push(newRisingMist);

    Object.keys(this.hotTracker.hots).forEach((player) => {
      const playerId = Number(player);
      Object.keys(this.hotTracker.hots[playerId]).forEach((spellIdString) => {
        const spellId = Number(spellIdString);
        const attribution = newRisingMist;
        if (spellId === SPELLS.ENVELOPING_BREATH_HEAL.id) {
          return;
        }

        this.hotTracker.addExtension(
          attribution,
          RISING_MIST_EXTENSION,
          playerId,
          spellId,
          event.timestamp,
        );
        if (spellId === SPELLS.RENEWING_MIST_HEAL.id) {
          this.remCount += 1;
        } else if (
          spellId === TALENTS_MONK.ENVELOPING_MIST_TALENT.id ||
          spellId === SPELLS.ENVELOPING_MIST_TFT.id
        ) {
          this.evmCount += 1;
        }
      });
    });
  }

  private getExtensionHealingBySpell(spellId: number, attribution?: string): number {
    let value = 0;
    debug && console.log(this.hotTracker.hotHistory);
    this.hotTracker.hotHistory.forEach((hot: Tracker) => {
      if (hot.spellId === spellId) {
        if (
          attribution !== undefined &&
          !hot.attributions.some(function (attr) {
            return attr.name === attribution;
          })
        ) {
          return;
        } else {
          value += hot.healingAfterOriginalEnd || 0;
        }
      }
    });
    return value;
  }

  averageTargetsPerRSKCast() {
    return <>{formatNumber(this.averageTargetsPerRM)}</>;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.RISING_MIST_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  toolTip() {
    return (
      <>
        Your {this.risingMistCount} Rising Sun Kick casts contributed the following:
        <ul>
          <li>HoT Extension Healing: {formatNumber(this.hotHealing)}</li>
          <li>Average HoT Extension Seconds per cast: {this.averageExtension.toFixed(2)}</li>
          <li>
            <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> HoTs Extended: {this.remCount}
          </li>
          <li>
            <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> HoTs Extended: {this.evmCount}
          </li>
        </ul>
      </>
    );
  }

  getAverageDuration(hotHistory: Tracker[]) {
    const duration = hotHistory.reduce((sum, hot) => sum + this.getDuration(hot), 0);
    return ' - Average Duration: ' + formatDuration(duration / hotHistory.length) + ' seconds';
  }

  getSource(hot: Tracker) {
    if (this.hotTracker.fromDancingMists(hot)) {
      return 'Dancing Mist';
    } else if (this.hotTracker.fromHardcast(hot)) {
      return 'Hardcast';
    } else if (this.hotTracker.fromRapidDiffusion(hot)) {
      return 'Rapid Diffusion';
    } else if (this.hotTracker.fromMistyPeaks(hot)) {
      return 'Misty Peaks';
    } else if (this.hotTracker.fromMistsOfLife(hot)) {
      return 'Mists of Life';
    }
  }

  getSecondaryIcon(hot: Tracker) {
    //hardcast
    if (hot.maxDuration! >= 60000) {
      return <SpellIcon spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} />;
    }
    if (this.hotTracker.fromMistsOfLife(hot)) {
      return <SpellIcon spell={TALENTS_MONK.LIFE_COCOON_TALENT} />;
    }
    //rd
    if (this.hotTracker.fromRapidDiffusionEnvelopingMist(hot)) {
      return <SpellIcon spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} />;
    }
    if (this.hotTracker.fromRapidDiffusionRisingSunKick(hot)) {
      return <SpellIcon spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} />;
    }
    //dm
    if (this.hotTracker.fromDancingMistRapidDiffusion(hot)) {
      return <SpellIcon spell={TALENTS_MONK.RAPID_DIFFUSION_TALENT} />;
    }
    if (this.hotTracker.fromDancingMistMistsOfLife(hot)) {
      return <SpellIcon spell={TALENTS_MONK.LIFE_COCOON_TALENT} />;
    }
  }

  getDuration(hot: Tracker) {
    let duration = hot.end - hot.start;
    if (hot.maxDuration && duration > hot.maxDuration) {
      duration = hot.maxDuration;
    }
    return duration;
  }

  getSpellColor(hot: Tracker) {
    if (hot.spellId === SPELLS.RENEWING_MIST_HEAL.id) {
      return SPELL_COLORS.RENEWING_MIST;
    }
    if (hot.spellId === TALENTS_MONK.ENVELOPING_MIST_TALENT.id) {
      return SPELL_COLORS.ENVELOPING_MIST;
    }
    return '#70b570';
  }

  hotTable(hotId: number, hotHistory: Tracker[], attribution: string) {
    const hotSpan = (id: number, style: React.CSSProperties = { float: 'left' }) => {
      const hots = this.hotTracker.hotHistory.filter((hot) => {
        return hot.spellId === id;
      });
      if (!hots) {
        return '';
      }
      return hots[0].name;
    };
    const hotTable = ([hotId, hotHistory, attribution]: [number, Tracker[], string]) => {
      const tableEntries = hotHistory;
      if (tableEntries.length === 0) {
        return null;
      }
      const liDivTitle: CSSProperties = {
        display: 'inline-block',
        float: 'left',
        paddingRight: '5px',
        width: '30%',
      };
      const liDivLabel: CSSProperties = {
        display: 'inline-block',
        float: 'left',
        paddingRight: '10px',
      };
      const liDivBar: CSSProperties = { display: 'inline-block', float: 'left', width: '25%' };
      return (
        <Section
          expanded={false}
          title={
            hotSpan.call(this, hotId) +
            (attribution.length > 0 ? ' - ' + attribution : '') +
            this.getAverageDuration(hotHistory) +
            ' (' +
            formatNumber(
              this.hotTracker.getAverageHealingForAttribution(
                hotId,
                attribution,
                undefined,
                hotHistory,
              ),
            ) +
            ' Average)'
          }
        >
          <SubSection>
            <div style={liDivTitle}>HoT and Source</div>

            <div
              style={{
                display: 'inline-block',
                float: 'left',
                paddingRight: '5px',
                paddingLeft: '85px',
                width: '45%',
              }}
            >
              Duration and Percent Extended
            </div>
          </SubSection>
          <ul className="list">
            {tableEntries.map((tracker) => (
              <li
                key={tracker.spellId}
                className="item clearfix"
                style={{ padding: '10px 10px', display: 'inline-block', width: '100%' }}
              >
                <div style={liDivTitle}>
                  {this.getSecondaryIcon(tracker)}
                  <SpellLink spell={tracker.spellId} /> - {this.getSource(tracker)} @
                  <strong>{this.owner.formatTimestamp(tracker.start, 2)}</strong>
                </div>
                <div style={liDivLabel}>{formatDuration(this.getDuration(tracker))}</div>
                <div className="flex performance-bar-container" style={liDivBar}>
                  <div
                    className="flex-sub performance-bar"
                    style={{
                      width: `${
                        tracker.maxDuration
                          ? formatPercentage(this.getDuration(tracker) / tracker.maxDuration)
                          : '100'
                      }%`,
                      backgroundColor: `${this.getSpellColor(tracker)}`,
                    }}
                  />
                </div>
                <div className="text-left" style={liDivLabel}>
                  {tracker.maxDuration ? (
                    <>{formatPercentage(this.getDuration(tracker) / tracker.maxDuration)}</>
                  ) : (
                    <>100</>
                  )}
                  %
                </div>
              </li>
            ))}
          </ul>
        </Section>
      );
    };
    return hotTable([hotId, hotHistory, attribution]);
  }

  entries() {
    const remHardcastHistory = this.hotTracker.getHistoryForSpellAndAttribution(
      SPELLS.RENEWING_MIST_HEAL.id,
      ATTRIBUTION_STRINGS.HARDCAST_RENEWING_MIST,
      true,
    );
    const rementries = this.hotTable(SPELLS.RENEWING_MIST_HEAL.id, remHardcastHistory, 'Hardcast');
    const rdRemHistory = this.hotTracker.getHistoryForSpellAndAttribution(
      SPELLS.RENEWING_MIST_HEAL.id,
      ATTRIBUTION_STRINGS.RAPID_DIFFUSION_RENEWING_MIST,
      true,
    );
    const rdRemEntries = this.hotTable(
      SPELLS.RENEWING_MIST_HEAL.id,
      rdRemHistory,
      'Rapid Diffusion',
    );
    const dmRemHistory = this.hotTracker.getHistoryForSpellAndAttribution(
      SPELLS.RENEWING_MIST_HEAL.id,
      ATTRIBUTION_STRINGS.DANCING_MIST_RENEWING_MIST,
      false,
    );
    const dmRemEntries = this.hotTable(SPELLS.RENEWING_MIST_HEAL.id, dmRemHistory, 'Dancing Mist');
    const mistyPeaksHistory = this.hotTracker.getHistoryForSpellAndAttribution(
      TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
      ATTRIBUTION_STRINGS.MISTY_PEAKS_ENVELOPING_MIST,
      false,
    );
    const mistyPeaksentries = this.hotTable(
      TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
      mistyPeaksHistory,
      'Misty Peaks',
    );
    const envHardcastHistory = this.hotTracker.getHistoryForSpellAndAttribution(
      TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
      ATTRIBUTION_STRINGS.HARDCAST_ENVELOPING_MIST,
      false,
    );
    const envEntries = this.hotTable(
      TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
      envHardcastHistory,
      'Hardcast',
    );

    return [rementries, rdRemEntries, dmRemEntries, envEntries, mistyPeaksentries];
  }

  tab() {
    return {
      title: 'Rising Mist',
      url: 'rising-mist',
      render: () => (
        <Panel
          title="Rising Mist Extension"
          explanation="Listing of each applied hots' total duration after extension. *Keep in mind that there is latency time between Renewing Mist bounces which can give the appearance of hots lasting longer than 100% of max duration limit of Rising Mist*"
        >
          <Section title="Click to expand/collapse each section for each hot by source application">
            {this.entries()}
          </Section>
        </Panel>
      ),
    };
  }
}

export default RisingMist;
