import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import Events, { HealEvent } from 'parser/core/Events';
import EOLAttrib from './EchoOfLightAttributor';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

/**
 * this is just the display function for talents powered by the core of EOLAttrib
 */

class EchoOfLightDisplay extends Analyzer {
  static dependencies = {
    eolAttrib: EOLAttrib,
  };
  protected eolAttrib!: EOLAttrib;

  private eolHealBreakdown: eolBreakdown[] = [];
  private totalCalcEol = 0;
  private totalMeasuredEol = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleOnHeal);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ECHO_OF_LIGHT_HEAL),
      this.handleMeasureEol,
    );
  }

  handleOnHeal(event: HealEvent) {
    const eolHeal = this.eolAttrib.getEchoOfLightHealingAttrib(event);
    const spellId = event.ability.guid;
    if (!eolHeal) {
      return;
    }
    if (this.eolHealBreakdown[spellId]) {
      this.eolHealBreakdown[spellId].totalEol += eolHeal;
    }
    // first time
    else {
      this.eolHealBreakdown[spellId] = {
        totalEol: eolHeal,
        spellNum: spellId,
      };
    }
    this.totalCalcEol += eolHeal;
  }

  handleMeasureEol(event: HealEvent) {
    this.totalMeasuredEol += event.amount + (event.absorbed || 0);
  }

  statistic() {
    this.eolHealBreakdown = this.eolHealBreakdown.filter(Boolean);
    this.eolHealBreakdown.sort((a, b) => {
      if (a.totalEol < b.totalEol) {
        return 1;
      }
      if (a.totalEol > b.totalEol) {
        return -1;
      }
      return 0;
    });

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        tooltip={
          <>
            {'This module works by closely approximating '}
            <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />, which can proc from most direct
            heals. This includes non spec direct heals such as enchants, trinkets, etc.{' '}
            <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} /> SHOULD NOT proc on pet heals or HoTs.
            There can always be exceptions that have to be updated in the back end blacklist. If
            there is a heal listed that shouldn't be please contact a maintainer.
            <br />
            <br />
            The current error between measured and approximated is{' '}
            <ItemPercentHealingDone
              amount={this.totalCalcEol - this.totalMeasuredEol}
            ></ItemPercentHealingDone>
          </>
        }
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <td className="text-center">Cast Spell</td>
                  <td className="text-left">
                    <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />
                  </td>
                </tr>
              </thead>
              <tbody>
                {Array.from(this.eolHealBreakdown.keys()).map((e, i) => (
                  <tr key={Number(i)}>
                    <td className="text-center">
                      <SpellIcon spell={this.eolHealBreakdown[Number(e)].spellNum} />
                    </td>
                    <td className="text-left">
                      <ItemPercentHealingDone
                        amount={this.eolHealBreakdown[e].totalEol}
                      ></ItemPercentHealingDone>{' '}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.ECHO_OF_LIGHT_MASTERY}>
          <ItemPercentHealingDone amount={this.totalCalcEol} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

// Add more values here as needed
interface eolBreakdown {
  spellNum: number;
  totalEol: number;
}

export default EchoOfLightDisplay;
