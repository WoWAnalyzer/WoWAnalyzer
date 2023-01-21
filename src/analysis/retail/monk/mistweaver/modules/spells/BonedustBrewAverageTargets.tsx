import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyDebuffEvent, CastEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class BonedustBrewAverageTargets extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;

  totalCasts = 0;
  totalBuffs = 0;
  totalDebuffs = 0;
  castMap: Map<number, number> = new Map<number, number>();

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.BONEDUST_BREW_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.BONEDUST_BREW_TALENT),
      this.cast,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.BONEDUST_BREW_TALENT),
      this.friendlyBuffs,
    );

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.BONEDUST_BREW_TALENT),
      this.enemyDebuffs,
    );
  }

  cast(event: CastEvent) {
    this.totalCasts += 1;
  }

  friendlyBuffs(event: ApplyBuffEvent) {
    const target = this.combatants.players[event.targetID];
    //filter out pets
    if (!target) {
      return;
    }

    this.totalBuffs += 1;
    const currentTotal = (this.castMap.get(this.totalCasts) || 0) + 1;
    this.castMap.set(this.totalCasts, currentTotal);
  }

  enemyDebuffs(event: ApplyDebuffEvent) {
    this.totalDebuffs += 1;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(50)}
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={this.baseTable}
      >
        <BoringSpellValueText spellId={TALENTS_MONK.BONEDUST_BREW_TALENT.id}>
          <>
            {(this.totalBuffs / this.totalCasts).toFixed(2)}{' '}
            <small>average allies hit per cast</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  /** The dropdown table in the base form of this statistic */
  get baseTable(): React.ReactNode {
    return (
      <>
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Cast #</th>
              <th>Allies Hit</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(this.castMap.keys()).map((value) => (
              <tr key={value}>
                <td>{value}</td>
                <td>{this.castMap.get(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }
}

export default BonedustBrewAverageTargets;
