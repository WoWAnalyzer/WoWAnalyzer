import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  DamageEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import { HOLY_ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../../constants';
import {
  getHealFromSurge,
  isSurgeOfLightFromHalo,
  buffedBySurgeOfLight,
} from '../../../normalizers/CastLinkNormalizer';
import { TALENTS_PRIEST } from 'common/TALENTS';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { TIERS } from 'game/TIERS';

/**
 * ARCHON HERO TREE
 *
 * I had a lot of difficulty following the core modules, and the talents kept overlapping so I
 * combined all archon analysis into (mostly) just this file, and use functions/valuerefs to pass out
 * the data to the statistic publishers.
 *
 * TODO:
 * -> Implement Sustained Potency/Concentrated Infusion
 * -> scale empowered surges by binding heal/trail
 *       -in theory this will already show in the binding heal/trail modules so maybe not worth
 * -> debate if I should scale down the first halo by energy compression
 *       -(since total is also amped it should be a similar ratio)
 * -> implement the better Surge of Light detection in here to spec wide
 *
 */
const EMPOWERED_SURGES_AMP = 0.3;
const APOTH_MULTIPIER = 4;
const ENERGY_CYCLE_CDR = 4;
const LIGHT_OF_THE_NAARU_REDUCTION_PER_RANK = 0.1;
const TWW_TIER1_2PC_CDR = 0.1;
const PERFECTED_FORM_AMP = 0.1;
const RESONANT_ENERGY_AMP_PER_STACK = 0.02;
const ENERGY_COMPRESSION_AMP = 0.3;

//https://www.warcraftlogs.com/reports/WT19GKp2VHqLarbD#fight=19``&type=auras&source=122
class ArchonAnalysis extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  protected combatants!: Combatants;

  /**
   * Start:
   * These values can all be called directly and don't need a pass function
   * also check the call functions in case math needs to be done to transform
   * the results
   */
  surgeOfLightProcsSpent = 0;
  surgeOfLightProcsGainedTotal = 0;
  surgeOfLightProcsOverwritten = 0;
  surgeOfLightProcsOverwrittenByHalo = 0;
  surgeOfLightProcsGainedFromHalo = 0;

  empoweredSurgesHealing = 0;

  //Energy Cycle Ideal - no lost CDR from capping used to calc lost CDR
  energyCycleCDRIdeal = 0;
  energyCycleCDRActual = 0;

  /** Total healing from perfected form's salvation buff */
  perfectedFormSalv = 0;
  /** Total healing from perfected form's apoth buff */
  perfectedFormApoth = 0;
  /** Total Healing From Resonant Energy */
  resonantEnergyHealing = 0;

  //These are the values from the first cast of halo
  //all 6 halos and how much energy compression scales them
  firstHaloHealing = 0;
  totalArchonHaloHealing = 0;
  totalEnergyCompressionHealing = 0;
  firstHaloDamage = 0;
  totalArchonHaloDamage = 0;

  // These are just internal values used as either flags or scalers
  private energyCompressionActive = false;
  private baseHolyWordCDR = 1;
  private modHolyWordCDR = 1;
  private apothBuffActive = false;
  private firstHalo = false;

  constructor(options: Options) {
    super(options);

    //if the capstone is active, then all the analyzed hero talents will be active too
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.DIVINE_HALO_TALENT);

    //Energy Compression is on a choice node
    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.ENERGY_COMPRESSION_TALENT)) {
      this.energyCompressionActive = true;
    }
    // these two if statements get the scaling CDR for holy word reduction
    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.LIGHT_OF_THE_NAARU_TALENT)) {
      this.baseHolyWordCDR =
        this.selectedCombatant.getTalentRank(TALENTS_PRIEST.LIGHT_OF_THE_NAARU_TALENT) *
          LIGHT_OF_THE_NAARU_REDUCTION_PER_RANK +
        1;
    }
    if (this.selectedCombatant.has2PieceByTier(TIERS.TWW1)) {
      this.baseHolyWordCDR *= TWW_TIER1_2PC_CDR + 1;
    }

    //tracks spending of Surge of Light
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onSurgeOfLightHeal,
    );

    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onSurgeOfLightHeal,
    );

    //tracks gains of Surge of light, not just from manifested power
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onApplySurgeOfLight,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onApplySurgeOfLight,
    );
    //tracks wasted Surge of Lights
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onRefreshSurgeOfLight,
    );

    //these are used to check if CDR needs to be scaled for Energy Cycle
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.APOTHEOSIS_TALENT),
      this.applyApoth,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.APOTHEOSIS_TALENT),
      this.removeApoth,
    );

    //perfected form healing
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(HOLY_ABILITIES_AFFECTED_BY_HEALING_INCREASES),
      this.onPerfectedFormHeal,
    );
    //Resonant Energy Healing
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(HOLY_ABILITIES_AFFECTED_BY_HEALING_INCREASES),
      this.onResonantEnergyHeal,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HALO_TALENT),
      this.newHaloCast,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HALO_HEAL),
      this.handleHaloHealing,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.HALO_DAMAGE),
      this.handleHaloDamage,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HALO_TALENT),
      this.removeArchonOut,
    );
  }

  onSurgeOfLightHeal(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    // linked heal event exists from surge of light consumption
    const healEvent = getHealFromSurge(event);

    if (healEvent) {
      if (buffedBySurgeOfLight(event)) {
        // calculate effective healing from bonus
        this.empoweredSurgesHealing += calculateEffectiveHealing(healEvent, EMPOWERED_SURGES_AMP);
        this.surgeOfLightProcsSpent += 1;

        // calculating energy cycle CDR
        // reset holy word mod to 1 and check what multipliers are active
        this.modHolyWordCDR = this.baseHolyWordCDR;
        if (this.apothBuffActive) {
          this.modHolyWordCDR *= APOTH_MULTIPIER;
        }

        this.energyCycleCDRIdeal += ENERGY_CYCLE_CDR * this.modHolyWordCDR;

        this.energyCycleCDRActual += this.spellUsable.reduceCooldown(
          SPELLS.HOLY_WORD_SANCTIFY.id,
          ENERGY_CYCLE_CDR * this.modHolyWordCDR,
        );
      }
    }
  }

  onRefreshSurgeOfLight(event: RefreshBuffEvent) {
    // surge of light used successfully (spending on 2 stacks counts as a refresh)
    if (1 === this.selectedCombatant.getBuffStacks(SPELLS.SURGE_OF_LIGHT_BUFF.id)) {
      return;
    }
    if (isSurgeOfLightFromHalo(event)) {
      this.surgeOfLightProcsOverwrittenByHalo += 1;
    } else {
      this.surgeOfLightProcsOverwritten += 1;
    }
  }

  onApplySurgeOfLight(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    // linked heal event exists
    if (isSurgeOfLightFromHalo(event)) {
      this.surgeOfLightProcsGainedFromHalo += 1;
    }
    this.surgeOfLightProcsGainedTotal += 1;
  }

  applyApoth() {
    this.apothBuffActive = true;
  }
  removeApoth() {
    this.apothBuffActive = false;
  }

  onPerfectedFormHeal(event: HealEvent) {
    if (
      this.selectedCombatant.hasBuff(
        SPELLS.PERFECTED_FORM_TALENT_BUFF.id,
        null,
        0,
        0,
        this.selectedCombatant.id,
      )
    ) {
      this.perfectedFormSalv += calculateEffectiveHealing(event, PERFECTED_FORM_AMP);
    }
    //Apoth only gets the buff when Perfected Form from Salv isn't active
    else if (
      !this.selectedCombatant.hasBuff(
        SPELLS.PERFECTED_FORM_TALENT_BUFF.id,
        null,
        0,
        0,
        this.selectedCombatant.id,
      ) &&
      this.selectedCombatant.hasBuff(
        TALENTS_PRIEST.APOTHEOSIS_TALENT.id,
        null,
        0,
        0,
        this.selectedCombatant.id,
      )
    ) {
      this.perfectedFormApoth += calculateEffectiveHealing(event, PERFECTED_FORM_AMP);
    }
  }

  onResonantEnergyHeal(event: HealEvent) {
    const target = this.combatants.getEntity(event);

    if (target === null) {
      return;
    }

    const resonantEnergyStacks = target.getBuffStacks(
      SPELLS.RESONANT_ENERGY_TALENT_BUFF.id,
      null,
      0,
      0,
      this.selectedCombatant.id,
    );
    this.resonantEnergyHealing += calculateEffectiveHealing(
      event,
      RESONANT_ENERGY_AMP_PER_STACK * resonantEnergyStacks,
    );
  }

  handleHaloHealing(event: HealEvent) {
    if (this.firstHalo) {
      this.firstHaloHealing += event.amount + (event.absorbed || 0);
    }

    this.totalArchonHaloHealing += event.amount + (event.absorbed || 0);

    if (this.energyCompressionActive) {
      this.totalEnergyCompressionHealing += calculateEffectiveHealing(
        event,
        ENERGY_COMPRESSION_AMP,
      );
    }
  }

  handleHaloDamage(event: DamageEvent) {
    if (this.firstHalo) {
      this.firstHaloDamage += event.amount + (event.absorbed || 0);
    }

    this.totalArchonHaloDamage += event.amount + (event.absorbed || 0);
  }

  newHaloCast(event: CastEvent) {
    this.firstHalo = true;
  }
  removeArchonOut() {
    this.firstHalo = false;
  }

  //PERFECTED FORM STATISTICS
  get passPerfectedFormHealing(): number {
    return this.perfectedFormApoth + this.perfectedFormSalv;
  }

  //ENERGY CYCLE VALUES
  get passWastedEnergyCycleCDR(): number {
    return this.energyCycleCDRIdeal - this.energyCycleCDRActual;
  }

  get passActualEnergyCycleCDR(): number {
    return this.energyCycleCDRActual;
  }

  // These functions return power surge/divine halo's contribution
  // compared to just the first halo (if you didn't have either archon talent)
  // aswell as energy compression
  get passHaloFirstAndCapStoneHealing(): number {
    return this.totalArchonHaloHealing - this.firstHaloHealing;
  }

  get passTotalEnergyCompressionHealing(): number {
    return this.totalEnergyCompressionHealing;
  }

  get passHaloFirstAndCapStoneDamage(): number {
    return this.totalArchonHaloDamage - this.firstHaloDamage;
  }

  get passTotalEnergyCompressionDamage(): number {
    return this.totalArchonHaloDamage * ENERGY_COMPRESSION_AMP;
  }
}

export default ArchonAnalysis;
