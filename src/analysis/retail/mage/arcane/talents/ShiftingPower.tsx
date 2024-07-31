import TALENTS from 'common/TALENTS/mage';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, GetRelatedEvents } from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class ShiftingPowerArcane extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  hasArcaneSurge: boolean = this.selectedCombatant.hasTalent(TALENTS.ARCANE_SURGE_TALENT);
  hasTouchOfTheMagi: boolean = this.selectedCombatant.hasTalent(TALENTS.TOUCH_OF_THE_MAGI_TALENT);
  hasEvocation: boolean = this.selectedCombatant.hasTalent(TALENTS.EVOCATION_TALENT);

  shiftingPower: {
    cast: number;
    ticks: CastEvent[];
    spellsReduced: { arcaneSurge: boolean; touchOfTheMagi: boolean; evocation: boolean };
    usage?: BoxRowEntry;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SHIFTING_POWER_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SHIFTING_POWER_TALENT),
      this.onShiftingPower,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onShiftingPower(event: CastEvent) {
    const ticks: CastEvent[] = GetRelatedEvents(event, 'SpellTick');

    this.shiftingPower.push({
      cast: event.timestamp,
      ticks: ticks || [],
      spellsReduced: {
        arcaneSurge:
          this.hasArcaneSurge && this.spellUsable.isOnCooldown(TALENTS.ARCANE_SURGE_TALENT.id),
        touchOfTheMagi:
          this.hasTouchOfTheMagi &&
          this.spellUsable.isOnCooldown(TALENTS.TOUCH_OF_THE_MAGI_TALENT.id),
        evocation: this.hasEvocation && this.spellUsable.isOnCooldown(TALENTS.EVOCATION_TALENT.id),
      },
    });
  }

  onFightEnd() {
    this.analyzeShiftingPowers();
  }

  analyzeShiftingPowers = () => {
    this.shiftingPower.forEach((s) => {
      if (this.hasArcaneSurge && !s.spellsReduced.arcaneSurge) {
        s.usage = {
          value: QualitativePerformance.Fail,
          tooltip: `Arcane Surge was not on cooldown.`,
        };
      } else if (this.hasTouchOfTheMagi && !s.spellsReduced.touchOfTheMagi) {
        s.usage = {
          value: QualitativePerformance.Fail,
          tooltip: `Touch of the Magi was not on cooldown.`,
        };
      } else if (this.hasEvocation && !s.spellsReduced.evocation) {
        s.usage = { value: QualitativePerformance.Fail, tooltip: `Evocation was not on cooldown.` };
      } else if (s.ticks.length < 4) {
        s.usage = {
          value: QualitativePerformance.Fail,
          tooltip: `Missed ${4 - s.ticks.length} ticks`,
        };
      } else {
        s.usage = { value: QualitativePerformance.Fail, tooltip: `No Arcane Surge cast found` };
      }
    });
  };
}

export default ShiftingPowerArcane;
