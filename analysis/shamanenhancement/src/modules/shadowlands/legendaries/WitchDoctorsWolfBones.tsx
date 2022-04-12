import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  EventType,
  RefreshBuffEvent,
} from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class WitchDoctorsWolfBones extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  protected lastTimestamp = 0;
  protected hasApplyBuffInThisTimestamp = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.WITCH_DOCTORS_WOLF_BONES);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.reduceFeralSpirityCooldown,
    );

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.reduceFeralSpirityCooldown,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.reduceFeralSpirityCooldown,
    );
  }

  reduceFeralSpirityCooldown(event: ApplyBuffStackEvent | ApplyBuffEvent | RefreshBuffEvent) {
    if (event.timestamp !== this.lastTimestamp) {
      this.hasApplyBuffInThisTimestamp = false;
    }

    if (event.type === EventType.RefreshBuff && this.hasApplyBuffInThisTimestamp) {
      return;
    }

    if (event.type === EventType.ApplyBuff || event.type === EventType.ApplyBuffStack) {
      this.hasApplyBuffInThisTimestamp = true;
    }

    if (this.spellUsable.isOnCooldown(SPELLS.FERAL_SPIRIT.id)) {
      this.spellUsable.reduceCooldown(SPELLS.FERAL_SPIRIT.id, 2000, event.timestamp);
    }

    this.lastTimestamp = event.timestamp;
  }
}

export default WitchDoctorsWolfBones;
