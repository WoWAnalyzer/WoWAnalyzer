import { type JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink, SpellIcon } from 'interface';
import {
  formatPercentage,
  formatDuration,
  formatNumber,
  formatDurationMillisMinSec,
} from 'common/format';
import GuideSection from 'interface/guide/components/GuideSection';
import CastDetail, {
  type PerCastData,
  type PerCastStat,
} from 'interface/guide/components/CastDetail';
import Analyzer from 'parser/core/Analyzer';
import ArcaneBarrage, { ArcaneBarrageData } from '../analyzers/ArcaneBarrage';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { CastEvaluation, TipBox } from 'interface/guide/components';

class ArcaneBarrageGuide extends Analyzer {
  static dependencies = {
    arcaneBarrage: ArcaneBarrage,
  };

  protected arcaneBarrage!: ArcaneBarrage;

  isSunfury: boolean = this.selectedCombatant.hasTalent(TALENTS.MEMORY_OF_ALAR_TALENT);
  isSpellslinger: boolean = this.selectedCombatant.hasTalent(TALENTS.SPLINTERSTORM_TALENT);
  hasArcaneSalvo: boolean = this.selectedCombatant.hasTalent(TALENTS.ARCANE_SALVO_TALENT);
  hasHighVoltage: boolean = this.selectedCombatant.hasTalent(TALENTS.HIGH_VOLTAGE_TALENT);
  hasOverpoweredMissiles: boolean = this.selectedCombatant.hasTalent(
    TALENTS.OVERPOWERED_MISSILES_TALENT,
  );
  hasOrbMastery: boolean = this.selectedCombatant.hasTalent(TALENTS.ORB_MASTERY_TALENT);
  hasOrbBarrage: boolean = this.selectedCombatant.hasTalent(TALENTS.ORB_BARRAGE_TALENT);
  isSpellslingerMissile: boolean = this.isSpellslinger && !this.hasOrbMastery;
  isSpellslingerOrb: boolean = this.isSpellslinger && this.hasOrbMastery;

  private readonly MAX_ARCANE_CHARGES = 4;
  private readonly NO_MANA_THRESHOLD = 0.1;

