import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Your next Aimed Shot will fire a second time instantly at 100% power without consuming Focus, or your next Rapid Fire will shoot 100% additional shots during its channel.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/ZMGCRkA29PcrmJhx#fight=5&type=auras&ability=260402&source=4
 */

class DoubleTap extends Analyzer {
  activations = 0;
  aimedUsage = 0;
  RFUsage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.DOUBLE_TAP_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.DOUBLE_TAP_TALENT),
      this.onDoubleTapApplication,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AIMED_SHOT),
      this.onAimedCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAPID_FIRE),
      this.onRapidFireCast,
    );
  }

  get totalUsage() {
    return this.RFUsage + this.aimedUsage;
  }

  onDoubleTapApplication() {
    this.activations += 1;
  }

  onAimedCast() {
    if (!this.selectedCombatant.hasBuff(TALENTS_HUNTER.DOUBLE_TAP_TALENT.id)) {
      return;
    }
    this.aimedUsage += 1;
  }

  onRapidFireCast() {
    if (!this.selectedCombatant.hasBuff(TALENTS_HUNTER.DOUBLE_TAP_TALENT.id)) {
      return;
    }
    this.RFUsage += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            You used Double Tap a total of {this.activations} times, and utilised {this.totalUsage}{' '}
            of them.
            <ul>
              {this.aimedUsage > 0 && (
                <li>
                  Out of the total activations, you used {this.aimedUsage} of them on Aimed Shots.
                </li>
              )}
              {this.RFUsage > 0 && (
                <li>
                  Out of the total activations, you used {this.RFUsage} of them on Rapid Fires.
                </li>
              )}
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_HUNTER.DOUBLE_TAP_TALENT.id}>
          <>
            {this.aimedUsage}
            {'  '}
            <SpellIcon
              id={SPELLS.AIMED_SHOT.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {'  '}
            {this.RFUsage}
            {'  '}
            <SpellIcon
              id={SPELLS.RAPID_FIRE.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DoubleTap;
