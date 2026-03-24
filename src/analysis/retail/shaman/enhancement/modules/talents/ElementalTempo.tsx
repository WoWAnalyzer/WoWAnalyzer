import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'analysis/retail/shaman/enhancement/modules/core/SpellUsable';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES, { getResourceCost } from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { formatDurationMillisMinSec, formatPercentage } from 'common/format';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { MAELSTROM_WEAPON_ELIGIBLE_SPELLS } from '../../constants';

const CDR_MS_PER_STACK = 300;

type ElementalTempCast = {
  totalMs: number;
  effectiveMs: number;
  wastedMs: number;
};

type CastCdrBreakdown = {
  timestamp: number;
  spenderSpellId: number;
  stacksSpent: number;
  isAscendanceActive: boolean;
  stormstrike: ElementalTempCast;
  lavaLash: ElementalTempCast;
  wastedPercent: number;
  performance: QualitativePerformance;
};

class ElementalTempo extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
  abilities: Abilities,
}) {
  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  private castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_TEMPO_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(MAELSTROM_WEAPON_ELIGIBLE_SPELLS),
      this.onMaelstromSpenderCast,
    );
  }

  /**
   * SpellUsable tracks cooldowns in wall-clock time, but its time-based cooldown reduction API
   * expects *unscaled* milliseconds (i.e. scaled by the spell's current cooldown recovery rate / modRate).
   *
   * Elemental Tempo's tooltip is expressed in wall-clock seconds (e.g. 8 stacks => 2.4s),
   * so we convert wall-clock reductions to unscaled before applying them, then convert the
   * effective reduction back to wall-clock for waste calculations.
   */
  private getSpellModRate(spellId: number): number {
    const ability = this.deps.abilities.getAbility(spellId);
    const canonicalId = ability ? ability.primarySpell : spellId;

    const unscaledCooldown = this.deps.abilities.getExpectedCooldownDuration(canonicalId);
    const scaledCooldown = this.deps.spellUsable.fullCooldownDuration(canonicalId);

    if (!unscaledCooldown || !scaledCooldown) {
      return 1;
    }

    return unscaledCooldown / scaledCooldown;
  }

  private calculateCdrWasteForSpell(spellId: number, cooldownReduction: number): ElementalTempCast {
    const modRate = this.getSpellModRate(spellId);
    const effectiveCdr =
      this.deps.spellUsable.reduceCooldown(spellId, cooldownReduction * modRate) / modRate;
    const wastedCdr = Math.max(0, cooldownReduction - effectiveCdr);

    return {
      totalMs: cooldownReduction,
      effectiveMs: effectiveCdr,
      wastedMs: wastedCdr,
    };
  }

  private onMaelstromSpenderCast(event: CastEvent) {
    const stacksSpent = getResourceCost(event.resourceCost, RESOURCE_TYPES.MAELSTROM_WEAPON.id);
    if (!stacksSpent || stacksSpent <= 0) {
      return;
    }

    // Elemental Tempo: 300ms per MSW stack, expressed in wall-clock time.
    const cooldownReduction = stacksSpent * CDR_MS_PER_STACK;

    const hasThorims = this.selectedCombatant.hasTalent(TALENTS.THORIMS_INVOCATION_TALENT);
    const isInDoomWinds = this.selectedCombatant.hasBuff(SPELLS.DOOM_WINDS_BUFF, event.timestamp);
    const isAscendanceActive = this.selectedCombatant.hasBuff(
      TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id,
      event.timestamp,
    );
    const skipPerformanceAnalysis = hasThorims && (isInDoomWinds || isAscendanceActive);

    const stormstrikeSpellId = isAscendanceActive
      ? SPELLS.WINDSTRIKE_CAST.id
      : SPELLS.STORMSTRIKE.id;

    const stormstrikeRemainingBefore = this.deps.spellUsable.cooldownRemaining(
      stormstrikeSpellId,
      event.timestamp,
    );
    const lavaLashRemainingBefore = this.deps.spellUsable.cooldownRemaining(
      TALENTS.LAVA_LASH_TALENT.id,
      event.timestamp,
    );

    const stormstrike = this.calculateCdrWasteForSpell(stormstrikeSpellId, cooldownReduction);

    // SpellUsable.reduceCooldown expects unscaled ms (i.e., scaled by modRate), so convert
    // the wall-clock reduction we want into unscaled ms before applying.
    const lavaLash = this.calculateCdrWasteForSpell(TALENTS.LAVA_LASH_TALENT.id, cooldownReduction);

    const totalPotentialMs = cooldownReduction * 2;
    const totalWastedMs = stormstrike.wastedMs + lavaLash.wastedMs;
    const wastedPercent = totalPotentialMs > 0 ? totalWastedMs / totalPotentialMs : 0;

    const stormstrikeOnCd = this.deps.spellUsable.isOnCooldown(SPELLS.STORMSTRIKE.id);
    const lavaLashOnCd = this.deps.spellUsable.isOnCooldown(TALENTS.LAVA_LASH_TALENT.id);

    let performance = QualitativePerformance.Fail;
    if (skipPerformanceAnalysis) {
      performance = QualitativePerformance.Perfect;
    } else {
      if (!stormstrikeOnCd && !lavaLashOnCd) {
        performance = QualitativePerformance.Fail;
      } else if (totalWastedMs === 0) {
        performance = QualitativePerformance.Perfect;
      } else if (wastedPercent < 0.25) {
        performance = QualitativePerformance.Good;
      } else if (wastedPercent < 0.5) {
        performance = QualitativePerformance.Ok;
      }
    }

    const breakdown: CastCdrBreakdown = {
      timestamp: event.timestamp,
      spenderSpellId: event.ability.guid,
      stacksSpent,
      isAscendanceActive,
      stormstrike: stormstrike,
      lavaLash: lavaLash,
      wastedPercent,
      performance,
    };

    const tooltip = skipPerformanceAnalysis
      ? this.renderSkippedCastTooltip(breakdown)
      : this.renderCastTooltip(breakdown, {
          stormstrikeRemainingBefore,
          lavaLashRemainingBefore,
        });

    this.castEntries.push({ value: performance, tooltip });
  }

  private renderSkippedCastTooltip(cast: CastCdrBreakdown): JSX.Element {
    const time = this.owner.formatTimestamp(cast.timestamp);
    const spender = cast.spenderSpellId;

    return (
      <>
        @ <strong>{time}</strong>
        <div />
        <div>
          <strong>{formatDurationMillisMinSec(cast.stacksSpent * CDR_MS_PER_STACK, 1)}</strong> of
          CDR from <SpellLink spell={spender} /> @ {cast.stacksSpent}{' '}
          <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />
        </div>
        <div>
          Spell cast by <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} />
        </div>
      </>
    );
  }

  private renderCastTooltip(
    cast: CastCdrBreakdown,
    remaining: { stormstrikeRemainingBefore: number; lavaLashRemainingBefore: number },
  ): JSX.Element {
    const time = this.owner.formatTimestamp(cast.timestamp);
    const stormstrikeLabel = cast.isAscendanceActive ? SPELLS.WINDSTRIKE_CAST : SPELLS.STORMSTRIKE;

    const potentialTotalMs = cast.stormstrike.totalMs + cast.lavaLash.totalMs;
    const totalWastedMs = cast.stormstrike.wastedMs + cast.lavaLash.wastedMs;

    return (
      <>
        @ <strong>{time}</strong>
        <div />
        <div>
          <strong>{formatDurationMillisMinSec(cast.stacksSpent * CDR_MS_PER_STACK, 1)}</strong> of
          CDR from <SpellLink spell={cast.spenderSpellId} /> @ {cast.stacksSpent}{' '}
          <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />
        </div>
        <div>
          <SpellLink spell={stormstrikeLabel} />:{' '}
          {formatDurationMillisMinSec(remaining.stormstrikeRemainingBefore, 1)}{' '}
          <small>remaining</small>, {formatDurationMillisMinSec(cast.stormstrike.wastedMs, 1)}{' '}
          <small>wasted</small>
        </div>
        <div>
          <SpellLink spell={TALENTS.LAVA_LASH_TALENT} />:{' '}
          {formatDurationMillisMinSec(remaining.lavaLashRemainingBefore, 1)}{' '}
          <small>remaining</small>, {formatDurationMillisMinSec(cast.lavaLash.wastedMs, 1)}{' '}
          <small>wasted</small>
        </div>
        <div>
          Total: {formatDurationMillisMinSec(totalWastedMs, 1)} <small>wasted</small> /{' '}
          {formatDurationMillisMinSec(potentialTotalMs, 1)} <small>possible</small> (
          {formatPercentage(cast.wastedPercent)}% wasted)
        </div>
      </>
    );
  }

  get guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const explanation = (
      <p>
        <SpellLink spell={TALENTS.ELEMENTAL_TEMPO_TALENT} /> reduces the cooldown of{' '}
        <SpellLink spell={SPELLS.STORMSTRIKE} /> (or <SpellLink spell={SPELLS.WINDSTRIKE_CAST} />{' '}
        during <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} />) and{' '}
        <SpellLink spell={TALENTS.LAVA_LASH_TALENT} /> whenever you consume{' '}
        <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks. The boxes below score each
        spender cast by how much cooldown reduction was wasted.
      </p>
    );

    const data = (
      <RoundedPanel>
        <div>
          <small>
            Blue is a perfect cast (0 wasted on both spells). Green is good (&lt;25% wasted). Yellow
            is ok (&lt;50% wasted). Red fails (including when both affected spells were off
            cooldown).
          </small>
        </div>
        <div style={{ marginTop: 12 }}>
          <strong>All Maelstrom spender casts</strong>
          <PerformanceBoxRow values={this.castEntries} />
        </div>
      </RoundedPanel>
    );

    return (
      <ExplanationAndDataSubSection
        title={<SpellLink spell={TALENTS.ELEMENTAL_TEMPO_TALENT} />}
        explanation={explanation}
        data={data}
      />
    );
  }
}

export default ElementalTempo;
