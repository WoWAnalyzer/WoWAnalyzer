import { formatNumber, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { Talent } from 'common/TALENTS/types';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink, Tooltip, TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { SPELL_COLORS } from '../../constants';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { getLowestPerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import SpellUsable from 'parser/shared/modules/SpellUsable';

interface RevivalCastTracker {
  timeStamp: number; // time of cast
  celestialOnCd: boolean;
}

class Revival extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  castTracker: RevivalCastTracker[] = [];

  activeTalent!: Talent;
  revivalDirectHealing = 0;
  revivalDirectOverHealing = 0;
  upliftedSpiritsActive = false;
  usHealing = 0;
  usOverhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_MONK.RESTORAL_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_MONK.REVIVAL_TALENT);

    if (!this.active) {
      return;
    }
    this.upliftedSpiritsActive = this.selectedCombatant.hasTalent(
      TALENTS_MONK.UPLIFTED_SPIRITS_TALENT,
    );
    this.activeTalent = this.getRevivalTalent();
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([TALENTS_MONK.REVIVAL_TALENT, TALENTS_MONK.RESTORAL_TALENT]),
      this.handleCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.REVIVAL_TALENT),
      this.handleRevivalDirect,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.RESTORAL_TALENT),
      this.handleRevivalDirect,
    );

    if (this.upliftedSpiritsActive) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.UPLIFTED_SPIRITS_HEAL),
        this.handleUsHeal,
      );
    }
  }

  getRevivalTalent() {
    return this.selectedCombatant.hasTalent(TALENTS_MONK.RESTORAL_TALENT)
      ? TALENTS_MONK.RESTORAL_TALENT
      : TALENTS_MONK.REVIVAL_TALENT;
  }

  getCelestialTalent(): Talent {
    return this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT)
      ? TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT
      : TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT;
  }

  handleCast(event: CastEvent) {
    this.castTracker.push({
      timeStamp: event.timestamp,
      celestialOnCd: this.spellUsable.isOnCooldown(this.getCelestialTalent().id),
    });
  }

  handleRevivalDirect(event: HealEvent) {
    this.revivalDirectHealing += event.amount + (event.absorbed || 0);
    this.revivalDirectOverHealing += event.overheal || 0;
  }

  handleUsHeal(event: HealEvent) {
    this.usHealing += event.amount + (event.absorbed || 0);
    this.usOverhealing += event.overheal || 0;
  }

  get avgHealingPerCast() {
    return this.revivalDirectHealing / this.castTracker.length;
  }

  get avgRawPerCast() {
    return (
      (this.revivalDirectHealing + this.revivalDirectOverHealing + this.usOverhealing) /
      this.castTracker.length
    );
  }

  get guideCastBreakdown() {
    const explanationPercent = 55;
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={this.getRevivalTalent()} />
        </strong>{' '}
        is a fairly straightforward cooldown that should be used to heal burst damage events with a
      </p>
    );
    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.castTracker.map((cast, idx) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timeStamp)} &mdash;{' '}
              <SpellLink spell={this.getRevivalTalent()} />
            </>
          );
          const checklistItems: CooldownExpandableItem[] = [];
          const allPerfs: QualitativePerformance[] = [];
          const averagePerf = getLowestPerf(allPerfs);
          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={averagePerf}
              key={idx}
            />
          );
        })}
      </div>
    );
    return explanationAndDataSubsection(explanation, data, explanationPercent);
  }
}

export default Revival;
