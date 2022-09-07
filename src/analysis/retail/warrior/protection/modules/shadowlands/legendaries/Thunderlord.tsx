import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const REDUCTION = 1500;
const MAX_REDUCTION_PER_CAST = REDUCTION * 3;

/**
 * Each damage even from thunderclap reduces demo shout by 1.5 seconds up to 4.5 second per cast
 */
class Thunderlord extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  effectiveCDR = 0;
  wastedCDR = 0;

  currentCastsReduction = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.THUNDERLORD);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.THUNDER_CLAP), this.onCast);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.THUNDER_CLAP),
      this.reduce,
    );
  }

  onCast(event: CastEvent) {
    this.currentCastsReduction = 0;
  }

  reduce(event: DamageEvent) {
    if (this.currentCastsReduction === MAX_REDUCTION_PER_CAST) {
      return;
    }

    this.currentCastsReduction += REDUCTION; //i know its weird but im already dedicated

    if (this.spellUsable.isOnCooldown(SPELLS.DEMORALIZING_SHOUT.id)) {
      const cdr = this.spellUsable.reduceCooldown(SPELLS.DEMORALIZING_SHOUT.id, REDUCTION);
      this.effectiveCDR += cdr;
      this.wastedCDR += REDUCTION - cdr;
    } else {
      this.wastedCDR += REDUCTION;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={<>Wasted CDR: {formatDuration(this.wastedCDR)}</>}
      >
        <BoringSpellValueText spellId={SPELLS.THUNDERLORD.id}>
          {formatDuration(this.effectiveCDR)} <small>cdr</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Thunderlord;
