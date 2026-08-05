import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/paladin';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';

/**
 * Holy Power overcap inside the damage cooldown window.
 *
 * During the wings window Hammer of Wrath replaces Judgment, which floods Holy Power
 * generation. Avoiding overcap there is a substantially harder problem than it is in the
 * normal rotation, so the two are tracked separately - a player's overall waste figure
 * hides how they do in the window that actually matters.
 *
 * Sentinel is a talent replacement for Avenging Wrath rather than an additional cooldown,
 * so the window is resolved to whichever the player actually has. Hard-coding Avenging
 * Wrath would silently make every check a no-op for a Sentinel build.
 */
export default class WingsHolyPower extends Analyzer {
  /** The cooldown this player actually uses - Sentinel replaces Avenging Wrath. */
  wingsSpell: Spell;

  generatedInWings = 0;
  wastedInWings = 0;
  generatedOutsideWings = 0;
  wastedOutsideWings = 0;

  constructor(options: Options) {
    super(options);

    const hasSentinel = this.selectedCombatant.hasTalent(TALENTS.SENTINEL_TALENT);
    this.wingsSpell = hasSentinel ? SPELLS.SENTINEL : TALENTS.AVENGING_WRATH_TALENT;
    this.active = hasSentinel || this.selectedCombatant.hasTalent(TALENTS.AVENGING_WRATH_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.onHolyPowerGained);
  }

  private onHolyPowerGained(event: ResourceChangeEvent) {
    if (event.resourceChangeType !== RESOURCE_TYPES.HOLY_POWER.id) {
      return;
    }

    const gained = event.resourceChange;
    const wasted = event.waste;

    if (this.selectedCombatant.hasBuff(this.wingsSpell.id, event.timestamp)) {
      this.generatedInWings += gained;
      this.wastedInWings += wasted;
    } else {
      this.generatedOutsideWings += gained;
      this.wastedOutsideWings += wasted;
    }
  }

  get percentWastedInWings() {
    return this.generatedInWings === 0 ? 0 : this.wastedInWings / this.generatedInWings;
  }

  get percentWastedOutsideWings() {
    return this.generatedOutsideWings === 0
      ? 0
      : this.wastedOutsideWings / this.generatedOutsideWings;
  }

  /** Share of all Holy Power waste that happened inside the window. */
  get shareOfWasteInWings() {
    const total = this.wastedInWings + this.wastedOutsideWings;
    return total === 0 ? 0 : this.wastedInWings / total;
  }
}
