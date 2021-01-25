import SPELLS from 'common/SPELLS';
import DamageTracker from 'parser/shared/modules/AbilityTracker';
import { Options } from 'parser/core/Analyzer';
import Spell from 'common/SPELLS/Spell';
import { When } from 'parser/core/ParseResults';
import { StealthDamageTracker } from '@wowanalyzer/rogue';

import CastsInStealthBase from './CastsInStealthBase';

class CastsInStealth extends CastsInStealthBase {
  static dependencies = {
    damageTracker: DamageTracker,
    stealthDamageTracker: StealthDamageTracker,
  };

  protected damageTracker!: DamageTracker;
  protected stealthDamageTracker!: StealthDamageTracker;

  constructor(options: Options & { stealthDamageTracker: StealthDamageTracker }) {
    super(options);

    this.maxCastsPerStealth = 1 + (this.selectedCombatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id) ? 2 : 0);

    this.stealthCondition = this.selectedCombatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id)
      ? 'Stealth or Vanish with Subterfuge'
      : 'Stealth or Vanish';

    options.stealthDamageTracker.subscribeInefficientCast(
      this.badStealthSpells,
      (s: Spell) => `Cast Shadowstrike instead of ${s.name} when you are in ${this.stealthCondition} window`,
    );
  }

  get stealthBackstabThresholds() {
    return this.createWrongCastThresholds(this.backstabSpell, this.stealthDamageTracker);
  }

  get stealthMaxCasts() {
    return this.maxCastsPerStealth * (this.damageTracker.getAbility(SPELLS.VANISH.id).casts + 1);
  }

  get stealthActualCasts() {
    return this.validStealthSpellIds.map(s => this.stealthDamageTracker.getAbility(s).casts || 0).reduce((p, c) => p + c);
  }

  suggestions(when: When) {
    this.suggestWrongCast(when, this.backstabSpell, this.stealthBackstabThresholds);
    this.suggestAvgCasts(when, SPELLS.STEALTH);
  }
}

export default CastsInStealth;
