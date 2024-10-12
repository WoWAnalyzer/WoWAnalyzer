import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/deathknight';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class Apocalypse extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  private totalApocalypseCasts: number = 0;
  private apocalypseWoundsPopped: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.APOCALYPSE_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.APOCALYPSE_TALENT),
      this.onCast,
    );
  }

  //Logic that both counts the amount of Apocalypse cast by the player, as well as the amount of wounds popped by those apocalypse.
  onCast(event: CastEvent) {
    this.totalApocalypseCasts += 1;
    const target = this.enemies.getEntity(event);
    let currentTargetWounds = 0;
    if (target?.hasBuff(SPELLS.FESTERING_WOUND.id)) {
      currentTargetWounds = target.getBuffStacks(SPELLS.FESTERING_WOUND.id);
    }
    if (currentTargetWounds > 4) {
      this.apocalypseWoundsPopped = this.apocalypseWoundsPopped + 4;
    } else {
      this.apocalypseWoundsPopped = this.apocalypseWoundsPopped + currentTargetWounds;
    }
  }

  suggestions(when: When) {
    const averageWoundsPopped = Number(
      (this.apocalypseWoundsPopped / this.totalApocalypseCasts).toFixed(1),
    );
    //Getting 6 wounds on every Apocalypse isn't difficult and should be expected
    when(averageWoundsPopped)
      .isLessThan(4)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            You're casting <SpellLink spell={TALENTS.APOCALYPSE_TALENT} /> when there are to few
            stacks of <SpellLink spell={SPELLS.FESTERING_WOUND} /> on the target. Ideally you should
            cast <SpellLink spell={TALENTS.APOCALYPSE_TALENT} /> when you have 4 stacks of{' '}
            <SpellLink spell={SPELLS.FESTERING_WOUND} />. It is more important to send it on
            cooldown than to wait to build 4 <SpellLink spell={SPELLS.FESTERING_WOUND} />. In AoE,
            use with 1 or more <SpellLink spell={SPELLS.FESTERING_WOUND} />.
          </span>,
        )
          .icon(TALENTS.APOCALYPSE_TALENT.icon)
          .actual(
            defineMessage({
              id: 'deathknight.unholy.suggestions.apocalypse.efficiency',
              message: `An average ${actual} of Festering Wounds were popped by Apocalypse`,
            }),
          )
          .recommended(`${recommended} is recommended`)
          .regular(recommended - 1)
          .major(recommended - 2),
      );
  }

  statistic() {
    const averageWoundsPopped = (this.apocalypseWoundsPopped / this.totalApocalypseCasts).toFixed(
      1,
    );
    return (
      <Statistic
        tooltip={`You popped ${this.apocalypseWoundsPopped} wounds with ${this.totalApocalypseCasts} casts of Apocalypse.`}
        position={STATISTIC_ORDER.CORE(6)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.APOCALYPSE_TALENT}>
          <>
            {averageWoundsPopped} <small>average Wounds popped</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Apocalypse;
