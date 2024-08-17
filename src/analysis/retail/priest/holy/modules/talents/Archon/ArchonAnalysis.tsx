import SPELLS from 'common/SPELLS';
//import { formatPercentage, formatNumber } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
//import Statistic from 'parser/ui/Statistic';
//import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
//import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
//import { SpellLink } from 'interface';
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
 * Honestly I was told a lot of holy priest should get rewritten and had difficulty following some of the core
 * so I tried to contain all archon analysis into just this file, and using functions to pass out
 * the data to the statistic publishers.
 *
 */
const EMPOWERED_SURGES_AMP = 0.3;
const APOTH_MULTIPIER = 3;
const ENERGY_CYCLE_CDR = 4;
const LIGHT_OF_THE_NAARU_REDUCTION_PER_RANK = 0.1;
const TWW_TIER1_CDR = 0.1;
const PERFECTED_FORM_BUFF_ID = 453983;
//10% INCREASE
const PERFECTED_FORM_AMP = 0.1;
const RESONANT_ENERGY_ID = 453846;
const RESONANT_ENERGY_AMP_PER_STACK = 0.02;

//https://www.warcraftlogs.com/reports/WT19GKp2VHqLarbD#fight=19``&type=auras&source=122
class ArchonAnalysis extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  protected combatants!: Combatants;

  surgeOfLightProcsSpent = 0;
  surgeOfLightProcsOverwritten = 0;
  surgeOfLightProcsOverwrittenByHalo = 0;
  surgeOfLightProcsGainedFromHalo = 0;
  empoweredSurgesActive = false;
  empoweredSurgesHealing = 0;
  manifestedPowerActive = false;
  energyCycleActive = false;
  energyCycleCDRIdeal = 0;
  energyCycleCDRActual = 0;

  baseHolyWordCDR = 1;
  modHolyWordCDR = 1;
  apothBuffActive = false;
  /** Total healing from salvation buff */
  perfectedFormSalv = 0;
  /** Total healing from apoth buff */
  perfectedFormApoth = 0;
  /** Total Healing From Resonant Energy */
  resonantEnergyHealing = 0;

  constructor(options: Options) {
    super(options);

    //if the capstone is active, then all the analyzed hero talents will be active too
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.DIVINE_HALO_TALENT);

    // these two if statements get the scaling CDR for holy word reduction
    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.LIGHT_OF_THE_NAARU_TALENT)) {
      this.baseHolyWordCDR =
        this.selectedCombatant.getTalentRank(TALENTS_PRIEST.LIGHT_OF_THE_NAARU_TALENT) *
          LIGHT_OF_THE_NAARU_REDUCTION_PER_RANK +
        1;
    }
    if (this.selectedCombatant.has2PieceByTier(TIERS.TWW1)) {
      this.baseHolyWordCDR *= TWW_TIER1_CDR + 1;
    }

    //tracks usage of Surge of Light
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onSurgeOfLightHeal,
    );

    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onSurgeOfLightHeal,
    );

    //gains of Surge of light, not just from manifested power
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
  }

  onSurgeOfLightHeal(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    // linked heal event exists
    const healEvent = getHealFromSurge(event);
    if (healEvent) {
      if (buffedBySurgeOfLight(event)) {
        // calculate effective healing from bonus
        this.empoweredSurgesHealing += calculateEffectiveHealing(healEvent, EMPOWERED_SURGES_AMP);
        this.surgeOfLightProcsSpent += 1;
        //        if(this.energyCycleActive){
        this.modHolyWordCDR = this.baseHolyWordCDR;
        if (this.apothBuffActive) {
          this.modHolyWordCDR *= APOTH_MULTIPIER;
        }
        this.energyCycleCDRIdeal += ENERGY_CYCLE_CDR * this.modHolyWordCDR;
        this.energyCycleCDRActual += this.spellUsable.reduceCooldown(
          SPELLS.HOLY_WORD_SANCTIFY.id,
          ENERGY_CYCLE_CDR * this.modHolyWordCDR,
        );
        //        }
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
  }

  applyApoth() {
    this.apothBuffActive = true;
  }
  removeApoth() {
    this.apothBuffActive = false;
  }

  onPerfectedFormHeal(event: HealEvent) {
    if (
      this.selectedCombatant.hasBuff(PERFECTED_FORM_BUFF_ID, null, 0, 0, this.selectedCombatant.id)
    ) {
      this.perfectedFormSalv += calculateEffectiveHealing(event, PERFECTED_FORM_AMP);
    }
    //Apoth only gets the buff when Perfected Form from Salv isn't active
    else if (
      !this.selectedCombatant.hasBuff(
        PERFECTED_FORM_BUFF_ID,
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

    const resonantEnergyStacks = this.selectedCombatant.getBuffStacks(
      RESONANT_ENERGY_ID,
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

  //PERFECTED FORM STATISTICS
  get totalPerfectedFormHealing(): number {
    return this.perfectedFormApoth + this.perfectedFormSalv;
  }
  //ENERGY CYCLE VALUES
  get wastedEnergyCycleCDR(): number {
    return this.energyCycleCDRIdeal - this.energyCycleCDRActual;
  }

  get actualEnergyCycleCDR(): number {
    return this.energyCycleCDRActual;
  }

  //TODO: This Surge of Light Analysis is more accurate than whats currently in the module
  //      potentially either break it out or export these values over

  /* statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <><li>
            Surge of Light procs spent -{' '}
            <strong>
              {this.surgeOfLightProcsSpent}
              
            </strong>
            </li>
            <li>
            Surge of Light overwritten -{' '}
            <strong>
              {this.surgeOfLightProcsOverwritten}
              
            </strong>
            </li>
            <li>
            Surge of Light procs gained from Halo -{' '}
            <strong>
              {this.surgeOfLightProcsGainedFromHalo}
              
            </strong>
            </li>
            <li>
            Surge of Light Halo procs overwritten -{' '}
            <strong>
              {this.surgeOfLightProcsOverwrittenByHalo}
              
            </strong>
            </li>
            <li>
            Total seconds of CDR from Energy Cycle -{' '}
            <strong>
              {this.energyCycleCDRActual}
              
            </strong>
            </li>
            <li>
            Wasted seconds of CDR from Energy Cycle -{' '}
            <strong>
              {this.wastedEnergyCycleCDR}
              
            </strong>
            </li>
          </>
          
        }
      >
          <>{this.manifestedPowerActive ? (
              <>{'\n  '}
                <small>
                  <SpellLink spell={TALENTS_PRIEST.MANIFESTED_POWER_TALENT} /> gained {' '}
                </small>
                <strong>{this.surgeOfLightProcsGainedFromHalo}</strong>
                <small> Surge of Lights and was overwritten{' '} </small>
                <strong>{this.surgeOfLightProcsOverwrittenByHalo}</strong>
                <small> times from Halo </small>
              </>
            ) : (
              <></>
            )}
            {this.empoweredSurgesActive ? (
              <>{'\n'}
                <small>
                  <SpellLink spell={TALENTS_PRIEST.EMPOWERED_SURGES_TALENT} /> contributed{' '}
                </small>
                <strong>
                  {formatNumber((this.empoweredSurgesHealing / this.owner.fightDuration) * 1000)}{' '}
                  HPS
                </strong>
                <small>
                  {' '}
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.empoweredSurgesHealing),
                  )}
                  % of total
                </small>
              </>
            ) : (
              <></>
            
            )}
        </>
      </Statistic>
    );
  } */
}

export default ArchonAnalysis;
