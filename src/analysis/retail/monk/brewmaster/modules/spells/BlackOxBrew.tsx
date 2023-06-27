import { formatPercentage } from 'common/format';
import talents from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import Abilities from '../Abilities';

class BlackOxBrew extends Analyzer {
  get suggestionThreshold() {
    return {
      actual:
        this.wastedCDR[talents.PURIFYING_BREW_TALENT.id] /
        (this.cdr[talents.PURIFYING_BREW_TALENT.id] +
          this.wastedCDR[talents.PURIFYING_BREW_TALENT.id]),
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };
  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  cdr = {
    [talents.PURIFYING_BREW_TALENT.id]: 0,
    [talents.CELESTIAL_BREW_TALENT.id]: 0,
  };
  wastedCDR = {
    [talents.PURIFYING_BREW_TALENT.id]: 0,
    [talents.CELESTIAL_BREW_TALENT.id]: 0,
  };
  casts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.BLACK_OX_BREW_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.BLACK_OX_BREW_TALENT),
      this.onCast,
    );
  }

  _trackCdr(spellId: number) {
    const cd = this.spellUsable.cooldownRemaining(spellId);
    this.cdr[spellId] += cd;

    const expectedCooldown = this.abilities.getExpectedCooldownDuration(spellId);
    if (expectedCooldown) {
      const wastedCDR = expectedCooldown - cd;
      this.wastedCDR[spellId] += wastedCDR;
    }
  }

  _resetPB() {
    // loop until we've reset all the charges individually, recording
    // the amount of cooldown reduction for each charge.
    const spellId = talents.PURIFYING_BREW_TALENT.id;
    while (this.spellUsable.isOnCooldown(spellId)) {
      this._trackCdr(spellId);
      this.spellUsable.endCooldown(spellId);
    }
  }

  _resetCB() {
    const spellId = talents.BLACK_OX_BREW_TALENT.id;
    if (this.spellUsable.isOnCooldown(spellId)) {
      this._trackCdr(spellId);
      this.spellUsable.endCooldown(spellId);
    } else {
      this.wastedCDR[spellId] += this.abilities.getExpectedCooldownDuration(spellId) || 0;
    }
  }

  onCast(event: CastEvent) {
    this.casts += 1;

    this._resetPB();
    this._resetCB();
  }

  suggestions(when: When) {
    when(this.suggestionThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={talents.BLACK_OX_BREW_TALENT.id} /> usage can be improved.
        </>,
      )
        .icon(talents.BLACK_OX_BREW_TALENT.icon)
        .actual(`${formatPercentage(actual)}% of Cooldown Reduction wasted`)
        .recommended(`< ${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default BlackOxBrew;
