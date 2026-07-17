import SPELLS from 'common/SPELLS';
import TALENTS_HUNTER from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class SteadyShot extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  effectiveFocusGain = 0;
  focusWasted = 0;

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.STEADY_SHOT_FOCUS),
      this.onEnergize,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STEADY_SHOT), this.onCast);
  }

  onCast(event: CastEvent) {
    if (this.spellUsable.isOnCooldown(TALENTS_HUNTER.AIMED_SHOT_TALENT.id)) {
      this.spellUsable.reduceCooldown(TALENTS_HUNTER.AIMED_SHOT_TALENT.id, 2000, event.timestamp);
    }
  }

  onEnergize(event: ResourceChangeEvent) {
    this.effectiveFocusGain += event.resourceChange - event.waste;
    this.focusWasted += event.waste;
  }
}

export default SteadyShot;
