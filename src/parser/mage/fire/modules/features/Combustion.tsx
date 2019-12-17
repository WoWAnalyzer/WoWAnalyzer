import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

const debug = false;
const FIRESTARTER_HEALTH_THRESHOLD = .90;
const DAMAGE_SPELLS = [
  SPELLS.FIREBALL,
  SPELLS.PYROBLAST,
  SPELLS.SCORCH,
  SPELLS.FIRE_BLAST,
  SPELLS.PHOENIX_FLAMES_TALENT,
];

class Combustion extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };
  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;

  hasFlameOn: boolean; hasPhoenixFlames: boolean; hasFirestarter: boolean;
  castEvent!: {
        meta: {
            isInefficientCast?: any;
            inefficientCastReason?: any;
        };
    };

  healthPercent = 1;
  lowPhoenixFlamesCharges = 0;
  lowFireBlastCharges = 0;
  fireballCastsStarted = 0;
  fireballCastsCompleted = 0;
  scorchCastsStarted = 0;
  scorchCastsCompleted = 0;
  combustionCast = false;
  badCast = false;
  combustionDuringFirestarter = false;

  constructor(options: any) {
    super(options);
        this.hasFlameOn = this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id);
        this.hasPhoenixFlames = this.selectedCombatant.hasTalent(SPELLS.PHOENIX_FLAMES_TALENT.id);
        this.hasFirestarter = this.selectedCombatant.hasTalent(SPELLS.FIRESTARTER_TALENT.id);
        this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION), this.onCombustion);
        this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(DAMAGE_SPELLS), this.onDamage);
        this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.FIREBALL, SPELLS.SCORCH]), this.onCast);
        this.addEventListener(Events.begincast.by(SELECTED_PLAYER).spell([SPELLS.FIREBALL, SPELLS.SCORCH]), this.onCast);
  }

  //When Combustion is cast, check to see how many charges of Fire Blast and Phoenix Flames are available. If there is less than (Max Charges - 1) then its a bad Combustion cast. 
  onCombustion(event: any) {
    this.combustionCast = true;
    this.castEvent = event;

    const fireBlastCharges = this.spellUsable.chargesAvailable(SPELLS.FIRE_BLAST.id);
    const phoenixFlamesCharges = (this.spellUsable.chargesAvailable(SPELLS.PHOENIX_FLAMES_TALENT.id) || 0);
    const FIRE_BLAST_THRESHOLD = this.hasFlameOn ? 2 : 1;
    const PHOENIX_FLAMES_THRESHOLD = 2;
    this.badCast = false;

    //Check how many Fire Blast charges were available when Combustion was cast
    if (fireBlastCharges < FIRE_BLAST_THRESHOLD) {
      this.lowFireBlastCharges += 1;
      this.badCast = true;
      debug && this.log("Low Fire Blast Charges: " + fireBlastCharges + " Target: " + FIRE_BLAST_THRESHOLD);
    }

    //Check how many Phoenix Flames charges were available when Combustion was cast (if talented)
    if (this.hasPhoenixFlames && phoenixFlamesCharges < 2) {
      this.lowPhoenixFlamesCharges += 1;
      this.badCast = true;
      debug && this.log("Low Phoenix Flames Charges: " + phoenixFlamesCharges + " Target: " + PHOENIX_FLAMES_THRESHOLD);
    }

    //If either checks are failed, mark the Combustion event on the timeline
    if (this.badCast) {
      const inefficientCastReason = `This Combustion was cast with a low amount of Fire Blast ${this.hasPhoenixFlames ? 'and/or Phoenix Flames' : '' }charges. In order to get the most out of your Combustion casts, ensure that you have at least ${this.hasFlameOn ? '2' : '1' } Fire Blast charges${this.hasPhoenixFlames ? ' and 2 Phoenix Flames charges' : '' }. `;
      this.flagTimeline(inefficientCastReason);
    }
  }

  onCast(event: any) {
    const hasCombustion = this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id);
    const fireBlastCharges = this.spellUsable.chargesAvailable(SPELLS.FIRE_BLAST.id);
    const phoenixFlamesCharges = this.spellUsable.chargesAvailable(SPELLS.PHOENIX_FLAMES_TALENT.id);
    const spellId = event.ability.guid;

    if (!hasCombustion) {
      return;
    }

    //Check to see if Fireball was started or completed during Combustion
    if (spellId === SPELLS.FIREBALL.id && event.type === "begincast") {
      this.fireballCastsStarted += 1;
    } else if (spellId === SPELLS.FIREBALL.id && event.type === "cast") {
      const inefficientCastReason = `This Fireball was cast during Combustion. Since Combustion has a short duration, you are better off using your instant abilities to get as many instant/free Pyroblasts as possible. If you run out of instant abilities, cast Scorch instead since it has a shorter cast time.`;
      this.fireballCastsCompleted += 1;
      this.castEvent = event;
      this.flagTimeline(inefficientCastReason);
    }

    //On Scorch casts, check to see how many charges of Fire Blast/Phoenix Flames were available
    const chargesAvailable = (fireBlastCharges > 0 || phoenixFlamesCharges > 0);
    if (spellId === SPELLS.SCORCH.id && event.type === "begincast" && chargesAvailable) {
      this.scorchCastsStarted += 1;
      debug && this.log("Cast started with instants available");
    } else if (spellId === SPELLS.SCORCH.id && event.type === "cast" && chargesAvailable) {
      const inefficientCastReason = `This Scorch was cast during Combustion while an instant cast ability like Fire Blast ${this.hasPhoenixFlames ? 'or Phoenix Flames' : '' } was available. Unless you have the Blaster Master trait, make sure you are using your instant abilities first before hard casting Scorch. `;
      this.scorchCastsCompleted += 1;
      this.castEvent = event;
      this.flagTimeline(inefficientCastReason);
      debug && this.log("Cast completed with instants available");   
    }
  }

  //The Combustion Cast/Apply Buff event uses the Players Health/Max Health instead of the target, so we need to check the first direct damage event during combustion to get the target's health. If above 90% then Combustion was cast during Firestarter, which is a waste.
  onDamage(event: any) {
    const hasCombustion = this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id);
    if (!hasCombustion || !this.combustionCast) {
      return;
    }

    this.combustionCast = false;
    if (event.hitPoints > 0) {
      this.healthPercent = event.hitPoints / event.maxHitPoints;
    }
    if (this.healthPercent > FIRESTARTER_HEALTH_THRESHOLD) {
      const inefficientCastReason = `This Combustion was cast while Firestarter was active. Firestarter makes all your spells guaranteed to crit while the target is above 90% health, so stacking Combustion on top of that is a waste. Instead, you should wait until the target is at 89% before you cast Combustion. `;
      this.combustionDuringFirestarter = true;
      this.flagTimeline(inefficientCastReason);
      debug && this.log("Combustion Used During Firestarter");
    }
  }

  flagTimeline(inefficientCastReason: string) {
    this.castEvent.meta = this.castEvent.meta || {};
    this.castEvent.meta.isInefficientCast = true;
    this.castEvent.meta.inefficientCastReason = inefficientCastReason;
  }

  get phoenixFlamesChargeUtil() {
    return 1 - (this.lowPhoenixFlamesCharges / this.abilityTracker.getAbility(SPELLS.COMBUSTION.id).casts);
  }

  get fireBlastChargeUtil() {
    return 1 - (this.lowFireBlastCharges / this.abilityTracker.getAbility(SPELLS.COMBUSTION.id).casts);
  }

  get badScorchesPerCombustion() {
    return this.scorchCastsStarted / this.combustionCasts;
  }

  get fireballCastsPerCombustion() {
    return this.fireballCastsStarted / this.combustionCasts;
  }

  get combustionCasts() {
    return this.abilityTracker.getAbility(SPELLS.COMBUSTION.id).casts;
  }

  get phoenixFlamesThresholds() {
    return {
    actual: this.phoenixFlamesChargeUtil,
      isLessThan: {
        minor: 1,
        average: .65,
        major: .45,
      },
      style: 'percentage',
    };
  }

  get fireBlastThresholds() {
    return {
      actual: this.fireBlastChargeUtil,
      isLessThan: {
        minor: 1,
        average: .65,
        major: .45,
      },
      style: 'percentage',
    };
  }

  get firestarterSuggestionThresholds() {
    return {
      actual: this.combustionDuringFirestarter,
      isEqual: true,
      style: 'boolean',
    };
  }

  get scorchDuringCombustionThresholds() {
    return {
      actual: this.badScorchesPerCombustion,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: 'number',
    };
  }

  get fireballDuringCombustionThresholds() {
    return {
      actual: this.fireballCastsPerCombustion,
      isGreaterThan: {
        minor: 0,
        average: 0.5,
        major: 1,
      },
      style: 'number',
    };
  }

  suggestions(when: any) {
    if (this.hasPhoenixFlames) {
      when(this.phoenixFlamesThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>You cast <SpellLink id={SPELLS.COMBUSTION.id} /> {this.lowPhoenixFlamesCharges} times with less than 2 charges of <SpellLink id={SPELLS.PHOENIX_FLAMES_TALENT.id} />. Make sure you are saving at least 2 charges while Combustion is on cooldown so you can get as many <SpellLink id={SPELLS.HOT_STREAK.id} /> procs as possible before Combustion ends.</>)
          .icon(SPELLS.COMBUSTION.icon)
          .actual(`${formatPercentage(this.phoenixFlamesChargeUtil)}% Utilization`)
          .recommended(`${formatPercentage(recommended)} is recommended`);
      });
    }
    when(this.fireBlastThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>You cast <SpellLink id={SPELLS.COMBUSTION.id} /> {this.lowFireBlastCharges} times with less than {this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? '2' : '1' } charges of <SpellLink id={SPELLS.FIRE_BLAST.id} />. Make sure you are saving at least {this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? '2' : '1' } charges while Combustion is on cooldown so you can get as many <SpellLink id={SPELLS.HOT_STREAK.id} /> procs as possible before Combustion ends.</>)
          .icon(SPELLS.COMBUSTION.icon)
          .actual(`${formatPercentage(this.fireBlastChargeUtil)}% Utilization`)
          .recommended(`${formatPercentage(recommended)} is recommended`);
      });
    when(this.firestarterSuggestionThresholds)
      .addSuggestion((suggest: any) => {
        return suggest(<>You used <SpellLink id={SPELLS.COMBUSTION.id} /> while <SpellLink id={SPELLS.FIRESTARTER_TALENT.id} /> was active (While the boss was at 90% health or higher). Since Firestarter makes your spells a guaranteed crit anyway, you should wait until the boss is at 89% to use your Combustion.</>)
          .icon(SPELLS.COMBUSTION.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
      });
    when(this.scorchDuringCombustionThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>You started to cast <SpellLink id={SPELLS.SCORCH.id} /> {this.scorchCastsStarted} times ({this.badScorchesPerCombustion.toFixed(2)} per Combustion), and completed {this.scorchCastsCompleted} casts, while you had charges of <SpellLink id={SPELLS.FIRE_BLAST.id} /> {this.hasPhoenixFlames ? <> or <SpellLink id={SPELLS.PHOENIX_FLAMES_TALENT.id} /> </> : '' } available. Unless you have the <SpellLink id={SPELLS.BLASTER_MASTER.id} /> trait, make sure you are using up all of your charges of Fire Blast {this.hasPhoenixFlames ? ' and Phoenix Flames' : '' } before using Scorch during Combustion.</>)
          .icon(SPELLS.COMBUSTION.icon)
          .actual(`${this.badScorchesPerCombustion.toFixed(2)} Casts Per Combustion`)
          .recommended(`${formatNumber(recommended)} is recommended`);
      });
    when(this.fireballDuringCombustionThresholds)
    .addSuggestion((suggest: any, actual: any, recommended: any) => {
      return suggest(<>You started to cast <SpellLink id={SPELLS.FIREBALL.id} /> {this.fireballCastsStarted} times ({this.fireballCastsPerCombustion.toFixed(2)} per Combustion), and completed {this.fireballCastsCompleted} casts, during <SpellLink id={SPELLS.COMBUSTION.id} />. Combustion has a short duration, so you are better off using instant abilities like <SpellLink id={SPELLS.FIRE_BLAST.id} /> {this.hasPhoenixFlames ? <>or <SpellLink id={SPELLS.PHOENIX_FLAMES_TALENT.id} /></> : '' }. If you run out of instant cast abilities, use <SpellLink id={SPELLS.SCORCH.id} /> instead of Fireball since it has a shorter cast time.</>)
        .icon(SPELLS.COMBUSTION.icon)
        .actual(`${this.fireballCastsPerCombustion.toFixed(2)} Casts Per Combustion`)
        .recommended(`${formatNumber(recommended)} is recommended`);
    });
  }
}
export default Combustion;
