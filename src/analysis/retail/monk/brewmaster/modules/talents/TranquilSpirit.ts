import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { GIFT_OF_THE_OX_SPELLS } from '../../constants';
import StaggerFabricator from '../core/StaggerFabricator';

const TRANQUIL_SPIRIT_RATE = 0.05;

export default class TranquilSpirit extends Analyzer {
  static dependencies = {
    staggerFab: StaggerFabricator,
  };

  protected staggerFab!: StaggerFabricator;
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(talents.TRANQUIL_SPIRIT_TALENT);

    this.addEventListener(
      Events.heal.spell([...GIFT_OF_THE_OX_SPELLS, SPELLS.EXPEL_HARM_TARGET_HEAL]),
      this.triggerTranquilSpirit,
    );
  }

  private triggerTranquilSpirit(event: HealEvent) {
    const amount = this.staggerFab.staggerPool * TRANQUIL_SPIRIT_RATE;
    this.staggerFab.removeStagger(event, amount);
  }
}
