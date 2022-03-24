import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class FallenOrderAverageHPOfTargetOnCast extends Analyzer {
  foHealsToListenFor: string[] = [];
  hpOfTargetOnCast: number[] = [];

  hpOfTargetWhenSOOMCast: number[] = [];
  hpOfTargetWhenENMCast: number[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER_PET)
        .spell([SPELLS.FALLEN_ORDER_ENVELOPING_MIST, SPELLS.FALLEN_ORDER_SOOTHING_MIST]),
      this.healListener,
    );
  }

  healListener(event: CastEvent) {
    const hpPercent = event.hitPoints! / event.maxHitPoints!;
    this.hpOfTargetOnCast.push(hpPercent);
    if (event.ability.guid === SPELLS.FALLEN_ORDER_ENVELOPING_MIST.id) {
      this.hpOfTargetWhenENMCast.push(hpPercent);
    } else {
      this.hpOfTargetWhenSOOMCast.push(hpPercent);
    }
  }

  getAverage(toAverage: number[]) {
    return formatPercentage(toAverage.reduce((a, b) => a + b) / toAverage.length);
  }

  getMin(toMin: number[]) {
    return formatPercentage(toMin.reduce((previous, current) => Math.min(previous, current)));
  }

  getMax(toMax: number[]) {
    return formatPercentage(toMax.reduce((previous, current) => Math.max(previous, current)));
  }

  getSTD(toSTD: number[]) {
    const toToyWith = toSTD.slice();
    const n = toToyWith.length;
    const mean = toToyWith.reduce((a, b) => a + b) / n;
    return formatPercentage(
      Math.sqrt(toToyWith.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n),
    );
  }

  statistic() {
    const averageOfAll =
      this.hpOfTargetOnCast.length > 0 ? this.getAverage(this.hpOfTargetOnCast) : 0;
    const averageOfSOOM =
      this.hpOfTargetOnCast.length > 0 ? this.getAverage(this.hpOfTargetWhenSOOMCast) : 0;
    const averageOfENM =
      this.hpOfTargetOnCast.length > 0 ? this.getAverage(this.hpOfTargetWhenENMCast) : 0;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            This is some statistical date of a target's HP when a spell from a Crane Clone is cast.
            <br />
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Spell</th>
                  <th>Max</th>
                  <th>Min</th>
                  <th>Average</th>
                  <th>STD</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <img src="/img/healing.png" alt="Healing" className="icon" /> Overall
                  </td>
                  <td>
                    {this.hpOfTargetOnCast.length > 0 ? this.getMax(this.hpOfTargetOnCast) : 0}
                  </td>
                  <td>
                    {this.hpOfTargetOnCast.length > 0 ? this.getMin(this.hpOfTargetOnCast) : 0}
                  </td>
                  <td>{averageOfAll}</td>
                  <td>
                    {this.hpOfTargetOnCast.length > 0 ? this.getSTD(this.hpOfTargetOnCast) : 0}
                  </td>
                </tr>
                <tr>
                  <td>
                    <SpellLink id={SPELLS.FALLEN_ORDER_SOOTHING_MIST.id} />
                  </td>
                  <td>
                    {this.hpOfTargetWhenSOOMCast.length > 0
                      ? this.getMax(this.hpOfTargetWhenSOOMCast)
                      : 0}
                  </td>
                  <td>
                    {this.hpOfTargetWhenSOOMCast.length > 0
                      ? this.getMin(this.hpOfTargetWhenSOOMCast)
                      : 0}
                  </td>
                  <td>{averageOfSOOM}</td>
                  <td>
                    {this.hpOfTargetWhenSOOMCast.length > 0
                      ? this.getSTD(this.hpOfTargetWhenSOOMCast)
                      : 0}
                  </td>
                </tr>
                <tr>
                  <td>
                    <SpellLink id={SPELLS.FALLEN_ORDER_ENVELOPING_MIST.id} />
                  </td>
                  <td>
                    {this.hpOfTargetWhenENMCast.length > 0
                      ? this.getMax(this.hpOfTargetWhenENMCast)
                      : 0}
                  </td>
                  <td>
                    {this.hpOfTargetWhenENMCast.length > 0
                      ? this.getMin(this.hpOfTargetWhenENMCast)
                      : 0}
                  </td>
                  <td>{averageOfENM}</td>
                  <td>
                    {this.hpOfTargetWhenENMCast.length > 0
                      ? this.getSTD(this.hpOfTargetWhenENMCast)
                      : 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        }
      >
        <BoringValueText
          label={
            <>
              Average HP of Target When <SpellLink id={SPELLS.FALLEN_ORDER_CRANE_CLONE.id} /> Casts
              A Spell on Them
            </>
          }
        >
          <img src="/img/healing.png" alt="Healing" className="icon" /> Average: {averageOfAll}%{' '}
          <br />
          <SpellIcon id={SPELLS.FALLEN_ORDER_SOOTHING_MIST.id} /> Soom: {averageOfSOOM}% <br />
          <SpellIcon id={SPELLS.FALLEN_ORDER_ENVELOPING_MIST.id} /> ENM: {averageOfENM}% <br />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default FallenOrderAverageHPOfTargetOnCast;
