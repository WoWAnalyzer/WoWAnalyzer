import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class FaelineStompHealing extends Analyzer {
  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  flsCasts = 0;
  flsHealing = 0;
  efHealing = 0;

  flsOverhealing = 0;
  efOverhealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FAELINE_STOMP_CAST),
      this.casts,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FAELINE_STOMP_DAMAGE_AND_HEAL),
      this.stompHeal,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FAELINE_STOMP_ESSENCE_FONT),
      this.efHeal,
    );
  }

  casts() {
    this.flsCasts += 1;
  }

  stompHeal(event: HealEvent) {
    this.flsHealing += event.amount + (event.absorbed || 0);
    this.flsOverhealing += event.overheal || 0;
  }

  efHeal(event: HealEvent) {
    this.efHealing += event.amount + (event.absorbed || 0);
    this.efOverhealing += event.overheal || 0;
  }
}

export default FaelineStompHealing;
