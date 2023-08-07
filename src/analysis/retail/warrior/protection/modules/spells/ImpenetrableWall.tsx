import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/warrior';

const REDUCTION = 5000;

/**
 * Whenever you cast a shield slam reduce shield wall by 5 second and gain 3 extra rage.
 */
class ImpenetrableWall extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  effectiveCDR = 0;
  wastedCDR = 0;

  effectiveRage = 0;
  wastedRage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.IMPENETRABLE_WALL_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM), this.onCast);
  }

  onCast(event: CastEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.SHIELD_WALL.id)) {
      const cdr = this.spellUsable.reduceCooldown(SPELLS.SHIELD_WALL.id, REDUCTION);
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
        <BoringSpellValueText spell={TALENTS.IMPENETRABLE_WALL_TALENT}>
          {formatDuration(this.effectiveCDR)} <small>cdr</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ImpenetrableWall;
