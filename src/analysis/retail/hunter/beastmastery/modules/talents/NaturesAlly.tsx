import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import BuffStackTracker from 'parser/shared/modules/BuffStackTracker';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { PerformanceBoxRow, BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { BadColor, GoodColor, OkColor } from 'interface/guide';
import SpellUsable from '../core/SpellUsable';
import { HOWL_BUFFS } from '../../constants';
import Spell from 'common/SPELLS/Spell';

/** ~2 GCDs: if BW is this close, spending BS charges is correct even if it overwrites Nature's Ally. */
const BW_IMMINENT_WINDOW_MS = 3000;

class NaturesAlly extends BuffStackTracker {
  static dependencies = {
    ...BuffStackTracker.dependencies,
    spellUsable: SpellUsable,
  };

  static trackedBuff = SPELLS.NATURES_ALLY_BUFF;

  kcUnbuffedCount = 0;
  killCommandCasts = 0;
  builderOverwriteCount = 0;
  builderCastCount = 0;
  killCommandEntries: BoxRowEntry[] = [];
  builderCastEntries: BoxRowEntry[] = [];
  naturesAllySpells: Spell[] = [];

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.NATURES_ALLY_1_BEAST_MASTERY_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT),
      this.onKillCommandCast,
    );

    if (this.selectedCombatant.hasTalent(TALENTS.COBRA_SHOT_TALENT)) {
      this.naturesAllySpells.push(TALENTS.COBRA_SHOT_TALENT);
    }
    if (this.selectedCombatant.hasTalent(TALENTS.BARBED_SHOT_TALENT)) {
      this.naturesAllySpells.push(TALENTS.BARBED_SHOT_TALENT);
    }
    if (this.selectedCombatant.hasTalent(TALENTS.BLACK_ARROW_BEAST_MASTERY_TALENT)) {
      this.naturesAllySpells.push(TALENTS.BLACK_ARROW_BEAST_MASTERY_TALENT);
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this.naturesAllySpells),
      this.onBuilderCast,
    );
  }

  private buildTooltip(
    event: CastEvent,
    heading: string,
    color: string,
    subtext: string | undefined = undefined,
  ) {
    const targetName = this.owner.getTargetName(event);
    return (
      <div>
        <h5 style={{ color }}>{heading}</h5>
        {subtext !== undefined && <small>{subtext}</small>}
        <p />
        <strong>{this.owner.formatTimestamp(event.timestamp)}</strong> targeting{' '}
        <strong>{targetName || 'unknown'}</strong>
      </div>
    );
  }

  private onBuilderCast(event: CastEvent) {
    this.builderCastCount += 1;

    if (!this.buffActive) {
      this.builderCastEntries.push({
        value: QualitativePerformance.Good,
        tooltip: this.buildTooltip(
          event,
          `${event.ability.name} cast without Nature's Ally active.`,
          GoodColor,
        ),
      });
      return;
    }

    const kcOnCooldown = this.spellUsable.isOnCooldown(
      TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id,
    );
    const bwAvailable = !this.spellUsable.isOnCooldown(TALENTS.BESTIAL_WRATH_TALENT.id);
    const bwImminent =
      bwAvailable ||
      this.spellUsable.cooldownRemaining(TALENTS.BESTIAL_WRATH_TALENT.id) < BW_IMMINENT_WINDOW_MS;

    if (kcOnCooldown || bwImminent) {
      this.builderCastEntries.push({
        value: QualitativePerformance.Ok,
        tooltip: this.buildTooltip(
          event,
          `${event.ability.name} reapplied Nature's Ally`,
          OkColor,
          bwImminent ? 'Spending charges before Bestial Wrath.' : 'Kill Command on cooldown',
        ),
      });
      return;
    }

    this.builderOverwriteCount += 1;
    addInefficientCastReason(
      event,
      "Overwrote Nature's Ally while Kill Command was available. Spend the buff first.",
    );

    this.builderCastEntries.push({
      value: QualitativePerformance.Fail,
      tooltip: this.buildTooltip(
        event,
        `${event.ability.name} overwrote Nature's Ally.`,
        BadColor,
        'Kill Command was available',
      ),
    });
  }

  private onKillCommandCast(event: CastEvent) {
    this.killCommandCasts += 1;

    const hasHowlBuff = HOWL_BUFFS.some((spell) =>
      this.selectedCombatant.hasBuff(spell.id, event.timestamp),
    );

    let value: QualitativePerformance;
    let header: string;
    let color: string;

    if (this.buffActive) {
      value = QualitativePerformance.Good;
      header = "Kill Command cast with Nature's Ally active.";
      color = GoodColor;
    } else if (hasHowlBuff) {
      value = QualitativePerformance.Good;
      header = 'Kill Command cast with Howl of the Pack Leader active.';
      color = GoodColor;
    } else {
      value = QualitativePerformance.Fail;
      header = "Kill Command cast without Nature's Ally.";
      color = BadColor;
      this.kcUnbuffedCount += 1;
      addInefficientCastReason(event, "Kill Command cast without Nature's Ally active.");
    }

    const tooltip = this.buildTooltip(
      event,
      header,
      color,
      hasHowlBuff ? 'Howl of the Pack Leader buff active' : undefined,
    );

    this.killCommandEntries.push({ value, tooltip });
  }

  get guideSubsectionKillCommand() {
    const explanation = (
      <>
        <p>
          Always have <SpellLink spell={SPELLS.NATURES_ALLY_BUFF} /> active before casting{' '}
          <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} />.
        </p>
      </>
    );

    const data =
      this.killCommandEntries.length === 0 ? (
        <p>No Kill Command casts recorded.</p>
      ) : (
        <PerformanceBoxRow values={this.killCommandEntries} />
      );

    return explanationAndDataSubsection(explanation, data);
  }

  get guideSubsectionBuilderCasts() {
    const explanation = (
      <>
        <p>
          Avoid casting builders when <SpellLink spell={SPELLS.NATURES_ALLY_BUFF} /> is already
          active and <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} /> is available.
          Consume the buff first.
        </p>
      </>
    );

    const data =
      this.builderCastEntries.length === 0 ? (
        <p>No builder casts recorded.</p>
      ) : (
        <CastSummaryAndBreakdown
          spell={SPELLS.NATURES_ALLY_BUFF}
          castEntries={this.builderCastEntries}
          goodExtraExplanation="cast without Nature's Ally active"
          okExtraExplanation="acceptable — Bestial Wrath imminent or Kill Command on cooldown"
          badExtraExplanation={
            <>
              overwrote <SpellLink spell={SPELLS.NATURES_ALLY_BUFF} /> while Kill Command was
              available
            </>
          }
          includeBadCastPercentage
          usesInsteadOfCasts
        />
      );

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          (this.kcUnbuffedCount > 0 || this.builderOverwriteCount > 0) && (
            <>
              {this.kcUnbuffedCount > 0 && (
                <>Kill Command cast without Nature's Ally active {this.kcUnbuffedCount} time(s).</>
              )}
              {this.kcUnbuffedCount > 0 && this.builderOverwriteCount > 0 && <p />}
              {this.builderOverwriteCount > 0 && (
                <>
                  Nature's Ally overwritten while Kill Command was available{' '}
                  {this.builderOverwriteCount} time(s).
                </>
              )}
            </>
          )
        }
      >
        <BoringValueText label={<SpellLink spell={SPELLS.NATURES_ALLY_BUFF} />}>
          <>
            {this.killCommandCasts > 0 && (
              <>
                {this.kcUnbuffedCount} / {this.killCommandCasts}{' '}
                <small>Kill Commands without buff</small>
              </>
            )}
            {this.killCommandCasts > 0 && this.builderCastCount > 0 && <p />}
            {this.builderCastCount > 0 && (
              <>
                {this.builderOverwriteCount} / {this.builderCastCount}{' '}
                <small>builder overwrites</small>
              </>
            )}
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default NaturesAlly;
