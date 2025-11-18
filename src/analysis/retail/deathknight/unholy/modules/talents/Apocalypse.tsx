import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
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

  private totalApocalypseCasts = 0;
  private apocalypseWoundsPopped = 0;

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
