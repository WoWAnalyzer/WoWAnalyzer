import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import talents, { TALENTS_WARRIOR } from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

/*  Example log:
 *  https://www.warcraftlogs.com/reports/vM8zdCPFhZkxfW3y?fight=45&type=casts&source=13
 */

const VICIOUS_CONTEMPT_EXECUTE_RANGE = 0.35;
// Track how many times Rampage was used before using the charge of Bloodbath it provides
class Bloodbath extends Analyzer {
  missedBloodbaths: number = 0;
  unenragedCount: number = 0;
  inViciousContemptRange: boolean = false;
  hasViciousContemptTalented: boolean = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.RECKLESS_ABANDON_TALENT);
    this.hasViciousContemptTalented = this.selectedCombatant.hasTalent(
      TALENTS_WARRIOR.VICIOUS_CONTEMPT_TALENT,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAMPAGE),
      this.onRampageCast,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLOODBATH), this.onDamage);
  }

  get suggestionThresholds() {
    return {
      actual: this.missedBloodbaths,
      isGreaterThan: {
        minor: 0,
        average: 4,
        major: 8,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  onDamage(event: DamageEvent) {
    if (event.hitPoints && event.maxHitPoints) {
      if (event.hitPoints / event.maxHitPoints < VICIOUS_CONTEMPT_EXECUTE_RANGE) {
        this.inViciousContemptRange = true;
      }
    }
  }

  onRampageCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.BLOODBATH_BUFF)) {
      const bloodcrazeStacks = this.selectedCombatant.getBuffStacks(SPELLS.BLOODCRAZE.id);

      // Technically the sim APL adds a check for <= 115 rage here as well (as of 11.0.7)
      // But even published guides (wowhead, maxroll) don't reflect that for simplicity
      // It's a ~0.2% dps gain
      if (
        (this.inViciousContemptRange && this.hasViciousContemptTalented) ||
        bloodcrazeStacks >= 3
      ) {
        this.missedBloodbaths += 1;
        addInefficientCastReason(event, 'Rampage was used before using Bloodbath');
      }
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          There were {actual} times you used <SpellLink spell={SPELLS.RAMPAGE} /> before using your
          charge of <SpellLink spell={SPELLS.BLOODBATH} />. <SpellLink spell={SPELLS.BLOODBATH} />{' '}
          is one of your highest damage abilities, and should be used every time it is available, as
          long as you are already enraged. Refer to Wowhead or Maxroll guides for a full description
          of when to best use <SpellLink spell={SPELLS.BLOODBATH} /> .
        </>,
      )
        .icon(SPELLS.BLOODBATH.icon)
        .actual(
          defineMessage({
            id: 'warrior.fury.suggestions.bloodbath.missed',
            message: `${actual} missed Bloodbaths.`,
          }),
        )
        .recommended(`${recommended} is recommended.`),
    );
  }
}

export default Bloodbath;
