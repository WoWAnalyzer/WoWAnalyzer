import { TALENTS_SHAMAN } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class WitchDoctorsAncestry extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  protected ranks: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.WITCH_DOCTORS_ANCESTRY_TALENT);

    if (!this.active) {
      return;
    }

    this.ranks = this.selectedCombatant.getTalentRank(TALENTS_SHAMAN.WITCH_DOCTORS_ANCESTRY_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.reduceFeralSpiritCooldown,
    );

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.reduceFeralSpiritCooldown,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.reduceFeralSpiritCooldown,
    );
  }

  private reduceFeralSpiritCooldown() {
    if (this.spellUsable.isOnCooldown(TALENTS_SHAMAN.FERAL_SPIRIT_TALENT.id)) {
      this.spellUsable.reduceCooldown(TALENTS_SHAMAN.FERAL_SPIRIT_TALENT.id, this.ranks * 1000);
    }
  }
}

export default WitchDoctorsAncestry;
