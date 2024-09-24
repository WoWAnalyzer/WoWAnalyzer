import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { MISTWEAVER_HEART_SPELLS, WINDWALKER_HEART_SPELLS } from '../constants';

const HEART_COOLDOWN_RATE = 0.75;

class HeartOfTheJadeSerpent extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  isMW: boolean = true;

  constructor(options: Options) {
    super(options);
    this.isMW = this.selectedCombatant.specId === SPECS.MISTWEAVER_MONK.id;
    //only enabling for mistweaver for now until support comes for Windwalker
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT) && this.isMW;

    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF, SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY]),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF, SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY]),
      this.onRemoveBuff,
    );
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    const unity = event.ability.guid === SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY.id;
    const rateChange = 1 + (unity ? 2 : 1) * HEART_COOLDOWN_RATE;

    this.isMW
      ? this.spellUsable.applyCooldownRateChange(
          MISTWEAVER_HEART_SPELLS,
          rateChange,
          event.timestamp,
        )
      : this.spellUsable.applyCooldownRateChange(
          WINDWALKER_HEART_SPELLS,
          rateChange,
          event.timestamp,
        );
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    const unity = event.ability.guid === SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY.id;
    const rateChange = 1 + (unity ? 2 : 1) * HEART_COOLDOWN_RATE;

    this.isMW
      ? this.spellUsable.removeCooldownRateChange(
          MISTWEAVER_HEART_SPELLS,
          rateChange,
          event.timestamp,
        )
      : this.spellUsable.removeCooldownRateChange(
          WINDWALKER_HEART_SPELLS,
          rateChange,
          event.timestamp,
        );
  }
}

export default HeartOfTheJadeSerpent;
