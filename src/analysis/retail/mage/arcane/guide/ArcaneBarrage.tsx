import { type JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink, SpellIcon } from 'interface';
import { formatPercentage, formatNumber } from 'common/format';
import GuideSection from 'interface/guide/components/GuideSection';
import CastDetail, {
  type PerCastData,
  type PerCastStat,
} from 'interface/guide/components/CastDetail';
import Analyzer from 'parser/core/Analyzer';
import ArcaneBarrage, { ArcaneBarrageData } from '../analyzers/ArcaneBarrage';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { CastEvaluation } from 'interface/guide/components';

class ArcaneBarrageGuide extends Analyzer {
  static dependencies = {
    arcaneBarrage: ArcaneBarrage,
  };

  protected arcaneBarrage!: ArcaneBarrage;

  isSunfury: boolean = this.selectedCombatant.hasTalent(TALENTS.MEMORY_OF_ALAR_TALENT);
  isSpellslinger: boolean = this.selectedCombatant.hasTalent(TALENTS.SPLINTERSTORM_TALENT);
  hasArcaneSalvo: boolean = this.selectedCombatant.hasTalent(TALENTS.ARCANE_SALVO_TALENT);
  hasOverpoweredMissiles: boolean = this.selectedCombatant.hasTalent(
    TALENTS.OVERPOWERED_MISSILES_TALENT,
  );
  hasOrbBarrage: boolean = this.selectedCombatant.hasTalent(TALENTS.ORB_BARRAGE_TALENT);

  private readonly MAX_ARCANE_CHARGES = 4;
  private readonly NO_MANA_THRESHOLD = 0.1;

