import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const BETTER_SPELLS = [SPELLS.JUDGMENT_CAST_PROTECTION.id, SPELLS.AVENGERS_SHIELD.id];

export default class HammerOfTheRighteous extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spells: SpellUsable,
  };

  activeSpell = SPELLS.HAMMER_OF_THE_RIGHTEOUS;
  _badCasts = 0;
  _casts = 0;

  constructor(props) {
    super(props);
    if (this.selectedCombatant.hasTalent(SPELLS.BLESSED_HAMMER_TALENT)) {
      this.activeSpell = SPELLS.BLESSED_HAMMER_TALENT;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this.activeSpell),
      this._handleFiller,
    );
  }

  _handleFiller(event) {
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

  suggestions(when) {
    when(this.badCastThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should avoid casting <SpellLink id={this.activeSpell.id} /> while better spells
          (namely <SpellLink id={SPELLS.JUDGMENT_CAST_PROTECTION.id} /> and{' '}
          <SpellLink id={SPELLS.AVENGERS_SHIELD.id} />) are available. This is a <em>filler</em>{' '}
          ability and should only be used when you have no better spells to cast.
        </>,
      )
        .icon(this.activeSpell.icon)
        .actual(
          t({
            id: 'paladin.protection.suggestions.hammerOfTheRighteous.efficiency',
            message: `${formatPercentage(
              this.badCastRatio,
            )}% of casts while better spells were available`,
          }),
        )
        .recommended(`< ${formatPercentage(recommended)}% is recommended`),
    );
  }
}
