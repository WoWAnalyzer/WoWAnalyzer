import TALENTS from 'common/TALENTS/mage';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, GetRelatedEvents } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS';

export const MAX_TICKS = 4;

export default class ShiftingPowerArcane extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    enemies: Enemies,
  };

  protected spellUsable!: SpellUsable;
  protected enemies!: Enemies;

  hasArcaneSurge: boolean = this.selectedCombatant.hasTalent(TALENTS.ARCANE_SURGE_TALENT);
  hasTouchOfTheMagi: boolean = this.selectedCombatant.hasTalent(TALENTS.TOUCH_OF_THE_MAGI_TALENT);
  hasEvocation: boolean = this.selectedCombatant.hasTalent(TALENTS.EVOCATION_TALENT);

  casts: ShiftingPowerCast[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SHIFTING_POWER_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SHIFTING_POWER_TALENT),
      this.onShiftingPower,
    );
  }

  onShiftingPower(event: CastEvent) {
    const ordinal = this.casts.length + 1;
    const timestamp = event.timestamp;
    const ticks = GetRelatedEvents(event, 'SpellTick').length;
    const spellsReduced = {
      arcaneSurge: this.spellUsable.isOnCooldown(TALENTS.ARCANE_SURGE_TALENT.id),
      touchOfTheMagi: this.spellUsable.isOnCooldown(TALENTS.TOUCH_OF_THE_MAGI_TALENT.id),
      evocation: this.spellUsable.isOnCooldown(TALENTS.EVOCATION_TALENT.id),
    };
    const cdsActive = {
      arcaneSurge: this.selectedCombatant.hasBuff(SPELLS.ARCANE_SURGE_BUFF.id),
      touchOfTheMagi: this.enemies.hasBuffOnAny(SPELLS.TOUCH_OF_THE_MAGI_DEBUFF.id),
      siphonStorm: this.selectedCombatant.hasBuff(SPELLS.SIPHON_STORM_BUFF.id),
    };

    this.casts.push({
      ordinal,
      timestamp,
      ticks,
      spellsReduced,
      cdsActive,
    });
  }
}

export interface ShiftingPowerCast {
  ordinal: number;
  timestamp: number;
  ticks: number;
  spellsReduced: { arcaneSurge: boolean; touchOfTheMagi: boolean; evocation: boolean };
  cdsActive: { arcaneSurge: boolean; touchOfTheMagi: boolean; siphonStorm: boolean };
}
