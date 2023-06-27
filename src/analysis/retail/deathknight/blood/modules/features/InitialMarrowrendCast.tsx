
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { BoolThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';

class InitialMarrowrendCast extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;

  firstMRCast = false;
  firstMRCastWithoutDRW = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.MARROWREND_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    if (this.firstMRCast) {
      return;
    }

    this.firstMRCast = true;
    if (!this.selectedCombatant.hasBuff(SPELLS.DANCING_RUNE_WEAPON_TALENT_BUFF.id)) {
      this.firstMRCastWithoutDRW = true;
    }
  }

  get initialMRThresholds(): BoolThreshold {
    return {
      actual: this.firstMRCastWithoutDRW,
      isEqual: true,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  suggestions(when: When) {
    when(this.initialMRThresholds)
      .isTrue()
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <>
            Use your first <SpellLink spell={TALENTS.MARROWREND_TALENT} /> together with{' '}
            <SpellLink spell={TALENTS.DANCING_RUNE_WEAPON_TALENT} /> to build up stacks of{' '}
            <SpellLink spell={SPELLS.BONE_SHIELD} /> faster without wasting as much runes. This will
            also increase your initial threat-genration as your burst DPS will increase
            significantly. Don't treat <SpellLink spell={TALENTS.DANCING_RUNE_WEAPON_TALENT} /> as a
            defensive CD unless you really need the parry and increased Runic Power generation
            defensively.
          </>,
        ).icon(TALENTS.DANCING_RUNE_WEAPON_TALENT.icon),
      );
  }
}

export default InitialMarrowrendCast;
