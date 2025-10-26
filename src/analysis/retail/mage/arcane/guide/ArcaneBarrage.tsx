import { ReactNode, type JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { formatPercentage, formatDuration } from 'common/format';
import GuideSection from 'interface/guide/components/GuideSection';
import CastDetail, {
  type PerCastData,
  type PerCastStat,
} from 'interface/guide/components/CastDetail';
import Analyzer from 'parser/core/Analyzer';
import ArcaneBarrage, { ArcaneBarrageData } from '../analyzers/ArcaneBarrage';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class ArcaneBarrageGuide extends Analyzer {
  static dependencies = {
    arcaneBarrage: ArcaneBarrage,
  };

  protected arcaneBarrage!: ArcaneBarrage;

  isSunfury: boolean = this.selectedCombatant.hasTalent(TALENTS.MEMORY_OF_ALAR_TALENT);
  isSpellslinger: boolean = this.selectedCombatant.hasTalent(TALENTS.SPLINTERSTORM_TALENT);

  private readonly MAX_ARCANE_CHARGES = 4;
  private readonly LOW_MANA_THRESHOLD = 0.3;
  private readonly LOW_HEALTH_THRESHOLD = 0.35;
  private readonly TEMPO_THRESHOLD = 5000;
  private readonly AOE_THRESHOLD = 3;

  /**
   * Evaluates a single Arcane Barrage cast for CastDetail.
   * Returns complete cast information including performance and stats.
   */
  private evaluateBarrageCast(cast: ArcaneBarrageData): PerCastData {
    // Calculate conditions (same as CastSummary version)
    const hasMaxCharges = cast.charges >= this.MAX_ARCANE_CHARGES;
    const isAOE = cast.targetsHit >= this.AOE_THRESHOLD;
    const hasLowMana = cast.mana !== undefined && cast.mana <= this.LOW_MANA_THRESHOLD;
    const hasLowHealth = cast.health !== undefined && cast.health < this.LOW_HEALTH_THRESHOLD;
    const hasPrecastSurge = cast.precast?.ability.guid === TALENTS.ARCANE_SURGE_TALENT.id;
    const tempoExpiring =
      cast.tempoRemaining !== undefined && cast.tempoRemaining < this.TEMPO_THRESHOLD;
    const hasSunfuryProc = cast.gloriousIncandescence || (cast.arcaneSoul && !cast.clearcasting);
    const hasSpellslingerProc = cast.arcaneOrbAvail;

    // Determine overall performance (same logic as CastSummary)
    let performance: QualitativePerformance;
    let notes: ReactNode;

    // Fail conditions
    if (!hasMaxCharges) {
      performance = QualitativePerformance.Fail;
      notes = `Insufficient Arcane Charges (${cast.charges}/${this.MAX_ARCANE_CHARGES}) - should wait for maximum charges`;
    }
    // Perfect conditions
    else if (hasMaxCharges && hasPrecastSurge) {
      performance = QualitativePerformance.Perfect;
      notes = (
        <>
          Perfect combo - <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} /> + 4 charges for maximum
          damage!
        </>
      );
    } else if (this.isSunfury && hasMaxCharges && hasSunfuryProc) {
      performance = QualitativePerformance.Perfect;
      notes = (
        <>
          Perfect Sunfury proc usage with max charges - converting{' '}
          {cast.gloriousIncandescence ? (
            <SpellLink spell={TALENTS.GLORIOUS_INCANDESCENCE_TALENT} />
          ) : (
            <SpellLink spell={SPELLS.ARCANE_SOUL_BUFF} />
          )}{' '}
          into AoE damage
        </>
      );
    } else if (this.isSpellslinger && hasMaxCharges && hasSpellslingerProc) {
      performance = QualitativePerformance.Perfect;
      notes = 'Perfect Spellslinger proc usage with max charges';
    } else if (isAOE && hasMaxCharges) {
      performance = QualitativePerformance.Perfect;
      notes = `Excellent AOE usage - hit ${cast.targetsHit} targets with max charges`;
    } else if (this.isSpellslinger && isAOE && tempoExpiring) {
      performance = QualitativePerformance.Perfect;
      notes = `Perfect AOE + Tempo management - hit ${cast.targetsHit} targets before Tempo expires`;
    }
    // Good conditions
    else if (hasMaxCharges && hasLowMana) {
      performance = QualitativePerformance.Good;
      notes = `Good emergency usage - low mana (${formatPercentage(cast.mana!, 1)}) necessitated charge spending`;
    } else if (this.isSpellslinger && hasMaxCharges && tempoExpiring) {
      performance = QualitativePerformance.Good;
      notes = (
        <>
          Good timing - avoiding <SpellLink spell={SPELLS.ARCANE_TEMPO_BUFF} /> expiration
        </>
      );
    }
    // Ok conditions
    else if (hasMaxCharges && hasLowHealth) {
      performance = QualitativePerformance.Ok;
      notes = `Target execute - ${formatPercentage(cast.health!, 1)}% health remaining`;
    } else if (isAOE) {
      performance = QualitativePerformance.Ok;
      notes = `AOE usage - hit ${cast.targetsHit} targets (could optimize with procs/buffs)`;
    }
    // Default
    else {
      performance = QualitativePerformance.Fail;
      notes = 'Wasted Arcane Charges - no clear benefit to casting Barrage';
    }

    // Build stats array for CastDetail
    const stats: PerCastStat[] = [];

    // Arcane Charges
    const chargePerformance =
      cast.charges >= this.MAX_ARCANE_CHARGES
        ? QualitativePerformance.Perfect
        : cast.charges >= 3
          ? QualitativePerformance.Good
          : QualitativePerformance.Fail;

    stats.push({
      label: 'Arcane Charges',
      value: `${cast.charges} / ${this.MAX_ARCANE_CHARGES}`,
      tooltip:
        cast.charges >= this.MAX_ARCANE_CHARGES
          ? 'Maximum charges'
          : `Only ${cast.charges} charges`,
      performance: chargePerformance,
    });

    // Targets Hit
    if (cast.targetsHit > 0) {
      const targetsPerformance =
        cast.targetsHit >= this.AOE_THRESHOLD
          ? QualitativePerformance.Good
          : QualitativePerformance.Ok;

      stats.push({
        label: 'Targets Hit',
        value: `${cast.targetsHit}`,
        tooltip: cast.targetsHit >= this.AOE_THRESHOLD ? 'Good AOE opportunity' : undefined,
        performance: targetsPerformance,
      });
    }

    // Mana
    if (cast.mana !== undefined) {
      const manaPerformance =
        cast.mana <= this.LOW_MANA_THRESHOLD
          ? QualitativePerformance.Ok
          : cast.mana <= 0.5
            ? QualitativePerformance.Good
            : undefined;

      stats.push({
        label: 'Mana',
        value: formatPercentage(cast.mana, 0),
        tooltip:
          cast.mana <= this.LOW_MANA_THRESHOLD ? 'Low mana - emergency cast acceptable' : undefined,
        performance: manaPerformance,
      });
    }

    // Active Buffs
    const activeBuffs: JSX.Element[] = [];
    if (cast.clearcasting) {
      activeBuffs.push(<SpellLink key="cc" spell={SPELLS.CLEARCASTING_ARCANE} />);
    }
    if (cast.arcaneSoul) {
      activeBuffs.push(<SpellLink key="as" spell={SPELLS.ARCANE_SOUL_BUFF} />);
    }
    if (cast.gloriousIncandescence) {
      activeBuffs.push(<SpellLink key="gi" spell={TALENTS.GLORIOUS_INCANDESCENCE_TALENT} />);
    }
    if (cast.burdenOfPower) {
      activeBuffs.push(<SpellLink key="bp" spell={SPELLS.BURDEN_OF_POWER_BUFF} />);
    }

    if (activeBuffs.length > 0) {
      stats.push({
        label: 'Active Buffs',
        value: `${activeBuffs.length}`,
        tooltip: (
          <>
            {activeBuffs.map((buff, i) => (
              <div key={i}>{buff}</div>
            ))}
          </>
        ),
      });
    }

    // Tempo Remaining (Spellslinger)
    if (this.isSpellslinger && cast.tempoRemaining !== undefined) {
      const tempoSeconds = cast.tempoRemaining / 1000;
      const tempoPerformance = tempoSeconds < 5 ? QualitativePerformance.Ok : undefined;

      stats.push({
        label: 'Tempo Remaining',
        value: `${tempoSeconds.toFixed(1)}s`,
        tooltip:
          tempoSeconds < 5 ? (
            <>
              Good timing - avoiding <SpellLink spell={SPELLS.ARCANE_TEMPO_BUFF} /> expiration
            </>
          ) : undefined,
        performance: tempoPerformance,
      });
    }

    // Touch CD
    if (cast.touchCD > 0) {
      const touchPerformance = cast.touchCD <= 5000 ? QualitativePerformance.Good : undefined;

      stats.push({
        label: 'Touch CD',
        value: formatDuration(cast.touchCD),
        tooltip:
          cast.touchCD <= 5000 ? (
            <>
              <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> almost available
            </>
          ) : undefined,
        performance: touchPerformance,
      });
    }

    // Return complete PerCastData object
    return {
      performance,
      stats,
      details: notes,
      timestamp: this.owner.formatTimestamp(cast.cast.timestamp),
    };
  }

  get guideSubsection(): JSX.Element {
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;
    const arcaneSoul = <SpellLink spell={SPELLS.ARCANE_SOUL_BUFF} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;
    const arcaneOrb = <SpellLink spell={SPELLS.ARCANE_ORB} />;
    const gloriousIncandescence = <SpellLink spell={TALENTS.GLORIOUS_INCANDESCENCE_TALENT} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;

    const explanation = (
      <>
        <b>{arcaneBarrage}</b> is your {arcaneCharge} spender, removing the associated increased
        mana costs and damage. Only cast {arcaneBarrage} under one of the below conditions to
        maintain the damage increase for as long as possible.
        <ul>
          <li>{touchOfTheMagi} is almost available or you are out of mana.</li>
          {this.isSunfury && (
            <>
              <li>You have {gloriousIncandescence}.</li>
              <li>
                You have {arcaneSoul} and either or don't have {clearcasting}
              </li>
            </>
          )}
          {this.isSpellslinger && <li>You have or {arcaneOrb}.</li>}
        </ul>
      </>
    );

    return (
      <GuideSection spell={SPELLS.ARCANE_BARRAGE} explanation={explanation} title="Arcane Barrage">
        <CastDetail
          title="Arcane Barrage Casts"
          casts={this.arcaneBarrage.barrageData.map((cast) => this.evaluateBarrageCast(cast))}
        />
      </GuideSection>
    );
  }
}

export default ArcaneBarrageGuide;
