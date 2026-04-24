import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { NATURAL_MENDING_CDR_MS } from '../constants';

/**
 * Exhilaration's cooldown is reduced by 30 sec (per rank).
 */
class NaturalMending extends Analyzer {
  effectiveReductionMs = 0;
  casts = 0;
  cdr;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.NATURAL_MENDING_TALENT);
    this.cdr =
      this.selectedCombatant.getTalentRank(TALENTS.NATURAL_MENDING_TALENT) * NATURAL_MENDING_CDR_MS;
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXHILARATION), this.onCast);
  }

  onCast(event: CastEvent) {
    this.casts++;
    this.effectiveReductionMs += this.cdr;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.NATURAL_MENDING_TALENT}>
          <>
            {formatNumber(this.effectiveReductionMs / 1000)}s <small>cooldown reduction</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default NaturalMending;