  private evaluateBarrageCast(cast: ArcaneBarrageData): CastEvaluation {
    const hasMaxCharges = cast.charges >= this.MAX_ARCANE_CHARGES;
    const hasNoMana = cast.mana !== undefined && cast.mana <= this.NO_MANA_THRESHOLD;
    const hasClearcasting = cast.activeBuffs.includes(SPELLS.CLEARCASTING_ARCANE.id);
    const hasArcaneSoulBuff = cast.activeBuffs.includes(SPELLS.ARCANE_SOUL_BUFF.id);

    // NO MANA
    if (cast.mana && hasNoMana) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `Very Low Mana (${formatPercentage(cast.mana)}%)`,
      };
    }

    // FAIL CONDITIONS

    // PERFECT CONDITIONS
    if (this.isSpellslinger && cast.salvoStacks === 20 && hasMaxCharges) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: `Had 4 Arcane Charges and 20 Arcane Salvo stacks.`,
      };
    }

    if (this.isSpellslinger && cast.salvoStacks >= 19 && this.hasOrbBarrage && hasMaxCharges) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: `Had 4 Arcane Charges, ${cast.salvoStacks} Arcane Salvo stacks, and Orb Barrage talented.`,
      };
    }

    if (this.isSpellslinger && cast.touchCD === 0 && cast.salvoStacks >= 15 && hasMaxCharges) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: `Had 4 Arcane Charges, ${cast.salvoStacks} Arcane Salvo stacks, and Touch of the Magi was available`,
      };
    }

    if (this.isSunfury && cast.salvoStacks >= 12 && hasClearcasting && hasMaxCharges) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: `Had 4 Arcane Charges, Clearcasting, and ${cast.salvoStacks} Arcane Salvo stacks`,
      };
    }

    if (
      this.isSunfury &&
      cast.salvoStacks >= 12 &&
      hasMaxCharges &&
      cast.targetsHit >= 5 &&
      cast.arcaneOrbAvail
    ) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: `Had 4 Arcane Charges, hit ${cast.targetsHit} targets, and had Arcane Orb available.`,
      };
    }

    if (
      this.isSunfury &&
      cast.salvoStacks >= 12 &&
      hasMaxCharges &&
      cast.targetsHit >= 5 &&
      cast.arcanePulseAvail
    ) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: `Had 4 Arcane Charges, hit ${cast.targetsHit} targets, and had Arcane Pulse available.`,
      };
    }

    // GOOD CONDITIONS
    if (this.isSpellslinger && cast.salvoStacks === 20) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Had ${cast.charges} Arcane Charges and 20 Arcane Salvo stacks.`,
      };
    }

    if (this.isSunfury && hasArcaneSoulBuff) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Had an Arcane Soul proc.`,
      };
    }

    if (this.isSunfury && cast.salvoStacks === 25 && hasMaxCharges) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Had 4 Arcane Charges and 25 Arcane Salvo stacks.`,
      };
    }

    // OK CONDITIONS
    if (this.isSpellslinger && cast.salvoStacks < 15) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `Had ${cast.salvoStacks} Arcane Salvo stacks.`,
      };
    }

    if (this.isSpellslinger && cast.salvoStacks < 20 && !this.hasOrbBarrage) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `Had ${cast.salvoStacks} Arcane Salvo stacks without Orb Barrage.`,
      };
    }

    if (this.isSunfury && !hasClearcasting && cast.salvoStacks < 12) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `Had ${cast.salvoStacks} Arcane Salvo stacks without Clearcasting.`,
      };
    }

    if (this.isSunfury && cast.salvoStacks < 25) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `Had ${cast.salvoStacks} Arcane Salvo stacks.`,
      };
    }

    if (this.isSunfury && cast.targetsHit < 5 && (cast.arcaneOrbAvail || cast.arcanePulseAvail)) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `Had Arcane Orb or Arcane Pulse, but only hit ${cast.targetsHit} targets.`,
      };
    }

    // FAIL
    if (this.isSunfury && cast.targetsHit < 5) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: `Hit ${cast.targetsHit} targets hit with no other benefits.`,
      };
    }

    // DEFAULT FAIL
    return {
      timestamp: cast.cast.timestamp,
      performance: QualitativePerformance.Fail,
      reason: `Performance Condition Unknown. Please report this!`,
    };
  }

  get guideSubsection(): JSX.Element {
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const arcanePulse = <SpellLink spell={TALENTS.ARCANE_PULSE_TALENT} />;
    const arcaneOrb = <SpellLink spell={SPELLS.ARCANE_ORB} />;
    const arcaneSalvo = <SpellLink spell={TALENTS.ARCANE_SALVO_TALENT} />;
    const orbBarrage = <SpellLink spell={TALENTS.ORB_BARRAGE_TALENT} />;
    const arcaneSoul = <SpellLink spell={SPELLS.ARCANE_SOUL_BUFF} />;

    const explanation = (
      <>
        <p>
          <b>{arcaneBarrage}</b> is your {arcaneCharge} spender, removing the associated increased
          mana costs and damage. In order to maintain the damage increase as long as possible, you
          should only cast {arcaneBarrage} under the below conditions, and should always aim to have
          4 {arcaneCharge}s before casting {arcaneBarrage}.
        </p>
        {this.isSpellslinger && (
          <ul>
            <li>
              You have 20 stacks of {arcaneSalvo} (or 19 stacks with {orbBarrage}).
            </li>
            <li>
              You have at least 15 stacks of {arcaneSalvo} and {touchOfTheMagi} is ready.
            </li>
            <li>You are out of mana.</li>
          </ul>
        )}
        {this.isSunfury && (
          <ul>
            <li>{arcaneSoul} is active.</li>
            <li>You have 25 stacks of {arcaneSalvo}.</li>
            <li>
              You have at least 12 stacks of {arcaneSalvo} and a {clearcasting} proc.
            </li>
            <li>
              You have at least 8 stacks of {arcaneSalvo} and {touchOfTheMagi} is ready.
            </li>
            <li>
              You have 12 or more stacks of {arcaneSalvo} and can hit 5 or more targets with{' '}
              {arcaneOrb} or {arcanePulse} (and {arcaneOrb} or {arcanePulse} are available).
            </li>
            <li>You are out of mana.</li>
          </ul>
        )}
      </>
    );

    const perCastData: PerCastData[] = this.arcaneBarrage.barrageData.map((cast) => {
      const evaluation = this.evaluateBarrageCast(cast);
      const stats: PerCastStat[] = [
        {
          label: 'Arcane Charges',
          value: `${cast.charges} / ${this.MAX_ARCANE_CHARGES}`,
          tooltip: `The number of Arcane Charge you had when Arcane Barrage was cast.`,
        },
        cast.targetsHit > 0
          ? {
              label: 'Targets Hit',
              value: `${cast.targetsHit}`,
              tooltip: `The number of targets hit by the Arcane Barrage cast`,
            }
          : undefined,
        cast.mana !== undefined
          ? {
              label: 'Mana',
              value: `${formatPercentage(cast.mana, 0)}%`,
              tooltip: `The player's mana before Arcane Barrage was cast.`,
            }
          : undefined,
        this.hasArcaneSalvo && cast.salvoStacks
          ? {
              label: 'Arcane Salvo Stacks',
              value: formatNumber(cast.salvoStacks),
              tooltip: `The number of Arcane Salvo stacks the player had before Arcane Barrage was cast.`,
            }
          : undefined,
        cast.precast
          ? {
              label: 'Precast Spell',
              value: <SpellIcon spell={cast.precast.ability.guid} />,
              tooltip: `Precast: ${cast.precast.ability.name}`,
            }
          : undefined,
        cast.activeBuffs.length > 0
          ? {
              label: 'Active Buffs',
              value: `${cast.activeBuffs.length}`,
              tooltip: (
                <>
                  {cast.activeBuffs.map((buff, i) => (
                    <div key={i}>{<SpellLink spell={SPELLS[buff]} />}</div>
                  ))}
                </>
              ),
            }
          : undefined,
      ].filter(Boolean) as PerCastStat[];

      return {
        performance: evaluation.performance,
        details: evaluation.reason,
        timestamp: this.owner.formatTimestamp(cast.cast.timestamp),
        stats,
      };
    });

    return (
      <GuideSection spell={SPELLS.ARCANE_BARRAGE} explanation={explanation} title="Arcane Barrage">
        <CastDetail title="Arcane Barrage Casts" casts={perCastData} />
      </GuideSection>
    );
  }
}

export default ArcaneBarrageGuide;
