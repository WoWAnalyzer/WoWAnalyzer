import { type JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink, SpellIcon } from 'interface';
import { formatPercentage, formatDuration, formatNumber } from 'common/format';
import GuideSection from 'interface/guide/components/GuideSection';
import CastDetail, {
  type PerCastData,
  type PerCastStat,
} from 'interface/guide/components/CastDetail';
import Analyzer from 'parser/core/Analyzer';
import ArcaneBarrage, { ArcaneBarrageData } from '../analyzers/ArcaneBarrage';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ARCANE_SALVO_MAX_STACKS } from '../../shared';

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

  private readonly MAX_ARCANE_CHARGES = 4;
  private readonly LOW_MANA_THRESHOLD = 0.3;
  private readonly NO_MANA_THRESHOLD = 0.1;
  private readonly LOW_HEALTH_THRESHOLD = 0.35;
  private readonly AOE_THRESHOLD = 3;

  private buildCastStats(cast: ArcaneBarrageData): PerCastStat[] {
    const stats: PerCastStat[] = [];

    //Arcane Charges
    stats.push({
      label: 'Arcane Charges',
      value: `${cast.charges} / ${this.MAX_ARCANE_CHARGES}`,
      tooltip: `The number of Arcane Charge you had when Arcane Barrage was cast.`,
    });

    //Targets Hit
    if (cast.targetsHit > 0) {
      stats.push({
        label: 'Targets Hit',
        value: `${cast.targetsHit}`,
        tooltip: `The number of targets hit by the Arcane Barrage cast`,
      });
    }

    //Mana
    if (cast.mana !== undefined) {
      stats.push({
        label: 'Mana',
        value: `${formatPercentage(cast.mana, 0)}%`,
        tooltip: `The player's mana before Arcane Barrage was cast.`,
      });
    }

    //Arcane Salvo
    if (this.hasArcaneSalvo && cast.salvoStacks) {
      stats.push({
        label: 'Arcane Salvo Stacks',
        value: formatNumber(cast.salvoStacks),
        tooltip: `The number of Arcane Salvo stacks the player had before Arcane Barrage was cast.`,
      });
    }

    //Precast
    if (cast.precast) {
      stats.push({
        label: 'Precast Spell',
        value: <SpellIcon spell={cast.precast.ability.guid} />,
        tooltip: `Precast: ${cast.precast.ability.name}`,
      });
    }

    // Active Buffs
    if (cast.activeBuffs.length > 0) {
      stats.push({
        label: 'Active Buffs',
        value: `${cast.activeBuffs.length}`,
        tooltip: (
          <>
            {cast.activeBuffs.map((buff, i) => (
              <div key={i}>{<SpellLink spell={SPELLS[buff]} />}</div>
            ))}
          </>
        ),
      });
    }

    // touch of the Magi Cooldown
    if (cast.touchCD) {
      stats.push({
        label: 'Touch CD',
        value: formatDuration(cast.touchCD),
        tooltip: `Cooldown Remaining on Touch of the Magi`,
      });
    }

    return stats;
  }

  private evaluateBarrageCast(cast: ArcaneBarrageData): PerCastData {
    const hasMaxCharges = cast.charges >= this.MAX_ARCANE_CHARGES;
    const isAOE = cast.targetsHit >= this.AOE_THRESHOLD;
    const hasLowMana = cast.mana !== undefined && cast.mana <= this.LOW_MANA_THRESHOLD;
    const hasNoMana = cast.mana !== undefined && cast.mana <= this.NO_MANA_THRESHOLD;
    const hasLowHealth = cast.health !== undefined && cast.health <= this.LOW_HEALTH_THRESHOLD;
    const hasClearcasting = cast.activeBuffs.includes(SPELLS.CLEARCASTING_ARCANE.id);
    const hasArcaneSoul = cast.activeBuffs.includes(SPELLS.ARCANE_SOUL_BUFF.id);
    const hasOPMissiles = cast.activeBuffs.includes(SPELLS.OVERPOWERED_MISSILES_BUFF.id);
    const targetHasTouch = cast.activeBuffs.includes(SPELLS.TOUCH_OF_THE_MAGI_DEBUFF.id);

    const statData = {
      stats: this.buildCastStats(cast),
      timestamp: this.owner.formatTimestamp(cast.cast.timestamp),
    };

    // FAIL CONDITIONS
    if (!hasMaxCharges) {
      return {
        performance: QualitativePerformance.Fail,
        details: `Insufficient Arcane Charges (${cast.charges}/${this.MAX_ARCANE_CHARGES}) - should wait for maximum charges`,
        ...statData,
      };
    }

    if (cast.touchCD > 0 && cast.touchCD < 5) {
      return {
        performance: QualitativePerformance.Fail,
        details: (
          <>
            <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> was about to come off cooldown,
            so you should have held this until it was ready.
          </>
        ),
        ...statData,
      };
    }

    // PERFECT CONDITIONS
    // 20 Stacks of Arcane Salvo (25 with Spellfire Salvo)
    const maxSalvoStacks = this.isSunfury ? 25 : 20;
    if (this.hasArcaneSalvo && cast.salvoStacks >= maxSalvoStacks) {
      return {
        performance: QualitativePerformance.Perfect,
        details: (
          <>
            Had {cast.salvoStacks} Stacks of <SpellLink spell={TALENTS.ARCANE_SALVO_TALENT} />.
          </>
        ),
        ...statData,
      };
      // Minor Exception for Sunfury if you are close to capping on Salvo
    } else if (this.isSunfury && this.hasArcaneSalvo && cast.salvoStacks >= maxSalvoStacks - 7) {
      return {
        performance: QualitativePerformance.Ok,
        details: (
          <>
            You were close to capping on <SpellLink spell={SPELLS.ARCANE_SALVO_BUFF} /> (
            {cast.salvoStacks} Stacks). It would have been more beneficial to hold{' '}
            <SpellLink spell={SPELLS.ARCANE_BARRAGE} /> until you had {maxSalvoStacks} Stacks.
          </>
        ),
        ...statData,
      };
    }

    // Had Arcane Soul Buff
    if (this.isSunfury && hasArcaneSoul) {
      return {
        performance: QualitativePerformance.Perfect,
        details: (
          <>
            Had <SpellLink spell={SPELLS.ARCANE_SOUL_BUFF} />
          </>
        ),
        ...statData,
      };
    }

    // AOE with Arcane Orb
    if (isAOE && cast.arcaneOrbAvail) {
      return {
        performance: QualitativePerformance.Perfect,
        details: (
          <>
            Hit {cast.targetsHit} and had <SpellLink spell={TALENTS.ARCANE_ORB_TALENT} /> Available.
          </>
        ),
        ...statData,
      };
    }

    // Touch of the Magi Active
    if (this.isSunfury && targetHasTouch) {
      return {
        performance: QualitativePerformance.Perfect,
        details: (
          <>
            <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> Active on the Target.
          </>
        ),
        ...statData,
      };
    }

    // High Voltage
    if (this.isSunfury && this.hasHighVoltage && hasClearcasting) {
      return {
        performance: QualitativePerformance.Perfect,
        details: (
          <>
            Had <SpellLink spell={TALENTS.HIGH_VOLTAGE_TALENT} /> and{' '}
            <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />.
          </>
        ),
        ...statData,
      };
    } else if (this.isSpellslinger && this.hasHighVoltage && hasClearcasting && hasOPMissiles) {
      return {
        performance: QualitativePerformance.Perfect,
        details: (
          <>
            Had <SpellLink spell={TALENTS.HIGH_VOLTAGE_TALENT} /> with{' '}
            <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} /> and{' '}
            <SpellLink spell={SPELLS.OVERPOWERED_MISSILES_BUFF} />.
          </>
        ),
        ...statData,
      };
    }

    if (hasNoMana) {
      return {
        performance: QualitativePerformance.Perfect,
        details: <>Ran out of Mana.</>,
        ...statData,
      };
    }

    // GOOD CONDITIONS
    // Low mana
    if (hasLowMana) {
      return {
        performance: QualitativePerformance.Good,
        details: <>Low on Mana ({formatPercentage(cast.mana!, 1)}%)</>,
        ...statData,
      };
    }

    // OK CONDITIONS
    if (isAOE) {
      return {
        performance: QualitativePerformance.Ok,
        details: (
          <>
            {cast.targetsHit} targets hit. Could have held until{' '}
            <SpellLink spell={TALENTS.ARCANE_ORB_TALENT} /> was available.
          </>
        ),
        ...statData,
      };
    }

    if (hasLowHealth) {
      return {
        performance: QualitativePerformance.Ok,
        details: <>Target was very low on health. ({formatPercentage(cast.health!, 1)}% Health)</>,
        ...statData,
      };
    }

    // DEFAULT FAIL
    return {
      performance: QualitativePerformance.Fail,
      details: <>No clear benefit found.</>,
      ...statData,
    };
  }

  get guideSubsection(): JSX.Element {
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;
    const arcaneBlast = <SpellLink spell={SPELLS.ARCANE_BLAST} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const arcaneOrb = <SpellLink spell={SPELLS.ARCANE_ORB} />;
    const arcaneSalvo = <SpellLink spell={TALENTS.ARCANE_SALVO_TALENT} />;
    const highVoltage = <SpellLink spell={TALENTS.HIGH_VOLTAGE_TALENT} />;
    const overpoweredMissiles = <SpellLink spell={TALENTS.OVERPOWERED_MISSILES_TALENT} />;

    const explanation = (
      <>
        <b>{arcaneBarrage}</b> is your {arcaneCharge} spender, removing the associated increased
        mana costs and damage. In order to maintain the damage increase as long as possible, you
        should only cast {arcaneBarrage} if you have {this.MAX_ARCANE_CHARGES} {arcaneCharge}s and
        one of the below conditions are true. Additionally, you should NOT use {arcaneBarrage} if{' '}
        {touchOfTheMagi}'s Cooldown will end within the next 5 seconds (and is not currently
        available).
        <ul>
          <li>
            You are about to cast {touchOfTheMagi} (You should try to use {touchOfTheMagi} while{' '}
            {arcaneBarrage} is in the air).
          </li>
          {this.hasArcaneSalvo && (
            <li>
              You have {this.isSunfury ? 25 : 20} stacks of {arcaneSalvo}
            </li>
          )}
          {this.isSunfury && <li>{touchOfTheMagi} is active on your target.</li>}
          <li>
            It will hit {this.AOE_THRESHOLD} or more targets and {arcaneOrb} is available
            {this.hasHighVoltage && this.isSpellslinger && <>or you have {clearcasting}</>}.
          </li>
          {this.hasHighVoltage && this.isSunfury && (
            <li>
              You have {highVoltage} and {clearcasting}.
            </li>
          )}
          {this.hasHighVoltage && this.isSpellslinger && (
            <li>
              You have {highVoltage}, {clearcasting}, and {overpoweredMissiles}.
            </li>
          )}
          <li>You do not have enough mana to cast {arcaneBlast}.</li>
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
