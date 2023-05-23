import { TALENTS_SHAMAN } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import CooldownIcon from 'interface/icons/Cooldown';
import { formatDuration } from 'common/format';

class WitchDoctorsAncestry extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  protected ranks: number = 0;
  protected totalCdrGained = 0;
  protected totalCdrWasted = 0;

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
      this.totalCdrGained += 2000;
    } else {
      this.totalCdrWasted += 2000;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS_SHAMAN.WITCH_DOCTORS_ANCESTRY_TALENT.id}>
          <>
            <CooldownIcon /> {formatDuration(this.totalCdrGained)}s{' '}
            <small> of Feral Spirit CDR</small>
            <br />
            <CooldownIcon /> {formatDuration(this.totalCdrWasted)}s{' '}
            <small> of Feral Spirit CDR wasted</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WitchDoctorsAncestry;
