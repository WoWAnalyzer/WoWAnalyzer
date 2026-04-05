import TALENTS from 'common/TALENTS/mage';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { RemoveBuffEvent } from 'parser/core/Events';

const REDUCTION_MS = 5000;

class BarrierDiffusion extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BARRIER_DIFFUSION_TALENT);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.PRISMATIC_BARRIER_TALENT),
      this.onBarrierRemoved,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.BLAZING_BARRIER_TALENT),
      this.onBarrierRemoved,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.ICE_BARRIER_TALENT),
      this.onBarrierRemoved,
    );
  }

  onBarrierRemoved(event: RemoveBuffEvent) {
    this.spellUsable.reduceCooldown(TALENTS.PRISMATIC_BARRIER_TALENT.id, REDUCTION_MS);
    this.spellUsable.reduceCooldown(TALENTS.BLAZING_BARRIER_TALENT.id, REDUCTION_MS);
    this.spellUsable.reduceCooldown(TALENTS.ICE_BARRIER_TALENT.id, REDUCTION_MS);
  }
}

export default BarrierDiffusion;
