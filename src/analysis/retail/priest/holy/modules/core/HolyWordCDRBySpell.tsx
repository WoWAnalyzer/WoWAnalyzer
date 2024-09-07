import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import HolyWordCDR from './HolyWordCDR';
import Events, { CastEvent } from 'parser/core/Events';

/**
 * PLEASE FOR THE LOVE OF GOD SOMEONE MORE CAPABLE AT CONTAINERS AND TABLES REWRITE THIS
 * MODULE TO DISPLAY THINGS IN A NON ATROCIOUS WAY
 *
 * IHATETYPESCRIPTIHATETYPESCRIPTIHATETYPESCRIPTIHATETYPESCRIPTIHATETYPESCRIPTIHATETYPESCRIPTIHATETYPESCRIPT
 * IHATETYPESCRIPTIHATETYPESCRIPTIHATETYPESCRIPTIHATETYPESCRIPTIHATETYPESCRIPTIHATETYPESCRIPTIHATETYPESCRIPT
 */

class HolyWordCDRBySpell extends Analyzer {
  static dependencies = {
    holyWordCDR: HolyWordCDR,
  };
  lightOfTheNaaruActive = false;
  apotheosisActive = false;
  voiceOfHarmonyActive = false;
  cast = 0;

  private hwContainer: hwCDRBreakdown[] = [];

  protected holyWordCDR!: HolyWordCDR;

  totalBase = 0;
  totalLotn = 0;
  totalApoth = 0;

  constructor(options: Options) {
    super(options);
    this.lightOfTheNaaruActive = this.selectedCombatant.hasTalent(
      TALENTS.LIGHT_OF_THE_NAARU_TALENT,
    );
    this.apotheosisActive = this.selectedCombatant.hasTalent(TALENTS.APOTHEOSIS_TALENT);
    this.voiceOfHarmonyActive = true;
    this.apotheosisActive = true;
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.handleOnCast);
  }

  /**
   * IDK MAN THIS WORKS BUT ITS REALLY UGLY AND HARD TO MAINTAIN
   */
  handleOnCast(event: CastEvent) {
    const hwBreakdown = this.holyWordCDR.handleAny(event);
    const spellId = event.ability.guid;
    let baseCd = hwBreakdown?.cdrFromBase || 0;
    const idealCd = hwBreakdown?.idealTotalCDR || 0;
    if (idealCd === 0) {
      return;
    }
    let vohCD = 0;
    if (hwBreakdown?.vohAffectsBase) {
      baseCd = 0;
      vohCD = hwBreakdown.cdrFromBase;
    }

    const wastedCDR = (hwBreakdown?.idealTotalCDR || 0) - (hwBreakdown?.actualTotalCDR || 0);
    const cdrFromLotn = hwBreakdown?.cdrFromLOTN || 0;
    const cdrFromApoth = hwBreakdown?.cdrFromApoth || 0;
    const cdrFromTwwTier = hwBreakdown?.cdrFromTwwTier || 0;
    const totalEffectiveCDR = baseCd + vohCD + cdrFromApoth + cdrFromLotn + cdrFromTwwTier;
    const affectedSpell = hwBreakdown?.affectedSpell || 2060;

    // this is really ugly but it will throw "possibly undefined" errors without all the "|| 0"'s

    if (this.hwContainer[spellId]) {
      this.hwContainer[spellId].wastedCdr =
        (this.hwContainer[spellId].wastedCdr || 0) +
        (hwBreakdown?.idealTotalCDR || 0) -
        (hwBreakdown?.actualTotalCDR || 0);
      this.hwContainer[spellId].cdrFromBase = baseCd + (this.hwContainer[spellId].cdrFromBase || 0);
      this.hwContainer[spellId].cdrFromLOTN =
        cdrFromLotn + (this.hwContainer[spellId].cdrFromLOTN || 0);
      this.hwContainer[spellId].cdrFromApoth =
        cdrFromApoth + (this.hwContainer[spellId].cdrFromApoth || 0);
      this.hwContainer[spellId].cdrFromTwwTier =
        cdrFromTwwTier + (this.hwContainer[spellId].cdrFromTwwTier || 0);
      this.hwContainer[spellId].cdrFromVoh = vohCD + (this.hwContainer[spellId].cdrFromVoh || 0);
      this.hwContainer[spellId].totalCDR =
        totalEffectiveCDR + (this.hwContainer[spellId].totalCDR || 0);
    }
    // first time
    else {
      this.hwContainer[event.ability.guid] = {
        wastedCdr: wastedCDR,
        cdrFromBase: baseCd,
        cdrFromLOTN: cdrFromLotn,
        cdrFromApoth: cdrFromApoth,
        cdrFromTwwTier: cdrFromTwwTier,
        cdrFromVoh: vohCD,
        spellNum: event.ability.guid,
        totalCDR: totalEffectiveCDR,
        affectedSpell: affectedSpell,
      };
    }
  }

  statistic() {
    this.hwContainer = this.hwContainer.filter(Boolean);
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        wide
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <td className="text-left">Cast Spell</td>
                  <td className="text-left">Reduced Spell</td>
                  <td>Base</td>
                  {this.apotheosisActive && (
                    <th>
                      <SpellIcon spell={TALENTS.APOTHEOSIS_TALENT}></SpellIcon>
                    </th>
                  )}
                  {this.lightOfTheNaaruActive && (
                    <th>
                      <SpellIcon spell={TALENTS.LIGHT_OF_THE_NAARU_TALENT}></SpellIcon>
                    </th>
                  )}
                  {this.voiceOfHarmonyActive && (
                    <th>
                      <SpellIcon spell={TALENTS.VOICE_OF_HARMONY_TALENT}></SpellIcon>
                    </th>
                  )}
                  <th> Tier</th>
                  <th> Total Used</th>
                  <th> Wasted</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(this.hwContainer.keys()).map((e, i) => (
                  <tr key={Number(i)}>
                    <td className="text-center">
                      <SpellIcon spell={this.hwContainer[Number(e)].spellNum || 2060} />
                    </td>
                    <td className="text-center">
                      <SpellIcon spell={this.hwContainer[Number(e)].affectedSpell || 2060} />
                    </td>
                    <td>{Math.round((this.hwContainer[e].cdrFromBase || 0) * 10) / 10}s</td>
                    {this.apotheosisActive && (
                      <td>{Math.round((this.hwContainer[e].cdrFromApoth || 0) * 10) / 10}s</td>
                    )}
                    {this.lightOfTheNaaruActive && (
                      <td>{Math.round((this.hwContainer[e].cdrFromLOTN || 0) * 10) / 10}s</td>
                    )}
                    {this.voiceOfHarmonyActive && (
                      <td>{Math.round((this.hwContainer[e].cdrFromVoh || 0) * 10) / 10}s</td>
                    )}
                    <td>{Math.round((this.hwContainer[e].cdrFromTwwTier || 0) * 10) / 10}s</td>
                    <td>{Math.round((this.hwContainer[Number(e)].totalCDR || 0) * 10) / 10}s</td>
                    <td>{Math.round((this.hwContainer[Number(e)].wastedCdr || 0) * 10) / 10}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.HOLY_WORDS}>
          Total holy word CDR from all sources.
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
interface hwCDRBreakdown {
  wastedCdr: number;
  cdrFromBase: number;
  cdrFromLOTN: number;
  cdrFromApoth: number;
  cdrFromTwwTier: number;
  cdrFromVoh: number;
  spellNum: number;
  totalCDR: number;
  affectedSpell: number;
}

export default HolyWordCDRBySpell;
