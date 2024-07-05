import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const HEART_COOLDOWN_RATE = 0.75;

const MISTWEAVER_HEART_SPELLS = [
  TALENTS_MONK.RENEWING_MIST_TALENT.id,
  TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
  TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id,
  TALENTS_MONK.LIFE_COCOON_TALENT.id,
];

const WINDWALKER_HEART_SPELLS = [
  TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
  TALENTS_MONK.FISTS_OF_FURY_TALENT.id,
  TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT.id,
  TALENTS_MONK.WHIRLING_DRAGON_PUNCH_TALENT.id,
];

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
