import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ApplyDebuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class FlameAndFrost extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FLAME_AND_FROST_TALENT);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.CAUTERIZED_DEBUFF),
      this.onCauterize,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COLD_SNAP), this.onColdSnap);
  }

  onCauterize(event: ApplyDebuffEvent) {
    this.spellUsable.endCooldown(SPELLS.CONE_OF_COLD.id);
    this.spellUsable.endCooldown(SPELLS.FROST_NOVA.id, event.timestamp, true);
    this.spellUsable.endCooldown(TALENTS.RING_OF_FROST_TALENT.id);
    this.spellUsable.endCooldown(TALENTS.ICE_NOVA_TALENT.id);
  }

  onColdSnap(event: CastEvent) {
    this.spellUsable.endCooldown(SPELLS.FIRE_BLAST.id);
    this.spellUsable.endCooldown(TALENTS.BLAST_WAVE_TALENT.id);
    this.spellUsable.endCooldown(TALENTS.DRAGONS_BREATH_TALENT.id);
  }
}

export default FlameAndFrost;
