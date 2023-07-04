import { t } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

import { LIFECYCLES_MANA_PERC_REDUCTION } from '../../constants';

const LC_MANA_PER_SECOND_RETURN_MINOR = 40; //since its based on mp5 and mana & mp5 got halved going into SL we're gonna just halve this value too (80 -> 40)
const LC_MANA_PER_SECOND_RETURN_AVERAGE: number = LC_MANA_PER_SECOND_RETURN_MINOR - 15;
const LC_MANA_PER_SECOND_RETURN_MAJOR: number = LC_MANA_PER_SECOND_RETURN_MINOR - 15;
const CHIJI_MANA_SAVED_PER_STACK = 1001;
const MAX_CHIJI_STACKS = 3;

const debug = false;

class Lifecycles extends Analyzer {
  manaSaved: number = 0;
  manaSavedViv: number = 0;
  manaSavedEnm: number = 0;
  castsRedEnm: number = 0;
  castsRedViv: number = 0;
  castsNonRedViv: number = 0;
  castsNonRedEnm: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.LIFECYCLES_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.vivifyCast);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.envelopingMistCast,
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.manaSaved,
      isLessThan: {
        minor: LC_MANA_PER_SECOND_RETURN_MINOR * (this.owner.fightDuration / 1000),
        average: LC_MANA_PER_SECOND_RETURN_AVERAGE * (this.owner.fightDuration / 1000),
        major: LC_MANA_PER_SECOND_RETURN_MAJOR * (this.owner.fightDuration / 1000),
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  vivifyCast(event: CastEvent) {
    // Checking for TFT->Viv and classify as non-reduced Viv
    if (
      this.selectedCombatant.hasBuff(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id) ||
      this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)
    ) {
      return;
    }
    if (!this.selectedCombatant.hasBuff(SPELLS.LIFECYCLES_VIVIFY_BUFF.id)) {
      this.castsNonRedViv += 1;
      return;
    }
    this.manaSaved += SPELLS.VIVIFY.manaCost * LIFECYCLES_MANA_PERC_REDUCTION;
    this.manaSavedViv += SPELLS.VIVIFY.manaCost * LIFECYCLES_MANA_PERC_REDUCTION;
    this.castsRedViv += 1;
    debug && console.log('Viv Reduced');
  }

  envelopingMistCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
      return;
    }
    // Checking to ensure player has cast Enveloping Mists and has the mana reduction buff
    if (!this.selectedCombatant.hasBuff(SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.id)) {
      this.castsNonRedEnm += 1;
      return;
    }
    // Checking for chiji stacks and determine mana reduction
    const chijiStacksAtEnvCast = this.selectedCombatant.getBuff(
      SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.id,
      event.timestamp,
    )?.stacks;
    if (!chijiStacksAtEnvCast) {
      this.calculateEnvManaSaved(TALENTS_MONK.ENVELOPING_MIST_TALENT.manaCost!);
      return;
    }
    //check for free cast from chiji
    if (chijiStacksAtEnvCast === MAX_CHIJI_STACKS) {
      return;
    }
    //have to do this weird because blizzard decided to make each chiji stack reduce the mana cost by 1001 instead of and exact 33%
    const modifiedManaCost =
      TALENTS_MONK.ENVELOPING_MIST_TALENT.manaCost! -
      CHIJI_MANA_SAVED_PER_STACK * chijiStacksAtEnvCast;
    this.calculateEnvManaSaved(modifiedManaCost);
  }

  calculateEnvManaSaved(manaCost: number) {
    this.manaSaved += manaCost * LIFECYCLES_MANA_PERC_REDUCTION;
    this.manaSavedEnm += manaCost * LIFECYCLES_MANA_PERC_REDUCTION;
    this.castsRedEnm += 1;
    debug && console.log('Env Reduced');
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your current spell usage is not taking full advantage of the{' '}
          <SpellLink spell={TALENTS_MONK.LIFECYCLES_TALENT} /> talent. You should be trying to
          alternate the use of these spells as often as possible to take advantage of the buff.
        </>,
      )
        .icon(TALENTS_MONK.LIFECYCLES_TALENT.icon)
        .actual(
          `${formatNumber(actual)}${t({
            id: 'monk.mistweaver.suggestions.lifecycles.manaSaved',
            message: ` mana saved through Lifecycles`,
          })}`,
        )
        .recommended(`${formatNumber(recommended)} is the recommended amount of mana savings`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(70)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            You saved a total of {this.manaSaved} mana from the Lifecycles talent.
            <ul>
              <li>
                On {this.castsRedViv} Vivify casts, you saved{' '}
                {(this.manaSavedViv / 1000).toFixed(0)}k mana. (
                {formatPercentage(this.castsRedViv / (this.castsRedViv + this.castsNonRedViv))}%)
              </li>
              <li>
                On {this.castsRedEnm} Enveloping Mists casts, you saved{' '}
                {(this.manaSavedEnm / 1000).toFixed(0)}k mana. (
                {formatPercentage(this.castsRedEnm / (this.castsRedEnm + this.castsNonRedEnm))}%)
              </li>
              <li>
                You casted {this.castsNonRedViv} Vivify's and {this.castsNonRedEnm} Enveloping Mists
                for full mana cost.
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.LIFECYCLES_TALENT}>
          <>{formatNumber(this.manaSaved)} Mana Saved</>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Lifecycles;