  private evaluateBarrageCast(cast: ArcaneBarrageData): CastEvaluation {
    const hasMaxCharges = cast.charges >= this.MAX_ARCANE_CHARGES;
    const hasNoMana = cast.mana !== undefined && cast.mana <= this.NO_MANA_THRESHOLD;
    const hasClearcasting = cast.activeBuffs.includes(SPELLS.CLEARCASTING_ARCANE.id);
    const hasOPMissiles = cast.activeBuffs.includes(SPELLS.OVERPOWERED_MISSILES_BUFF.id);

    // NO MANA
    if (cast.mana && hasNoMana) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Very Low Mana (${formatPercentage(cast.mana)}%)`,
      };
    }

    // FAIL CONDITIONS
    if (cast.touchCD < 5000 && cast.touchCD > 0) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: `Touch of the Magi available soon (${formatDurationMillisMinSec(cast.touchCD)})`,
      };
    }

    // PERFECT CONDITIONS
    if (this.isSpellslinger && cast.salvoStacks === 20 && (hasMaxCharges || this.hasOrbBarrage)) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: `Had 20 Arcane Salvo Stacks and ${hasMaxCharges ? '4 Arcane Charges.' : 'Orb Barrage Talented.'}`,
      };
    }

    // GOOD CONDITIONS
    if (this.isSpellslinger && cast.touchApply && cast.barrageBefore) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Barrage was cast immediately before Touch of the Magi.`,
      };
    }

    if (this.isSpellslinger && cast.touchApply && cast.barrageAfter) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Barrage was cast immediately after Touch of the Magi.`,
      };
    }

    if (
      this.isSpellslingerMissile &&
      hasMaxCharges &&
      hasOPMissiles &&
      hasClearcasting &&
      cast.salvoStacks >= 5
    ) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Had 4 Arcane Charges, Overpowered Missiles, Clearcasting, and ${cast.salvoStacks} Arcane Salvo Stacks.`,
      };
    }

    if (
      this.isSpellslingerOrb &&
      cast.touchRemaining &&
      cast.touchRemaining < 2000 &&
      cast.salvoStacks >= 15
    ) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Touch of the Magi about to end (${formatDurationMillisMinSec(cast.touchRemaining)}) with ${cast.salvoStacks} Arcane Salvo stacks.`,
      };
    }

    if (
      this.isSpellslingerOrb &&
      cast.surgeRemaining &&
      cast.surgeRemaining < 2000 &&
      cast.salvoStacks >= 15
    ) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Arcane Surge about to end (${formatDurationMillisMinSec(cast.surgeRemaining)}) with ${cast.salvoStacks} Arcane Salvo stacks.`,
      };
    }

    if (this.isSunfury && cast.salvoStacks >= 25) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Had ${cast.salvoStacks} Arcane Salvo stacks and 4 Arcane Charges.`,
      };
    }

    if (this.isSunfury && cast.barrageAfter) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Touch of the Magi cast immediately before Arcane Barrage.`,
      };
    }

    if (this.isSunfury && cast.touchRemaining && cast.touchRemaining < 2000) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Touch of the Magi ends in ${formatDurationMillisMinSec(cast.touchRemaining)}.`,
      };
    }

    if (this.isSunfury && cast.activeBuffs.includes(SPELLS.ARCANE_SOUL_BUFF.id)) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Had Arcane Soul.`,
      };
    }

    if (
      this.isSunfury &&
      !cast.activeBuffs.includes(SPELLS.TOUCH_OF_THE_MAGI_DEBUFF.id) &&
      !cast.activeBuffs.includes(SPELLS.ARCANE_SURGE_BUFF.id) &&
      cast.salvoStacks < 19
    ) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Had ${cast.salvoStacks} Arcane Salvo stacks without Touch of the Magi or Arcane Surge.`,
      };
    }

    if (
      this.isSunfury &&
      !cast.activeBuffs.includes(SPELLS.TOUCH_OF_THE_MAGI_DEBUFF.id) &&
      !cast.activeBuffs.includes(SPELLS.ARCANE_SURGE_BUFF.id) &&
      cast.targetsHit >= 3 &&
      cast.arcaneOrbAvail
    ) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Had ${cast.salvoStacks} Arcane Salvo stacks and an Arcane Orb charge without Touch of the Magi or Arcane Surge.`,
      };
    }

    // OK CONDITIONS
    if (this.isSpellslinger && cast.salvoStacks < 20) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `Had ${cast.salvoStacks} Arcane Salvo stacks.`,
      };
    }

    if (this.isSunfury && cast.salvoStacks < 25) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `Had ${cast.salvoStacks} Arcane Salvo stacks.`,
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
    const arcaneBlast = <SpellLink spell={SPELLS.ARCANE_BLAST} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const arcaneOrb = <SpellLink spell={SPELLS.ARCANE_ORB} />;
    const arcaneSalvo = <SpellLink spell={TALENTS.ARCANE_SALVO_TALENT} />;
    const overpoweredMissiles = <SpellLink spell={TALENTS.OVERPOWERED_MISSILES_TALENT} />;
    const orbBarrage = <SpellLink spell={TALENTS.ORB_BARRAGE_TALENT} />;
    const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />;
    const arcaneSoul = <SpellLink spell={SPELLS.ARCANE_SOUL_BUFF} />;
    const gloriousIncandescence = <SpellLink spell={TALENTS.GLORIOUS_INCANDESCENCE_TALENT} />;

    const explanation = (
      <>
        <p>
          <b>{arcaneBarrage}</b> is your {arcaneCharge} spender, removing the associated increased
          mana costs and damage. In order to maintain the damage increase as long as possible, you
          should only cast {arcaneBarrage} under the below conditions, which are tailored to your
          current talent build.
        </p>
        <p>
          Regardless of the below, if {touchOfTheMagi} will be available in the next 4-5 seconds,
          you should hold {arcaneBarrage} for {touchOfTheMagi}.
        </p>
        {this.isSpellslingerMissile && (
          <ul>
            <li>
              You have 20 stacks of {arcaneSalvo} and either 4 {arcaneCharge}s or have the{' '}
              {orbBarrage} talent.
            </li>
            <li>
              You just casted, or are about to cast, {touchOfTheMagi} ({arcaneBarrage} should be
              within a GCD of {touchOfTheMagi}, either before it or after it).
            </li>
            <li>You don't have enough mana for {arcaneBlast}</li>
            <li>
              You have 4 {arcaneCharge}s, an {overpoweredMissiles} and {clearcasting} proc, and at
              least 5 {arcaneSalvo} stacks.
            </li>
          </ul>
        )}
        {this.isSpellslingerOrb && (
          <ul>
            <li>
              You have 20 stacks of {arcaneSalvo} and either 4 {arcaneCharge}s or have the{' '}
              {orbBarrage} talent.
            </li>
            <li>
              You just casted, or are about to cast, {touchOfTheMagi} ({arcaneBarrage} should be
              within a GCD of {touchOfTheMagi}, either before it or after it).
            </li>
            <li>You don't have enough mana for {arcaneBlast}</li>
            <li>
              {arcaneSurge} or {touchOfTheMagi} will end in the next 1-2 seconds and you have 15 or
              more {arcaneSalvo} stacks.
            </li>
          </ul>
        )}
        {this.isSunfury && (
          <ul>
            <li>
              You have 4 {arcaneCharge}s and 25 stacks of {arcaneSalvo}
            </li>
            <li>
              Your last cast was {touchOfTheMagi} or the {touchOfTheMagi} debuff will end in 1-2
              seconds.
            </li>
            <li>You have {arcaneSoul}.</li>
            <li>You don't have enough mana for {arcaneBlast}</li>
            <li>
              You have 4 {arcaneCharge}s, are not in a burn phase ({touchOfTheMagi} and{' '}
              {arcaneSurge} are not active), and &lt; 19 stacks of {arcaneSalvo}.
            </li>
            <li>
              You have 4 {arcaneCharge}s, are not in a burn phase ({touchOfTheMagi} and{' '}
              {arcaneSurge} are not active), {arcaneBarrage} will hit 3 or more enemies, and you
              have a charge of {arcaneOrb} available.
            </li>
          </ul>
        )}
        {this.isSunfury && (
          <p>
            <TipBox type="note" title="Meteorites">
              If you are close to a multiple of 6 {arcaneSalvo} stacks (6, 12, 18), it is beneficial
              to hold {arcaneBarrage} until you are above that threshold to maximize the number of
              meteorites generated by {gloriousIncandescence}.
            </TipBox>
          </p>
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
        cast.touchCD
          ? {
              label: 'Touch CD',
              value: formatDuration(cast.touchCD),
              tooltip: `Cooldown Remaining on Touch of the Magi`,
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
