import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import Events, { AbsorbedEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { formatNumber } from 'common/format';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class StoneBulwarkTotem extends Analyzer {
  totalEffectiveShielding = 0;
  casts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.STONE_BULWARK_TOTEM_TALENT);

    this.addEventListener(
      Events.absorbed.to(SELECTED_PLAYER).spell(SPELLS.STONE_BULWARK_CAST_BUFF),
      this._onDamageAbsorb,
    );
    this.addEventListener(
      Events.absorbed.to(SELECTED_PLAYER).spell(SPELLS.STONE_BULWARK_PULSE_BUFF),
      this._onDamageAbsorb,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.STONE_BULWARK_TOTEM_TALENT),
      this._onStoneBulwarkTotemCast,
    );
  }

  _onDamageAbsorb(event: AbsorbedEvent) {
    this.totalEffectiveShielding += event.amount;
  }

  _onStoneBulwarkTotemCast() {
    this.casts += 1;
  }

  get effectiveAbsorbPerCast() {
    return this.totalEffectiveShielding / this.casts;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <TalentSpellText talent={TALENTS.STONE_BULWARK_TOTEM_TALENT}>
          <div>
            {formatNumber(this.totalEffectiveShielding)}{' '}
            <small>effective shielding in {this.casts} casts</small>
          </div>
          <div>
            {formatNumber(this.effectiveAbsorbPerCast)} <small>effective shielding per cast</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default StoneBulwarkTotem;
