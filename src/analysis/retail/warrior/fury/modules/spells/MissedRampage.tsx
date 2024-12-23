import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import talents, { TALENTS_WARRIOR } from 'common/TALENTS/warrior';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
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

    if (this.hasAngerManagement && rage >= 90) {
      this.missedRampages += 1;
    } else if (this.hasRecklessAbandon) {
      // RA is okay with overcapping on rage in a lot of cases
      // Mostly to use Crushing Blow/Bloodbath charges
      // Naiively only checking for Raging Blow here
      // since Unhinged Bladestorm triggers a few Bloodthirsts that will
      // easily overcap rage
      if (
        rage >= 115 &&
        !this.selectedCombatant.hasBuff(SPELLS.CRUSHING_BLOW_BUFF) &&
        !this.selectedCombatant.hasBuff(SPELLS.BLOODBATH_BUFF) &&
        event.ability.guid === SPELLS.RAGING_BLOW.id
      ) {
        this.missedRampages += 1;
      }
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          There were {actual} times you casted a rage generating ability when you should have cast{' '}
          <SpellLink spell={SPELLS.RAMPAGE} />. <SpellLink spell={SPELLS.RAMPAGE} /> activates both
          the <SpellLink spell={TALENTS_WARRIOR.RECKLESS_ABANDON_TALENT} /> and{' '}
          <SpellLink spell={TALENTS_WARRIOR.ANGER_MANAGEMENT_TALENT} /> talents, and causes you to{' '}
          <SpellLink spell={SPELLS.ENRAGE} />, increasing all of your damage done.
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
