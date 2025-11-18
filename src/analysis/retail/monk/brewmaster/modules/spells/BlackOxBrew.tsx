import talents from 'common/TALENTS/monk';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { Abilities } from '../../gen';

class BlackOxBrew extends Analyzer.withDependencies({
  abilities: Abilities,
  spellUsable: SpellUsable,
}) {
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

  cdr = {
    [talents.PURIFYING_BREW_TALENT.id]: 0,
    [talents.CELESTIAL_BREW_TALENT.id]: 0,
    [talents.CELESTIAL_INFUSION_TALENT.id]: 0,
  };
  wastedCDR = {
    [talents.PURIFYING_BREW_TALENT.id]: 0,
    [talents.CELESTIAL_BREW_TALENT.id]: 0,
    [talents.CELESTIAL_INFUSION_TALENT.id]: 0,
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
    const cd = this.deps.spellUsable.cooldownRemaining(spellId);
    this.cdr[spellId] += cd;

    const expectedCooldown = this.deps.abilities.getExpectedCooldownDuration(spellId);
    if (expectedCooldown) {
      const wastedCDR = expectedCooldown - cd;
      this.wastedCDR[spellId] += wastedCDR;
    }
  }

  _resetPB() {
    // loop until we've reset all the charges individually, recording
    // the amount of cooldown reduction for each charge.
    const spellId = talents.PURIFYING_BREW_TALENT.id;
    while (this.deps.spellUsable.isOnCooldown(spellId)) {
      this._trackCdr(spellId);
      this.deps.spellUsable.endCooldown(spellId);
    }
  }

  _resetCB() {
    const spellId = this.selectedCombatant.hasTalent(talents.CELESTIAL_INFUSION_TALENT)
      ? talents.CELESTIAL_INFUSION_TALENT.id
      : talents.CELESTIAL_BREW_TALENT.id;
    if (this.deps.spellUsable.isOnCooldown(spellId)) {
      this._trackCdr(spellId);
      this.deps.spellUsable.endCooldown(spellId);
    } else {
      this.wastedCDR[spellId] += this.deps.abilities.getExpectedCooldownDuration(spellId) || 0;
    }
  }

  onCast(_event: CastEvent) {
    this.casts += 1;

    this._resetPB();
    this._resetCB();
  }
}

export default BlackOxBrew;
