import SPECS from 'game/SPECS';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { GetRelatedEvent, RemoveBuffEvent, DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class ExcessFrost extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EXCESS_FROST_TALENT);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.EXCESS_FROST_BUFF),
      this.excessFrostRemoved,
    );
  }

  excessFrostRemoved(event: RemoveBuffEvent) {
    if (
      this.selectedCombatant.spec === SPECS.FIRE_MAGE &&
      this.selectedCombatant.hasTalent(TALENTS.METEOR_TALENT)
    ) {
      const phoenix: DamageEvent | undefined = GetRelatedEvent(event, 'SpellDamage');
      phoenix && this.spellUsable.reduceCooldown(TALENTS.METEOR_TALENT.id, 5000);
    }

    if (
      this.selectedCombatant.spec === SPECS.FROST_MAGE &&
      this.selectedCombatant.hasTalent(TALENTS.COMET_STORM_TALENT)
    ) {
      const flurry: DamageEvent | undefined = GetRelatedEvent(event, 'SpellDamage');
      flurry && this.spellUsable.reduceCooldown(TALENTS.COMET_STORM_TALENT.id, 5000);
    }
  }
}

export default ExcessFrost;
