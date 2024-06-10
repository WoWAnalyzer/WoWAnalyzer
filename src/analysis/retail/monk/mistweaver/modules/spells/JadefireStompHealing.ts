import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class JadefireStompHealing extends Analyzer {
  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  jfsCasts = 0;
  jfsHealing = 0;
  jfsOverhealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.JADEFIRE_STOMP_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.JADEFIRE_STOMP_TALENT),
      this.casts,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.JADEFIRE_STOMP_HEAL),
      this.stompHeal,
    );
  }

  casts() {
    this.jfsCasts += 1;
  }

  stompHeal(event: HealEvent) {
    this.jfsHealing += event.amount + (event.absorbed || 0);
    this.jfsOverhealing += event.overheal || 0;
  }
}

export default JadefireStompHealing;
