import { formatDuration } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/warrior';
import ItemCooldownReduction from 'parser/ui/ItemCooldownReduction';

const REDUCTION = 1000;
const MAX_REDUCTION_PER_CAST = REDUCTION * 3;

/**
 * Each damage even from thunderclap reduces demo shout by 1.0 seconds up to 3.0 second per cast
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
    this.active = this.selectedCombatant.hasTalent(TALENTS.THUNDERLORD_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.THUNDER_CLAP_PROTECTION_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.THUNDER_CLAP_PROTECTION_TALENT),
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

    if (this.spellUsable.isOnCooldown(TALENTS.DEMORALIZING_SHOUT_TALENT.id)) {
      const cdr = this.spellUsable.reduceCooldown(TALENTS.DEMORALIZING_SHOUT_TALENT.id, REDUCTION);
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
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<>Wasted CDR: {formatDuration(this.wastedCDR)}</>}
      >
        <BoringSpellValueText spell={TALENTS.THUNDERLORD_TALENT}>
          <ItemCooldownReduction effective={this.effectiveCDR} waste={this.wastedCDR} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Thunderlord;
