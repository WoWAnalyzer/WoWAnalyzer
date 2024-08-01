import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, GetRelatedEvents } from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import ArcaneChargeTracker from './ArcaneChargeTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const TEMPO_REMAINING_THRESHOLD = 5000;
const NETHER_STACK_THRESHOLD = 1;
const TOUCH_CD_THRESHOLD = 6000;
const EVOCATION_CD_THRESHOLD = 45000;
const MANA_THRESHOLD = 0.7;
const AOE_THRESHOLD = 3;

class ArcaneBarrage extends Analyzer {
  static dependencies = {
    arcaneChargeTracker: ArcaneChargeTracker,
    spellUsable: SpellUsable,
  };

  protected arcaneChargeTracker!: ArcaneChargeTracker;
  protected spellUsable!: SpellUsable;

  hasArcaneTempo: boolean = this.selectedCombatant.hasTalent(TALENTS.ARCANE_TEMPO_TALENT);
  hasNetherPrecision: boolean = this.selectedCombatant.hasTalent(TALENTS.NETHER_PRECISION_TALENT);

  barrageCasts: {
    cast: number;
    tempoRemaining?: number;
    netherPrecisionStacks?: number;
    touchCD: number;
    evocationCD: number;
    clearcasting: boolean;
    arcaneOrbAvail: boolean;
    charges: number;
    targetsHit: number;
    mana?: number;
    usage?: BoxRowEntry;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TOUCH_OF_THE_MAGI_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_BARRAGE),
      this.onBarrage,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onBarrage(event: CastEvent) {
    const tempo = this.selectedCombatant.getBuff(SPELLS.ARCANE_TEMPO_BUFF.id);
    const netherPrecision = this.selectedCombatant.getBuff(SPELLS.NETHER_PRECISION_BUFF.id);
    const touchCD = this.spellUsable.cooldownRemaining(TALENTS.TOUCH_OF_THE_MAGI_TALENT.id);
    const evocationCD = this.spellUsable.cooldownRemaining(TALENTS.EVOCATION_TALENT.id);
    const charges = this.arcaneChargeTracker.charges;
    const targetsHit = GetRelatedEvents(event, 'SpellDamage').length;
    const resource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.MANA.id,
    );
    const manaPercent = resource && resource.amount / resource.max;

    this.barrageCasts.push({
      cast: event.timestamp,
      tempoRemaining: this.hasArcaneTempo && tempo ? event.timestamp - tempo.start : undefined,
      netherPrecisionStacks:
        this.hasNetherPrecision && netherPrecision ? netherPrecision.stacks : undefined,
      touchCD: touchCD || 0,
      evocationCD: evocationCD || 0,
      clearcasting: this.selectedCombatant.hasBuff(
        SPELLS.CLEARCASTING_ARCANE.id,
        event.timestamp - 10,
      ),
      arcaneOrbAvail: this.spellUsable.isAvailable(SPELLS.ARCANE_ORB.id),
      charges: charges,
      targetsHit: targetsHit || 0,
      mana: manaPercent,
    });
  }

  onFightEnd() {
    this.analyzeBarrage();
  }

  analyzeBarrage = () => {
    this.barrageCasts.forEach((b) => {
      // If Arcane Tempo was about to expire, then casting Arcane Barrage to refresh it was good.
      if (this.hasArcaneTempo && b.tempoRemaining && b.tempoRemaining < TEMPO_REMAINING_THRESHOLD) {
        b.usage = {
          value: QualitativePerformance.Good,
          tooltip: `Arcane Tempo would have expired in ${formatDuration(b.tempoRemaining)}`,
        };
        return;
      }

      // If Touch of the Magi was about to come off cooldown, then Arcane Barrage should have been held for Touch of the Magi
      if (b.touchCD && b.touchCD < TOUCH_CD_THRESHOLD) {
        b.usage = {
          value: QualitativePerformance.Fail,
          tooltip: `Cast with ${formatDuration(b.touchCD)} until Touch of the Magi comes off cooldown.`,
        };
        return;
      }

      // If one of the below are true
      // Evocation will be off cooldown within the next 45 seconds
      // The player is above 70% mana (in single target)
      // And also one of the below are false
      // The player has 4 Arcane Charges
      // The player has Nether Precision and it has 1 Stack left
      // The player has either a Clearcasting Proc or a charge of Arcane Orb
      // Minor: The player did not have 13 stacks of Arcane Harmony (not included)
      // Then count it as a mistake
      const evocationCheck = b.evocationCD < EVOCATION_CD_THRESHOLD;
      const manaCheckST = b.targetsHit < AOE_THRESHOLD && b.mana && b.mana > MANA_THRESHOLD;
      if (evocationCheck || manaCheckST) {
        if (b.charges !== 4) {
          b.usage = {
            value: QualitativePerformance.Fail,
            tooltip: `Mana: ${formatPercentage(b.mana || 1)}%, Evocation CD: ${formatDuration(b.evocationCD)}. Player does not have 4 Arcane Charges.`,
          };
          return;
        } else if (!this.hasNetherPrecision || b.netherPrecisionStacks !== NETHER_STACK_THRESHOLD) {
          b.usage = {
            value: QualitativePerformance.Fail,
            tooltip: `Mana: ${formatPercentage(b.mana || 1)}%, Evocation CD: ${formatDuration(b.evocationCD)}. Player either doesnt have Nether Precision, or it didnt have 1 Stack.`,
          };
          return;
        } else if (!b.clearcasting && !b.arcaneOrbAvail) {
          b.usage = {
            value: QualitativePerformance.Fail,
            tooltip: `Mana: ${formatPercentage(b.mana || 1)}%, Evocation CD: ${formatDuration(b.evocationCD)}. Player does not have Clearcasting or an Arcane Orb charge.`,
          };
          return;
        } else {
          b.usage = {
            value: QualitativePerformance.Good,
            tooltip: `Player had 4 Arcane Charges, 1 Stack of Nether Precision, and either Clearcasting or Arcane Orb.`,
          };
          return;
        }
      }

      // If Evocation is coming off cooldown in the next 45s, then you should be burning your mana
      // as evocation will be channeled before your upcoming major burn.
      if (b.evocationCD < EVOCATION_CD_THRESHOLD) {
        b.usage = {
          value: QualitativePerformance.Fail,
          tooltip: `Evocation was coming off cooldown in ${formatDuration(b.evocationCD)}.`,
        };
        return;
      }

      // If it is Single Target and the player was above the mana threshold, then they should have continued casting Arcane Blast and Arcane Missiles.
      if (b.targetsHit < AOE_THRESHOLD && b.mana && b.mana > MANA_THRESHOLD) {
        b.usage = {
          value: QualitativePerformance.Fail,
          tooltip: `Player was at ${formatPercentage(b.mana)}% mana.`,
        };
        return;
      }

      // If it is AOE and the player had less than 4 Arcane Charges, then they should have continued until they had 4 charges.
      if (b.targetsHit >= AOE_THRESHOLD && b.charges !== 4) {
        b.usage = {
          value: QualitativePerformance.Fail,
          tooltip: `Player had ${b.charges} Arcane Charges in AOE.`,
        };
        return;
      }

      b.usage = { value: QualitativePerformance.Good, tooltip: `Good Arcane Barrage Cast.` };
    });
  };
}

export default ArcaneBarrage;
