import type { JSX } from 'react';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeaconHealEvent, CastEvent, GetRelatedEvent } from 'parser/core/Events';
import { formatNumber, formatPercentage } from 'common/format';
import Combatants from 'parser/shared/modules/Combatants';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import TALENTS from 'common/TALENTS/paladin';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import SpellLink from 'interface/SpellLink';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastDetail, {
  type PerCastData,
  type PerCastStat,
} from 'interface/guide/components/CastDetail';
import { SpellSequence, type CastInSequence } from 'interface/guide/components/CastSequence';
import { PerformanceMark, qualitativePerformanceToColor } from 'interface/guide';
import { TipBox } from 'interface/guide/components';
import {
  QualitativePerformance,
  evaluateQualitativePerformanceByThreshold,
} from 'parser/ui/QualitativePerformance';
import { isMythicPlus } from 'common/isMythicPlus';
import {
  numberToQualitativePerformance,
  qualitativePerformanceToNumber,
} from 'common/combineQualitativePerformances';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';
import { getWordofGlorySpell } from 'analysis/retail/paladin/shared/constants';
import SPELLS from 'common/SPELLS';
import {
  BEACON_OF_VIRTUE_DURATION,
  BEACON_OF_VIRTUE_PRECAST_BUFFER_MS,
  LIGHTS_PROTECTION_DAMAGE_REDUCTION,
} from '../../constants';
import { INFUSION_OF_LIGHT_CONSUME } from '../../normalizers/EventLinks/EventLinkConstants';

const HIGHLIGHT_COLOR = qualitativePerformanceToColor(QualitativePerformance.Good);
const ACTIVE_TIME_THRESHOLDS = { perfect: 1, good: 0.75, ok: 0.5 };

interface VirtueWindow {
  start: number;
  end: number;
  sequence: CastInSequence[];
  infusedFlashes: number;
  infusedFlashesOnBeacons: number;
  divineToll: boolean;
  auraMastery: boolean;
  beaconHealing: number;
}

