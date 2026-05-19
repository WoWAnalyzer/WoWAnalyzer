import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { MISTWEAVER_HEART_SPELLS, WINDWALKER_HEART_SPELLS } from '../constants';

const HEART_COOLDOWN_RATE = 0.75;

export const HEART_BUFFS = [
  SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF,
  SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY,
  SPELLS.HEART_OF_THE_JADE_SERPENT_AVATAR,
];

class HeartOfTheJadeSerpent extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  isMW = true;

  constructor(options: Options) {
    super(options);

    this.isMW = this.selectedCombatant.specId === SPECS.MISTWEAVER_MONK.id;
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(HEART_BUFFS),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(HEART_BUFFS),
      this.onRemoveBuff,
    );
  }

  protected rateChange(abilityId: number): number {
    const unity = abilityId === SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY.id;
    return (unity ? 2 : 1) * HEART_COOLDOWN_RATE;
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    const rateChange = 1 + this.rateChange(event.ability.guid);

    this.isMW
      ? this.spellUsable.applyCooldownRateChange(
          MISTWEAVER_HEART_SPELLS(
            this.selectedCombatant.hasTalent(TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT),
          ),
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
    const rateChange = 1 + this.rateChange(event.ability.guid);

    this.isMW
      ? this.spellUsable.removeCooldownRateChange(
          MISTWEAVER_HEART_SPELLS(
            this.selectedCombatant.hasTalent(TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT),
          ),
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
