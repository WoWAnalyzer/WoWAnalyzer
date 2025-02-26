import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import talents, { TALENTS_WARRIOR } from 'common/TALENTS/warrior';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

/*  Example log:
 *  https://www.warcraftlogs.com/reports/KhynM7v96cZkTBdg#fight=6&type=damage-done&source=78
 */

const RAGE_GENERATORS = [
  SPELLS.CRUSHING_BLOW,
  SPELLS.BLOODBATH,
  SPELLS.RAGING_BLOW,
  SPELLS.BLOODTHIRST,
  SPELLS.EXECUTE_FURY,
  SPELLS.WHIRLWIND_FURY_CAST,
];

// Rework this module for TWW
class MissedRampage extends Analyzer {
  missedRampages: number = 0;
  hasFB: boolean = false;
  hasAngerManagement: boolean = false;
  hasRecklessAbandon: boolean = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.RAMPAGE_TALENT);
    this.hasAngerManagement = this.selectedCombatant.hasTalent(talents.ANGER_MANAGEMENT_TALENT);
    this.hasRecklessAbandon = this.selectedCombatant.hasTalent(talents.RECKLESS_ABANDON_TALENT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([...RAGE_GENERATORS]), this.onCast);
  }

  get suggestionThresholds() {
    if (this.hasFB) {
      return {
        actual: this.missedRampages,
        isGreaterThan: {
          minor: 0,
          average: 0,
          major: 0,
        },
        style: ThresholdStyle.NUMBER,
      };
    } else {
      return {
        actual: this.missedRampages,
        isGreaterThan: {
          minor: 0,
          average: 5,
          major: 10,
        },
        style: ThresholdStyle.NUMBER,
      };
    }
  }

  onCast(event: CastEvent) {
    if (!event.classResources) {
      return;
    }

    if (
      !event.classResources.find((classResources) => classResources.type === RESOURCE_TYPES.RAGE.id)
    ) {
      return;
    }

    const rage = event.classResources[0].amount / 10;

    if (!this.selectedCombatant.hasBuff(SPELLS.ENRAGE) && rage >= 80) {
      this.missedRampages += 1;
      addInefficientCastReason(
        event,
        'A rage generating ability while not enraged, when Rampage was available',
      );
    }

    if (
      // with Brutal Finish, it's okay to overcap on rage a bit to stack Slaughtering Strikes before Rampaging
      this.selectedCombatant.hasBuff(SPELLS.ENRAGE) &&
      !(
        event.ability.guid === SPELLS.RAGING_BLOW.id &&
        this.selectedCombatant.getBuffStacks(SPELLS.SLAUGHTERING_STRIKES_BUFF) < 5 &&
        this.selectedCombatant.hasBuff(SPELLS.BRUTAL_FINISH_BUFF)
      )
    ) {
      if (this.hasAngerManagement && rage >= 100) {
        this.missedRampages += 1;
        addInefficientCastReason(
          event,
          'A rage generating ability was cast when Rampage would have been better',
        );
      } else if (this.hasRecklessAbandon) {
        // RA is okay with overcapping on rage during reck to use crushing blow/bloodbath
        if (rage >= 120 && !this.selectedCombatant.hasBuff(SPELLS.RECKLESSNESS)) {
          this.missedRampages += 1;
          addInefficientCastReason(
            event,
            'A rage generating ability was cast when Rampage would have been better',
          );
        }
      }
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          There were {actual} times you casted a rage generating ability when you should have cast{' '}
          <SpellLink spell={SPELLS.RAMPAGE} />. <SpellLink spell={SPELLS.RAMPAGE} /> does high
          damage, activates the <SpellLink spell={TALENTS_WARRIOR.ANGER_MANAGEMENT_TALENT} />{' '}
          talent, and causes you to <SpellLink spell={SPELLS.ENRAGE} />, increasing all of your
          damage done.
        </>,
      )
        .icon(SPELLS.RAMPAGE.icon)
        .actual(
          defineMessage({
            id: 'warrior.fury.suggestions.rampages.missed',
            message: `${actual} missed Rampages.`,
          }),
        )
        .recommended(`${recommended} is recommended.`),
    );
  }
}

export default MissedRampage;