class BeaconOfVirtue extends Analyzer.withDependencies({
  combatants: Combatants,
  alwaysBeCasting: AlwaysBeCasting,
}) {
  private windows: VirtueWindow[] = [];
  private currentWindow: VirtueWindow | null = null;
  private lastHolyLightCast: CastEvent | null = null;
  // m+ doesn't really want to combine cds
  private expectsRaidCooldowns: boolean;
  private hasMomentOfCompassion: boolean;
  private hasRingingOfTheHeavens: boolean;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BEACON_OF_VIRTUE_TALENT);
    this.expectsRaidCooldowns = !isMythicPlus(this.owner.fight);
    this.hasMomentOfCompassion = this.selectedCombatant.hasTalent(
      TALENTS.MOMENT_OF_COMPASSION_TALENT,
    );
    this.hasRingingOfTheHeavens = this.selectedCombatant.hasTalent(
      TALENTS.RINGING_OF_THE_HEAVENS_TALENT,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.BEACON_OF_VIRTUE_TALENT),
      this.onVirtueCast,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onAnyCast);
    this.addEventListener(Events.beacontransfer.by(SELECTED_PLAYER), this.onBeaconTransfer);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private onVirtueCast(event: CastEvent) {
    this.closeWindow(event.timestamp);
    this.currentWindow = {
      start: event.timestamp,
      end: event.timestamp + BEACON_OF_VIRTUE_DURATION,
      sequence: [],
      infusedFlashes: 0,
      infusedFlashesOnBeacons: 0,
      divineToll: false,
      auraMastery: false,
      beaconHealing: 0,
    };

    const holyLight = this.lastHolyLightCast;
    if (holyLight && event.timestamp - holyLight.timestamp <= BEACON_OF_VIRTUE_PRECAST_BUFFER_MS) {
      this.currentWindow.sequence.push(this.toCastInSequence(holyLight, true));
    }
  }

  private onAnyCast(event: CastEvent) {
    if (event.ability.guid === SPELLS.HOLY_LIGHT.id) {
      this.lastHolyLightCast = event;
    }
    if (this.currentWindow && event.timestamp > this.currentWindow.end) {
      this.closeWindow(this.currentWindow.end);
    }
    // reclamation makes fake cast events, ignore them
    if (
      !this.currentWindow ||
      event.ability.guid <= 1 ||
      event.ability.guid === SPELLS.RECLAMATION_CAST.id
    ) {
      return;
    }
    this.currentWindow.sequence.push(
      this.toCastInSequence(event, this.trackKeyCast(this.currentWindow, event)),
    );
  }

  private trackKeyCast(window: VirtueWindow, event: CastEvent): boolean {
    const spellId = event.ability.guid;
    if (spellId === TALENTS.DIVINE_TOLL_TALENT.id) {
      window.divineToll = true;
      return true;
    }
    if (spellId === TALENTS.AURA_MASTERY_TALENT.id) {
      window.auraMastery = true;
      return this.hasRingingOfTheHeavens;
    }
    if (
      spellId === SPELLS.FLASH_OF_LIGHT.id &&
      GetRelatedEvent(event, INFUSION_OF_LIGHT_CONSUME) !== undefined
    ) {
      window.infusedFlashes += 1;
      if (this.isOnBeacon(event)) {
        window.infusedFlashesOnBeacons += 1;
        return true;
      }
      // without moment of compassion the target doesn't matter
      return !this.hasMomentOfCompassion;
    }
    return false;
  }

  private isOnBeacon(event: CastEvent): boolean {
    const target = this.deps.combatants.getEntity(event);
    if (!target) {
      return false;
    }
    return (
      target.hasBuff(
        TALENTS.BEACON_OF_VIRTUE_TALENT.id,
        event.timestamp,
        0,
        0,
        this.selectedCombatant.id,
      ) || target.hasBuff(SPELLS.BEACON_OF_THE_SAVIOR_BUFF.id, event.timestamp)
    );
  }

  private toCastInSequence(event: CastEvent, highlighted: boolean): CastInSequence {
    return {
      timestamp: event.timestamp,
      spellId: event.ability.guid,
      spellName: event.ability.name,
      icon: event.ability.abilityIcon.replace('.jpg', ''),
      outlineColor: highlighted ? HIGHLIGHT_COLOR : undefined,
    };
  }

  private onBeaconTransfer(event: BeaconHealEvent) {
    if (!this.currentWindow || event.timestamp > this.currentWindow.end) {
      return;
    }
    this.currentWindow.beaconHealing += event.amount + (event.absorbed || 0);
  }

  private onFightEnd() {
    this.closeWindow(this.owner.fight.end_time);
  }

  private closeWindow(timestamp: number) {
    if (!this.currentWindow) {
      return;
    }
    this.currentWindow.end = Math.min(this.currentWindow.end, timestamp);
    this.windows.push(this.currentWindow);
    this.currentWindow = null;
  }

  private usedRaidCooldown(window: VirtueWindow) {
    return (
      this.expectsRaidCooldowns &&
      (window.divineToll || (this.hasRingingOfTheHeavens && window.auraMastery))
    );
  }

  // graded on the stat only, it doesn't feed into the window rating
  private infusedFlashesPerformance(
    window: VirtueWindow,
  ): Pick<PerCastStat, 'performance' | 'ungraded'> {
    if (!this.hasMomentOfCompassion || window.infusedFlashes === 0) {
      return { ungraded: true };
    }
    const onBeaconRatio = window.infusedFlashesOnBeacons / window.infusedFlashes;
    if (onBeaconRatio === 1) {
      return { performance: QualitativePerformance.Perfect };
    }
    if (onBeaconRatio >= 0.5) {
      return { performance: QualitativePerformance.Good };
    }
    return { performance: QualitativePerformance.Ok };
  }

  // only standout windows are graded, the rest are neutral
  private activeTimePercentage(window: VirtueWindow) {
    return this.deps.alwaysBeCasting.getActiveTimePercentageInWindow(window.start, window.end);
  }

  private activeTimePerformance(window: VirtueWindow) {
    return evaluateQualitativePerformanceByThreshold({
      actual: this.activeTimePercentage(window),
      isGreaterThanOrEqual: ACTIVE_TIME_THRESHOLDS,
    });
  }

  // graded on how busy the window was, bumped up a tier when a raid cooldown was used inside it
  private windowPerformance(window: VirtueWindow) {
    const activeTimePerformance = this.activeTimePerformance(window);
    if (!this.usedRaidCooldown(window)) {
      return activeTimePerformance;
    }
    const bumped = qualitativePerformanceToNumber(activeTimePerformance) + 1;
    return numberToQualitativePerformance(
      Math.min(bumped, qualitativePerformanceToNumber(QualitativePerformance.Perfect)),
    );
  }

  // some stats are ungraded for visuals
  private yesNoStat(label: string, used: boolean, graded: boolean): PerCastStat {
    if (!graded) {
      return { value: used ? 'Yes' : 'No', label, ungraded: true };
    }
    return used
      ? { value: 'Yes', label, performance: QualitativePerformance.Perfect }
      : { value: 'No', label, performance: QualitativePerformance.Ok };
  }

  private buildStats(window: VirtueWindow): PerCastStat[] {
    const infusedStat: PerCastStat = {
      value: this.hasMomentOfCompassion
        ? `${window.infusedFlashesOnBeacons}/${window.infusedFlashes}`
        : window.infusedFlashes,
      label: this.hasMomentOfCompassion ? 'Infused FoL On Beacons' : 'Infused FoL',
      ...this.infusedFlashesPerformance(window),
    };
    const castsStat: PerCastStat = {
      value: window.sequence.length,
      label: 'Casts',
      ungraded: true,
    };
    const activeTimeStat: PerCastStat = {
      value: `${formatPercentage(this.activeTimePercentage(window), 0)}%`,
      label: 'Active Time',
      tooltip: 'How much of the window you spent casting or on the global cooldown.',
      performance: this.activeTimePerformance(window),
    };
    const beaconHealingStat: PerCastStat = {
      value: formatNumber(window.beaconHealing),
      label: 'Beacon Healing',
      tooltip: 'Healing transferred to your beacon targets during this window.',
      ungraded: true,
    };

    // casts / beacon healing / divine toll
    // active time / infused fol / aura mastery
    // wanted each column to be relevant to each other
    // 2 related items next to each other would overflow
    return [
      castsStat,
      beaconHealingStat,
      this.yesNoStat('Divine Toll', window.divineToll, this.expectsRaidCooldowns),
      activeTimeStat,
      infusedStat,
      this.yesNoStat(
        'Aura Mastery',
        window.auraMastery,
        this.expectsRaidCooldowns && this.hasRingingOfTheHeavens,
      ),
    ];
  }

  private buildCastDetails(): PerCastData[] {
    return this.windows.map((window) => ({
      performance: this.windowPerformance(window),
      timestamp: this.owner.formatTimestamp(window.start),
      stats: this.buildStats(window),
      additionalContent: {
        content: <SpellSequence casts={window.sequence} iconSize={34} />,
      },
    }));
  }

  private get legend() {
    const pct = (value: number) => `${formatPercentage(value, 0)}%`;
    return (
      <TipBox hideIcon>
        <div>
          <PerformanceMark perf={QualitativePerformance.Perfect} /> Perfect - at least{' '}
          {pct(ACTIVE_TIME_THRESHOLDS.perfect)} active time
        </div>
        <div>
          <PerformanceMark perf={QualitativePerformance.Good} /> Good - at least{' '}
          {pct(ACTIVE_TIME_THRESHOLDS.good)} active time
        </div>
        <div>
          <PerformanceMark perf={QualitativePerformance.Ok} /> Ok - at least{' '}
          {pct(ACTIVE_TIME_THRESHOLDS.ok)} active time
        </div>
        <div>
          <PerformanceMark perf={QualitativePerformance.Fail} /> Fail - under{' '}
          {pct(ACTIVE_TIME_THRESHOLDS.ok)} active time
        </div>
        {this.expectsRaidCooldowns && (
          <div>
            <hr style={{ margin: '6px 0' }} />
            Casting <SpellLink spell={TALENTS.DIVINE_TOLL_TALENT} />
            {this.hasRingingOfTheHeavens && (
              <>
                {' '}
                or <SpellLink spell={TALENTS.AURA_MASTERY_TALENT} />
              </>
            )}{' '}
            inside the window raises its grade by one tier.
          </div>
        )}
      </TipBox>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={TALENTS.BEACON_OF_VIRTUE_TALENT} />
          </b>{' '}
          is your burst AoE tool. Use it close to on cooldown, but its high mana cost means it's
          best saved for when the group needs significant healing. During each window:
        </p>
        <ul>
          <li>
            Prefer <SpellLink spell={getWordofGlorySpell(this.selectedCombatant)} /> over{' '}
            <SpellLink spell={SPELLS.LIGHT_OF_DAWN_HEAL} />, as it transfers more healing to your
            beacons.
          </li>
          {this.expectsRaidCooldowns ? (
            <li>
              Line up <SpellLink spell={TALENTS.DIVINE_TOLL_TALENT} />
              {this.selectedCombatant.hasTalent(TALENTS.DIVINE_FAVOR_TALENT) && (
                <>
                  , <SpellLink spell={TALENTS.DIVINE_FAVOR_TALENT} />
                </>
              )}
              {this.hasRingingOfTheHeavens && (
                <>
                  {' '}
                  and <SpellLink spell={TALENTS.AURA_MASTERY_TALENT} /> (with{' '}
                  <SpellLink spell={TALENTS.RINGING_OF_THE_HEAVENS_TALENT} />)
                </>
              )}{' '}
              with the window.
            </li>
          ) : (
            <li>
              In Mythic+, stacking your cooldowns into every window is usually overkill, so you can
              spread them out instead.
            </li>
          )}
          {this.hasMomentOfCompassion && (
            <li>
              With <SpellLink spell={TALENTS.MOMENT_OF_COMPASSION_TALENT} />, infused{' '}
              <SpellLink spell={SPELLS.FLASH_OF_LIGHT} /> on targets holding{' '}
              <SpellLink spell={TALENTS.BEACON_OF_VIRTUE_TALENT} /> or{' '}
              <SpellLink spell={SPELLS.BEACON_OF_THE_SAVIOR_BUFF} /> are your strongest casts.
            </li>
          )}
          {this.selectedCombatant.hasTalent(TALENTS.HAMMER_AND_ANVIL_TALENT) &&
            this.selectedCombatant.hasTalent(TALENTS.AWAKENING_TALENT) && (
              <li>
                As Lightsmith, cast it before the <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} />{' '}
                that consumes <SpellLink spell={TALENTS.AWAKENING_TALENT} /> so the guaranteed{' '}
                <SpellLink spell={TALENTS.HAMMER_AND_ANVIL_TALENT} /> proc lands inside it.
              </li>
            )}
          {this.selectedCombatant.hasTalent(TALENTS.LIGHTS_PROTECTION_TALENT) && (
            <li>
              <SpellLink spell={TALENTS.LIGHTS_PROTECTION_TALENT} /> also gives your beacon targets{' '}
              {LIGHTS_PROTECTION_DAMAGE_REDUCTION * 100}% damage reduction.
            </li>
          )}
          <li>
            Queueing it at the end of a <SpellLink spell={SPELLS.HOLY_LIGHT} /> lets that cast
            transfer too and guarantees an <SpellLink spell={SPELLS.INFUSION_OF_LIGHT} /> proc for
            the window. It's very mana-heavy, so use it sparingly in raids, and it often fails when
            the <SpellLink spell={SPELLS.HOLY_LIGHT} /> is on yourself.
          </li>
        </ul>
        {this.legend}
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS.BEACON_OF_VIRTUE_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <CastDetail title="Casts During Beacon of Virtue" casts={this.buildCastDetails()} />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spell={TALENTS.BEACON_OF_VIRTUE_TALENT}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default BeaconOfVirtue;
