import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class Apocalypse extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  totalApocalypseCasts = 0;
  apocalypseWoundsPopped = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.APOCALYPSE), this.onCast);
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
            You are casting <SpellLink id={SPELLS.APOCALYPSE.id} /> with too few{' '}
            <SpellLink id={SPELLS.FESTERING_WOUND.id} /> on the target. When casting{' '}
            <SpellLink id={SPELLS.APOCALYPSE.id} />, make sure to have at least 4{' '}
            <SpellLink id={SPELLS.FESTERING_WOUND.id} /> on the target.
          </span>,
        )
          .icon(SPELLS.APOCALYPSE.icon)
          .actual(
            t({
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
        size="flexible"
      >
        <BoringSpellValueText spellId={SPELLS.APOCALYPSE.id}>
          <>
            {averageWoundsPopped} <small>average Wounds popped</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Apocalypse;
