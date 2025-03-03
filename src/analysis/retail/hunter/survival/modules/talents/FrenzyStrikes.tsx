import {
  BUTCHERY_CARVE_MAX_TARGETS_HIT,
  FRENZIED_STRIKES_CDR,
} from 'analysis/retail/hunter/survival/constants';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatDurationMillisMinSec } from 'common/format';

/**
 * Butchery reduces the remaining cooldown on Wildfire Bomb by 3.0 sec for each target hit, up to 5 targets for 15s of cooldown.
 *
 * Example logs:
 * https://www.warcraftlogs.com/reports/GcyfdwP1XTJrR3h7#fight=15&source=8&type=damage-done&ability=212436
 */

class Butchery extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  private reductionAtCurrentCast: number = 0;
  private effectiveReductionMs: number = 0;
  private wastedReductionMs: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.BUTCHERY_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.BUTCHERY_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.BUTCHERY_TALENT),
      this.onCast,
    );
  }

  onCast() {
    this.reductionAtCurrentCast = 0;
  }

  onDamage(event: DamageEvent) {
    if (this.reductionAtCurrentCast === BUTCHERY_CARVE_MAX_TARGETS_HIT) {
      return;
    }
    this.reductionAtCurrentCast += 1;
    if (this.spellUsable.isOnCooldown(TALENTS.WILDFIRE_BOMB_TALENT.id)) {
      this.checkCooldown(TALENTS.WILDFIRE_BOMB_TALENT.id);
    } else {
      this.wastedReductionMs += FRENZIED_STRIKES_CDR;
    }
  }

  checkCooldown(spellId: number) {
    if (this.spellUsable.cooldownRemaining(spellId) < FRENZIED_STRIKES_CDR) {
      const effectiveReductionMs = this.spellUsable.reduceCooldown(spellId, FRENZIED_STRIKES_CDR);
      this.effectiveReductionMs += effectiveReductionMs;
      this.wastedReductionMs += FRENZIED_STRIKES_CDR - effectiveReductionMs;
    } else {
      this.effectiveReductionMs += this.spellUsable.reduceCooldown(spellId, FRENZIED_STRIKES_CDR);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(2)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.FRENZY_STRIKES_TALENT}>
          <>
            {formatDurationMillisMinSec(this.effectiveReductionMs)}{' '}
            <small>cooldown reduction.</small>
            <br />
            {formatDurationMillisMinSec(this.wastedReductionMs)} <small>wasted.</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Butchery;
