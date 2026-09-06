import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const BETTER_SPELLS = [SPELLS.JUDGMENT_CAST_PROTECTION.id, TALENTS.AVENGERS_SHIELD_TALENT.id];

export default class HammerOfTheRighteous extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spells: SpellUsable,
  };
  protected abilities!: Abilities;
  protected spells!: SpellUsable;

  activeSpell = TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT;
  _badCasts = 0;
  _casts = 0;

  constructor(props: Options) {
    super(props);
    if (this.selectedCombatant.hasTalent(TALENTS.BLESSED_HAMMER_TALENT)) {
      this.activeSpell = TALENTS.BLESSED_HAMMER_TALENT;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this.activeSpell),
      this._handleFiller,
    );
  }

  _handleFiller() {
    const hadBetterSpell = !BETTER_SPELLS.every(this.spells.isOnCooldown.bind(this.spells));
    if (hadBetterSpell) {
      this._badCasts += 1;
    }

    this._casts += 1;
  }

  get badCastRatio() {
    return this._badCasts / this._casts;
  }

  get badCastThreshold() {
    return {
      actual: this.badCastRatio,
      isGreaterThan: {
        minor: 0.1,
        average: 0.15,
        major: 0.25,
      },
      style: 'percentage',
    };
  }
}
