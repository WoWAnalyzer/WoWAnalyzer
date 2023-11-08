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
import T29TierSet from '../dragonflight/tier/T29MWTier';
import { Section, SubSection } from 'interface/guide';
import { CSSProperties } from 'react';
import '../../ui/RisingMist.scss';

const debug = false;

const ATTRIBUTION_PREFIX = 'RisingMist #';

class RisingMist extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
    vivify: Vivify,
    t29TierSet: T29TierSet,
  };

  hotTracker!: HotTrackerMW;
  abilityTracker!: AbilityTracker;
  spellUsable!: SpellUsable;
  vivify!: Vivify;
  t29TierSet!: T29TierSet;

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
      this.essenceFontExtensionHealing +
      this.envHardcastExtensionHealing +
      this.envMistyPeaksExtensionHealing
    );
  }

  get renewingMistExtensionHealing() {
    return (
      this.getExtensionHealingBySpell(SPELLS.RENEWING_MIST_HEAL.id) -
      this.t29TierSet.extraRemHealing
    ); // don't want rem healing from tier set ticks;
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

  get essenceFontExtensionHealing() {
    return (
      this.getExtensionHealingBySpell(SPELLS.ESSENCE_FONT_BUFF.id) +
      this.getExtensionHealingBySpell(SPELLS.FAELINE_STOMP_ESSENCE_FONT.id)
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
    return this.abilityTracker.getAbility(SPELLS.RISING_MIST_HEAL.id).healingEffective;
  }

  get totalHealing() {
    return (
      this.hotHealing +
      this.directHealing +
      this.extraMasteryhealing +
      this.extraVivHealing +
      this.extraEnvBonusHealing
    );
  }

  get averageHealing() {
    return this.risingMistCount === 0 ? 0 : this.directHealing / this.risingMistCount;
  }

  get averageTargetsPerRM() {
    return this.targetCount / this.risingMistCount || 0;
  }

  get calculateVivOverHealing() {
    return formatPercentage(
      this.extraVivOverhealing / (this.extraVivHealing + this.extraVivOverhealing),
    );
  }

  get calculateMasteryOverHealing() {
    return formatPercentage(
      this.extraMasteryOverhealing / (this.extraMasteryhealing + this.extraMasteryOverhealing),
    );
  }

  get calculateEFOverHealing() {
    return formatPercentage(
      this.extraEFOverhealing / (this.extraEFhealing + this.extraEFOverhealing),
    );
  }
  hotsBySpell = new Map<number, Tracker[]>();
  risingMistCount: number = 0;
  risingMists: Attribution[] = [];
  remCount: number = 0;
  efCount: number = 0;
  flsEfCount: number = 0;
  evmCount: number = 0;
  targetCount: number = 0;
  trackUplift = false;
  extraVivCleaves: number = 0;
  extraVivHealing: number = 0;
  extraVivHealingFromHardcastRems: number = 0;
  extraVivHealingFromRapidDiffusionRems: number = 0;
  extraVivhealingFromDancingMistRems: number = 0;
  extraVivOverhealing: number = 0;
  extraVivAbsorbed: number = 0;
  extraEnvHits: number = 0;
  extraEnvBonusHealing: number = 0;
  extraEnvBonusMistyPeaks: number = 0;
  extraEnvBonusHardcast: number = 0;
  extraMasteryHits: number = 0;
  extraChijiGomHealing: number = 0;
  extraGomHealing: number = 0;
  extraMasteryhealing: number = 0;
  extraMasteryOverhealing: number = 0;
  extraMasteryAbsorbed: number = 0;
  masteryTickTock = false;
  extraEFhealing: number = 0;
  extraEFOverhealing: number = 0;
  extraEFAbsorbed: number = 0;
  upwellingOffset: number = 0;
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
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.calculateEnv); //gotta just look at all heals tbh
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.GUST_OF_MISTS_CHIJI, SPELLS.GUSTS_OF_MISTS]),
      this.handleMastery,
    );
  }

  countRisingMistHits(event: HealEvent) {
    this.targetCount += 1;
  }

  handleMastery(event: HealEvent) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;
    if (
      !this.hotTracker.hots[targetId] ||
      (!this.hotTracker.hots[targetId][SPELLS.ESSENCE_FONT_BUFF.id] &&
        !this.hotTracker.hots[targetId][SPELLS.FAELINE_STOMP_ESSENCE_FONT.id])
    ) {
      return;
    }

    const efHot = this.hotTracker.hots[targetId][SPELLS.ESSENCE_FONT_BUFF.id];
    const flsHot = this.hotTracker.hots[targetId][SPELLS.FAELINE_STOMP_ESSENCE_FONT.id];

    if (
      (efHot && efHot.originalEnd < event.timestamp) ||
      (flsHot && flsHot.originalEnd < event.timestamp)
    ) {
      if (!this.masteryTickTock) {
        if (spellId === SPELLS.GUST_OF_MISTS_CHIJI.id) {
          this.extraChijiGomHealing += event.amount + (event.absorbed || 0);
        }
        if (spellId === SPELLS.GUSTS_OF_MISTS.id) {
          this.extraGomHealing += event.amount + (event.absorbed || 0);
        }

        this.extraMasteryHits += 1;
        this.extraMasteryhealing += event.amount || 0;
        this.extraMasteryOverhealing += event.overheal || 0;
        this.extraMasteryAbsorbed += event.absorbed || 0;
      }
      this.masteryTickTock = !this.masteryTickTock;
    }
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
      this.extraEnvHits += 1;
      if (this.hotTracker.fromHardcast(hot)) {
        this.extraEnvBonusHardcast += calculateEffectiveHealing(event, this.envmHealingIncrease);
      } else if (this.hotTracker.fromMistyPeaks(hot)) {
        this.extraEnvBonusMistyPeaks += calculateEffectiveHealing(event, this.envmHealingIncrease);
      }
      this.extraEnvBonusHealing += calculateEffectiveHealing(event, this.envmHealingIncrease);
    }
  }

  handleVivify(event: HealEvent) {
    const targetId = event.targetID;
    if (
      !this.hotTracker.hots[targetId] ||
      !this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id];
    if (hot.originalEnd < event.timestamp) {
      if (this.hotTracker.fromHardcast(hot)) {
        this.extraVivHealingFromHardcastRems += event.amount + (event.absorbed || 0);
      }
      if (this.hotTracker.fromRapidDiffusion(hot)) {
        this.extraVivHealingFromRapidDiffusionRems += event.amount + (event.absorbed || 0);
      }
      if (this.hotTracker.fromDancingMists(hot)) {
        this.extraVivhealingFromDancingMistRems += event.amount + (event.absorbed || 0);
      }
      this.extraVivCleaves += 1;
      this.extraVivHealing += event.amount || 0;
      this.extraVivOverhealing += event.overheal || 0;
      this.extraVivAbsorbed += event.absorbed || 0;
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
        if (spellId === SPELLS.ESSENCE_FONT_BUFF.id) {
          this.efCount += 1;
        } else if (spellId === SPELLS.FAELINE_STOMP_ESSENCE_FONT.id) {
          this.flsEfCount += 1;
        } else if (spellId === SPELLS.RENEWING_MIST_HEAL.id) {
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
          <li>Essence Font HoTs Extended: {this.efCount}</li>
          {this.selectedCombatant.hasTalent(TALENTS_MONK.FAELINE_STOMP_TALENT) && (
            <li>FLS Essence Font HoTs extended: {this.flsEfCount}</li>
          )}
          <li>Renewing Mist HoTs Extended: {this.remCount}</li>
          <li>Enveloping Mist HoTs Extended: {this.evmCount}</li>
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
    if (hot.spellId === SPELLS.ESSENCE_FONT_BUFF.id) {
      return SPELL_COLORS.ESSENCE_FONT;
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
            this.getAverageDuration(hotHistory)
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
    const rementries = this.hotTable(
      SPELLS.RENEWING_MIST_HEAL.id,
      this.hotTracker.hotHistory.filter(
        (tracker) =>
          tracker.spellId === SPELLS.RENEWING_MIST_HEAL.id &&
          this.hotTracker.fromHardcast(tracker) &&
          !this.hotTracker.fromDancingMists(tracker),
      ),
      'Hardcast',
    );
    const rdRemEntries = this.hotTable(
      SPELLS.RENEWING_MIST_HEAL.id,
      this.hotTracker.hotHistory.filter(
        (tracker) =>
          tracker.spellId === SPELLS.RENEWING_MIST_HEAL.id &&
          this.hotTracker.fromRapidDiffusion(tracker) &&
          !this.hotTracker.fromDancingMists(tracker),
      ),
      'Rapid Diffusion',
    );
    const dmRemEntries = this.hotTable(
      SPELLS.RENEWING_MIST_HEAL.id,
      this.hotTracker.hotHistory.filter(
        (tracker) =>
          tracker.spellId === SPELLS.RENEWING_MIST_HEAL.id &&
          this.hotTracker.fromDancingMists(tracker),
      ),
      'Dancing Mist',
    );
    const efentries = this.hotTable(
      SPELLS.ESSENCE_FONT_BUFF.id,
      this.hotTracker.hotHistory.filter(
        (tracker) => tracker.spellId === SPELLS.ESSENCE_FONT_BUFF.id,
      ),
      '',
    );
    const mistyPeaksentries = this.hotTable(
      TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
      this.hotTracker.hotHistory.filter(
        (tracker) =>
          tracker.spellId === TALENTS_MONK.ENVELOPING_MIST_TALENT.id &&
          this.hotTracker.fromMistyPeaks(tracker),
      ),
      'Misty Peaks',
    );
    const envEntries = this.hotTable(
      TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
      this.hotTracker.hotHistory.filter(
        (tracker) =>
          tracker.spellId === TALENTS_MONK.ENVELOPING_MIST_TALENT.id &&
          this.hotTracker.fromHardcast(tracker),
      ),
      'Hardcast',
    );

    return [rementries, rdRemEntries, dmRemEntries, envEntries, mistyPeaksentries, efentries];
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
