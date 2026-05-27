import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import Haste from 'parser/shared/modules/Haste';
import {
  getCurrentCelestialTalent,
  getCurrentRSKTalent,
  SECRET_INFUSION_INCREASE_PER_RANK,
  SPELL_COLORS,
  THUNDER_FOCUS_TEA_SPELLS,
} from '../../constants';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { qualitativePerformanceToColor } from 'interface/guide';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { numberToQualitativePerformance } from 'common/combineQualitativePerformances';
import { Talent } from 'common/TALENTS/types';
import type Spell from 'common/SPELLS/Spell';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import { SpellSequence, type CastInSequence } from 'interface/guide/components/CastSequence';

interface TftWindow {
  timestamp: number;
  performance: QualitativePerformance;
  summary: JSX.Element;
  sequence: CastInSequence[];
}

class ThunderFocusTea extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

  protected haste!: Haste;

  private tftWindows: TftWindow[] = [];
  private castsBySpell = new Map<number, number>();

  private castsTft = 0;
  private ftActive = false;
  private currentRskTalent: Talent;
  private currentCelestial: Talent;
  private spellPriorities!: [Spell, number][];

  private ftFirstCharge: { spellId: number; timestamp: number } | null = null;

  private currentWindowStart = 0;
  private openWindowSequence: CastInSequence[] = [];
  private windowOpen = false;

  constructor(options: Options) {
    super(options);
    this.haste = options.haste as Haste;
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT);

    const secretInfusionRank = this.selectedCombatant.getTalentRank(
      TALENTS_MONK.SECRET_INFUSION_TALENT,
    );
    this.haste.addHasteBuff(
      SPELLS.SECRET_INFUSION_HASTE_BUFF.id,
      SECRET_INFUSION_INCREASE_PER_RANK * secretInfusionRank,
    );

    this.ftActive = this.selectedCombatant.hasTalent(TALENTS_MONK.FOCUSED_THUNDER_TALENT);
    this.currentCelestial = getCurrentCelestialTalent(this.selectedCombatant);
    this.currentRskTalent = getCurrentRSKTalent(this.selectedCombatant);

    this.spellPriorities =
      this.currentCelestial === TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT
        ? [
            [this.currentRskTalent, 3],
            [TALENTS_MONK.ENVELOPING_MIST_TALENT, 1],
            [SPELLS.RENEWING_MIST_CAST, 0],
          ]
        : [
            [SPELLS.RENEWING_MIST_CAST, 3],
            [this.currentRskTalent, 2],
            [TALENTS_MONK.ENVELOPING_MIST_TALENT, 0],
          ];

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT),
      this.tftCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT),
      this.onTftApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT),
      this.onTftRemove,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onAnyCast);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(THUNDER_FOCUS_TEA_SPELLS),
      this.buffedCast,
    );
  }

  private tftCast(event: CastEvent) {
    this.castsTft += this.ftActive ? 2 : 1;
    this.currentWindowStart = event.timestamp;
  }

  private onTftApply(_event: ApplyBuffEvent) {
    this.windowOpen = true;
    this.openWindowSequence = [];
  }

  private onTftRemove(_event: RemoveBuffEvent) {
    this.windowOpen = false;
    this.openWindowSequence = [];
    this.ftFirstCharge = null;
  }

  private onAnyCast(event: CastEvent) {
    if (!this.windowOpen || event.ability.guid <= 1) return;

    const cast = this.toCastInSequence(event);
    if (event.ability.guid === TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id) {
      cast.ghosted = false;
    }
    this.openWindowSequence.push(cast);
  }

  private markConsumer(timestamp: number, spellId: number, color: string) {
    const seqEntry = this.openWindowSequence.find(
      (c) => c.timestamp === timestamp && c.spellId === spellId,
    );
    if (seqEntry) {
      seqEntry.outlineColor = color;
      seqEntry.ghosted = false;
    }
  }

  private trackSpellCount(spellId: number) {
    this.castsBySpell.set(spellId, (this.castsBySpell.get(spellId) ?? 0) + 1);
  }

  private toCastInSequence(event: CastEvent): CastInSequence {
    return {
      timestamp: event.timestamp,
      spellId: event.ability.guid,
      spellName: event.ability.name,
      icon: event.ability.abilityIcon.replace('.jpg', ''),
      ghosted: true,
    };
  }

  private spellScore(spellId: number): number {
    return this.spellPriorities.find(([spell]) => spell.id === spellId)?.[1] ?? 0;
  }

  private scoreWindow(
    firstSpellId: number,
    secondSpellId: number | null,
  ): { performance: QualitativePerformance; summary: JSX.Element } {
    const performance = this.computePerformance(firstSpellId, secondSpellId);

    return {
      performance,
      summary: (
        <>
          {performance as string}: <SpellLink spell={firstSpellId} />
          {secondSpellId !== null && (
            <>
              {' '}
              / <SpellLink spell={secondSpellId} />
            </>
          )}
        </>
      ),
    };
  }

  private computePerformance(
    firstSpellId: number,
    secondSpellId: number | null,
  ): QualitativePerformance {
    const isYulon = this.currentCelestial === TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT;

    if (!isYulon || !this.ftActive || secondSpellId === null) {
      // 2x weight to first empower due to secret infusion only buffing the first
      const score =
        secondSpellId !== null
          ? Math.round((2 * this.spellScore(firstSpellId) + this.spellScore(secondSpellId)) / 3)
          : this.spellScore(firstSpellId);
      return numberToQualitativePerformance(score);
    }

    // just scoring yu'lon focused thunder as rem first only -
    // losing SI's haste buff on the first empower is too costly
    if (firstSpellId !== SPELLS.RENEWING_MIST_CAST.id) {
      return QualitativePerformance.Fail;
    }
    if (secondSpellId === SPELLS.RENEWING_MIST_CAST.id) {
      return QualitativePerformance.Perfect;
    }
    if (secondSpellId === this.currentRskTalent.id) {
      return QualitativePerformance.Good;
    }
    if (secondSpellId === TALENTS_MONK.ENVELOPING_MIST_TALENT.id) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }

  private buffedCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id)) return;

    const spellId = event.ability.guid;

    this.trackSpellCount(spellId);

    if (this.ftActive) {
      if (this.ftFirstCharge === null) {
        this.ftFirstCharge = { spellId, timestamp: event.timestamp };
        return;
      }
      const { spellId: firstSpellId, timestamp: firstTimestamp } = this.ftFirstCharge;
      this.ftFirstCharge = null;
      this.commitWindow(firstSpellId, spellId, firstTimestamp, event.timestamp);
      return;
    }

    this.commitWindow(spellId, null, null, event.timestamp);
  }

  private commitWindow(
    firstSpellId: number,
    secondSpellId: number | null,
    firstTimestamp: number | null,
    secondTimestamp: number,
  ) {
    const { performance, summary } = this.scoreWindow(firstSpellId, secondSpellId);
    const color = qualitativePerformanceToColor(performance);
    if (firstTimestamp !== null) {
      this.markConsumer(firstTimestamp, firstSpellId, color);
    }
    this.markConsumer(secondTimestamp, secondSpellId ?? firstSpellId, color);
    this.tftWindows.push({
      timestamp: this.currentWindowStart,
      performance,
      summary,
      sequence: [...this.openWindowSequence],
    });
  }

  private buildCastDetails(): PerCastData[] {
    return this.tftWindows.map((window) => ({
      performance: window.performance,
      timestamp: this.owner.formatTimestamp(window.timestamp),
      stats: [],
      tooltip: window.summary,
      additionalContent: {
        content: <SpellSequence casts={window.sequence} iconSize={34} />,
      },
      details: window.summary,
    }));
  }

  renderCastRatioChart() {
    const count = (id: number) => this.castsBySpell.get(id) ?? 0;
    const items = [
      {
        color: SPELL_COLORS.RENEWING_MIST,
        label: SPELLS.RENEWING_MIST_CAST.name,
        spellId: SPELLS.RENEWING_MIST_CAST.id,
        value: count(SPELLS.RENEWING_MIST_CAST.id),
      },
      {
        color: SPELL_COLORS.ENVELOPING_MIST,
        label: TALENTS_MONK.ENVELOPING_MIST_TALENT.name,
        spellId: TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
        value: count(TALENTS_MONK.ENVELOPING_MIST_TALENT.id),
      },
      {
        color: SPELL_COLORS.RISING_SUN_KICK,
        label: this.currentRskTalent.name,
        spellId: this.currentRskTalent.id,
        value: count(this.currentRskTalent.id),
      },
    ];
    return <DonutChart items={items} />;
  }

  private perfBadge(perf: QualitativePerformance): JSX.Element {
    return (
      <span>
        (<span style={{ color: qualitativePerformanceToColor(perf) }}>{perf}</span>)
      </span>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} />
          </b>{' '}
          is an important spell used to empower other abilities. It should be used on cooldown at
          all times and the spell that you use it on depends on your talent selection. Try to adhere
          to the following priority list with <SpellLink spell={this.currentCelestial} />:
        </p>
        <ul style={{ marginBottom: '1em' }}>
          {this.spellPriorities.map(([spell, score], i) => (
            <li key={i}>
              <SpellLink spell={spell} /> {this.perfBadge(numberToQualitativePerformance(score))}
            </li>
          ))}
        </ul>
        {this.ftActive && (
          <p>
            With <SpellLink spell={TALENTS_MONK.FOCUSED_THUNDER_TALENT} />, the second empower
            carries slightly less weight as{' '}
            <SpellLink spell={TALENTS_MONK.SECRET_INFUSION_TALENT} /> only changes the secondary
            stat buff gain on the first empower.
          </p>
        )}
      </>
    );
    const data = (
      <RoundedPanel>
        <strong>
          <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> cast efficiency
        </strong>
        {this.subStatistic()}
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <CastDetail title="Empowered Spells" casts={this.buildCastDetails()} />
        </div>
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        useThresholds
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(23)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> usage
          </label>
          {this.renderCastRatioChart()}
        </div>
      </Statistic>
    );
  }
}

export default ThunderFocusTea;
