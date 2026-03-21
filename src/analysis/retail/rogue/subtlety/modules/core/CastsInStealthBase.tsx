import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/rogue';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import FilteredDamageTracker from 'analysis/retail/rogue/shared/FilteredDamageTracker';

class CastsInStealthBase extends Analyzer {
  backstabSpell: Spell;
  shadowstrikeSpell: Spell;
  badStealthSpells: Spell[] = [];
  stealthCondition = '';
  maxCastsPerStealth = 0;
  validStealthSpellIds = [
    SPELLS.BACKSTAB.id,
    TALENTS.GLOOMBLADE_TALENT.id,
    SPELLS.SHURIKEN_STORM.id,
    SPELLS.SHADOWSTRIKE.id,
    SPELLS.EVISCERATE.id,
    TALENTS.SHURIKEN_TORNADO_TALENT.id,
    // todo: secret technique is no longer a talent.
    // TALENTS.SECRET_TECHNIQUE_TALENT.id,
  ];

  constructor(options: Options) {
    super(options);
    this.backstabSpell = this.selectedCombatant.hasTalent(TALENTS.GLOOMBLADE_TALENT)
      ? TALENTS.GLOOMBLADE_TALENT
      : SPELLS.BACKSTAB;

    this.shadowstrikeSpell = SPELLS.SHADOWSTRIKE;

    this.badStealthSpells = [this.shadowstrikeSpell, this.backstabSpell];
  }

  get stealthMaxCasts() {
    return 0;
  }

  get stealthActualCasts() {
    return 0;
  }

  get castsInStealthThresholds() {
    return {
      actual: this.stealthActualCasts / this.stealthMaxCasts,
      isLessThan: {
        minor: 1,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  createWrongCastThresholds<T extends FilteredDamageTracker>(
    spell: Spell,
    tracker: T,
  ): NumberThreshold {
    return {
      actual: tracker.getAbility(spell.id).casts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }
}

export default CastsInStealthBase;
