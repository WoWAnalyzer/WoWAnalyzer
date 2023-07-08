import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from '../core/SpellUsable';
import { TALENTS_HUNTER } from 'common/TALENTS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import { formatNumber } from 'common/format';

const REDUCTION_MS = 2000;
/**
 * https://www.wowhead.com/spell=405525/hunter-beast-mastery-10-1-class-set-4pc
 * Cobra Shot, Kill Command, and Multi-Shot reduce the cooldown of Bestial Wrath by 2.0 sec.
 */
export default class T30BMTier4P extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  effectiveBWReduction = 0;
  wastedBWReduction = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T30);

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          TALENTS_HUNTER.MULTI_SHOT_BEAST_MASTERY_TALENT,
          TALENTS_HUNTER.COBRA_SHOT_TALENT,
          TALENTS_HUNTER.KILL_COMMAND_SHARED_TALENT,
        ]),
      this.onCast,
    );
  }

  onCast() {
    if (this.spellUsable.isOnCooldown(TALENTS_HUNTER.BESTIAL_WRATH_TALENT.id)) {
      const reductionMs = this.spellUsable.reduceCooldown(
        TALENTS_HUNTER.BESTIAL_WRATH_TALENT.id,
        REDUCTION_MS,
      );
      this.effectiveBWReduction += reductionMs;
      this.wastedBWReduction += REDUCTION_MS - reductionMs;
    } else {
      this.wastedBWReduction += REDUCTION_MS;
    }
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS}>
        <BoringSpellValueText spell={SPELLS.T30_4P_BONUS_BEAST_MASTERY}>
          {formatNumber(this.effectiveBWReduction / 1000)}/
          {formatNumber((this.wastedBWReduction + this.effectiveBWReduction) / 1000)}s{' '}
          <small>Effective BW Reduction</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
