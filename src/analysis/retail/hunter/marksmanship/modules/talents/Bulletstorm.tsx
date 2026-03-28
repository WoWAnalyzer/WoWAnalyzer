import { TALENTS_HUNTER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { SpellIcon } from 'interface';
/**
 * Rapid Fire causes your next Aimed Shot to deal 5% increased damage per shot fired,
 * stacking up to 20 times (Bulletstorm buff).
 *
 * This analyzer tracks:
 * - Average Bulletstorm stacks consumed per Aimed Shot
 * - Times Aimed Shot was cast with zero stacks (wasted Bulletstorm potential)
 * - Times Aimed Shot was cast at max stacks (good usage)
 */
const MAX_BULLETSTORM_STACKS = 20;
class Bulletstorm extends Analyzer {
  totalStacksConsumed = 0;
  aimedShotCasts = 0;
  castsWithZeroStacks = 0;
  castsAtMaxStacks = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.BULLETSTORM_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.AIMED_SHOT_TALENT),
      this.onAimedShotCast,
    );
  }
  onAimedShotCast(event: CastEvent) {
    this.aimedShotCasts += 1;
    const stacks = this.selectedCombatant.getBuffStacks(SPELLS.BULLETSTORM_BUFF.id);
    this.totalStacksConsumed += stacks;
    if (stacks === 0) {
      this.castsWithZeroStacks += 1;
    }
    if (stacks === MAX_BULLETSTORM_STACKS) {
      this.castsAtMaxStacks += 1;
    }
  }
  get averageStacks() {
    if (this.aimedShotCasts === 0) {
      return 0;
    }
    return this.totalStacksConsumed / this.aimedShotCasts;
  }
  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL(2)} size="flexible">
        <BoringSpellValueText spell={TALENTS_HUNTER.BULLETSTORM_TALENT}>
          <SpellIcon spell={SPELLS.BULLETSTORM_BUFF} noLink />{' '}
          {this.averageStacks.toFixed(1)} <small>avg stacks per Aimed Shot</small>
          <br />
          {this.castsWithZeroStacks > 0 && (
            <>
              <SpellIcon spell={TALENTS_HUNTER.AIMED_SHOT_TALENT} noLink />{' '}
              {this.castsWithZeroStacks} <small>casts with zero stacks</small>
            </>
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
export default Bulletstorm;
