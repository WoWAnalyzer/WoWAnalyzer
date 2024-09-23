import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import HolyWordCDR from './HolyWordCDR';
import Events, { CastEvent, RemoveBuffEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import { TIERS } from 'game/TIERS';
import { buffedBySurgeOfLight, getSOLFlashCast } from '../../normalizers/CastLinkNormalizer';
import HolyTWW4pS1 from '../tww/HolyTWW4pcS1';
import { HOLY_ENERGY_CYCLE_PROC, TWW_S1_HOLY_4PC_CDR_PROC } from '../../constants';

/**
 * this is just the display function for talents powered by the core of HolyWordCDR
 */

class HolyWordCDRBySpell extends Analyzer {
  static dependencies = {
    holyWordCDR: HolyWordCDR,
    holyTWW4pS1: HolyTWW4pS1,
  };
  protected holyWordCDR!: HolyWordCDR;

  protected holyTWW4pS1!: HolyTWW4pS1;

  private lightOfTheNaaruActive = false;
  private apotheosisActive = false;
  private voiceOfHarmonyActive = false;
  private tierActive = false;
  private tier4pcActive = false;

  private hwContainer: hwCDRBreakdown[] = [];

  constructor(options: Options) {
    super(options);

    this.lightOfTheNaaruActive = this.selectedCombatant.hasTalent(
      TALENTS.LIGHT_OF_THE_NAARU_TALENT,
    );

    this.apotheosisActive =
      this.selectedCombatant.hasTalent(TALENTS.APOTHEOSIS_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.ANSWERED_PRAYERS_TALENT);

    this.voiceOfHarmonyActive = this.selectedCombatant.hasTalent(TALENTS.VOICE_OF_HARMONY_TALENT);

    this.tierActive = this.selectedCombatant.has2PieceByTier(TIERS.TWW1);
    this.tier4pcActive = this.selectedCombatant.has4PieceByTier(TIERS.TWW1);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.castWrapper);

    if (this.selectedCombatant.hasTalent(TALENTS.ENERGY_CYCLE_TALENT)) {
      this.addEventListener(Events.removebuff.by(SELECTED_PLAYER), this.handleEnergyCycle);
      this.addEventListener(Events.removebuffstack.by(SELECTED_PLAYER), this.handleEnergyCycle);
    }
  }

  handleOnCast(event: CastEvent, specialEvent?: string) {
    const hwBreakdown = this.holyWordCDR.handleAny(event, specialEvent);
    let spellId = event.ability.guid;

    if (specialEvent === HOLY_ENERGY_CYCLE_PROC) {
      spellId = TALENTS.ENERGY_CYCLE_TALENT.id;
    }

    let baseCd = hwBreakdown?.cdrFromBase || 0;
    const idealCd = hwBreakdown?.idealTotalCDR || 0;
    // filters out non HW reducing abilities
    if (idealCd === 0) {
      return;
    }
    let vohCD = 0;

    // if Voice of Harmony enables this ability, switch the base CDR to VoH
    if (hwBreakdown?.vohAffectsBase) {
      baseCd = 0;
      vohCD = hwBreakdown.cdrFromBase;
    }

    if (hwBreakdown) {
      const wastedCDR = hwBreakdown.idealTotalCDR - hwBreakdown.actualTotalCDR;
      const cdrFromLotn = hwBreakdown.cdrFromLOTN;
      const cdrFromApoth = hwBreakdown.cdrFromApoth;
      const cdrFromTwwTier = hwBreakdown.cdrFromTwwTier;
      const cdrFromTww4pc = hwBreakdown.cdrFrom4pc;
      const totalEffectiveCDR = baseCd + vohCD + cdrFromApoth + cdrFromLotn + cdrFromTwwTier;
      const affectedSpell = hwBreakdown.affectedSpell;

      if (this.hwContainer[spellId]) {
        this.hwContainer[spellId].wastedCdr +=
          hwBreakdown.idealTotalCDR - hwBreakdown.actualTotalCDR;
        this.hwContainer[spellId].cdrFromBase += baseCd;
        this.hwContainer[spellId].cdrFromLOTN += cdrFromLotn;
        this.hwContainer[spellId].cdrFromApoth += cdrFromApoth;
        this.hwContainer[spellId].cdrFromTwwTier += cdrFromTwwTier;
        this.hwContainer[spellId].cdrFrom4pc += cdrFromTww4pc;
        this.hwContainer[spellId].cdrFromVoh += vohCD;
        this.hwContainer[spellId].totalCDR += totalEffectiveCDR;
        this.hwContainer[spellId].numberOfCasts += 1;
      }
      // first time
      else {
        this.hwContainer[spellId] = {
          wastedCdr: wastedCDR,
          cdrFromBase: baseCd,
          cdrFromLOTN: cdrFromLotn,
          cdrFromApoth: cdrFromApoth,
          cdrFromTwwTier: cdrFromTwwTier,
          cdrFrom4pc: cdrFromTww4pc,
          cdrFromVoh: vohCD,
          spellNum: spellId,
          totalCDR: totalEffectiveCDR,
          affectedSpell: affectedSpell,
          numberOfCasts: 1,
        };
      }
    }
  }

  /**
   *
   * SPECIAL CASES
   *
   */

  castWrapper(event: CastEvent) {
    if (this.holyTWW4pS1.is4pcProc(event)) {
      this.handleOnCast(event, TWW_S1_HOLY_4PC_CDR_PROC);
    } else {
      this.handleOnCast(event);
    }
  }

  handleEnergyCycle(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    // this uses heal event because tww S1 tier set is stupid and doesn't "cast" it just procs a second heal
    // but still consumes SoL potentially
    const castEvent = getSOLFlashCast(event);

    if (castEvent) {
      if (buffedBySurgeOfLight(event)) {
        this.handleOnCast(castEvent, HOLY_ENERGY_CYCLE_PROC);
      }
    }
  }

  roundVal(num: number) {
    return Math.round(num * 10) / 10;
  }

  statistic() {
    this.hwContainer = this.hwContainer.filter(Boolean);
    this.hwContainer.sort((a, b) => {
      if (a.affectedSpell < b.affectedSpell) {
        return -1;
      }
      if (a.affectedSpell > b.affectedSpell) {
        return 1;
      }
      return 0;
    });
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        wide
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <td className="text-center">Cast Spell</td>
                  <td className="text-center">Casts</td>
                  <td className="text-center">Reduced Spell</td>
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
                  {this.tierActive && <th> 2pc</th>}
                  {this.tier4pcActive && <th> 4pc</th>}
                  <th> Total Used</th>
                  <th> Wasted</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(this.hwContainer.keys()).map((e, i) => (
                  <tr key={Number(i)}>
                    <td className="text-center">
                      <SpellIcon spell={this.hwContainer[Number(e)].spellNum} />
                    </td>

                    <td className="text-center">{this.hwContainer[Number(e)].numberOfCasts}</td>
                    <td className="text-center">
                      <SpellIcon spell={this.hwContainer[Number(e)].affectedSpell} />
                    </td>
                    <td>{this.roundVal(this.hwContainer[e].cdrFromBase)}s</td>
                    {this.apotheosisActive && (
                      <td>{this.roundVal(this.hwContainer[e].cdrFromApoth)}s</td>
                    )}
                    {this.lightOfTheNaaruActive && (
                      <td>{this.roundVal(this.hwContainer[e].cdrFromLOTN)}s</td>
                    )}
                    {this.voiceOfHarmonyActive && (
                      <td>{this.roundVal(this.hwContainer[e].cdrFromVoh)}s</td>
                    )}
                    {this.tierActive && (
                      <td>{this.roundVal(this.hwContainer[e].cdrFromTwwTier)}s</td>
                    )}
                    {this.tier4pcActive && (
                      <td>{this.roundVal(this.hwContainer[e].cdrFrom4pc)}s</td>
                    )}
                    <td>{this.roundVal(this.hwContainer[Number(e)].totalCDR)}s</td>
                    <td>{this.roundVal(this.hwContainer[Number(e)].wastedCdr)}s</td>
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

// Add more values here as needed
interface hwCDRBreakdown {
  wastedCdr: number;
  cdrFromBase: number;
  cdrFromLOTN: number;
  cdrFromApoth: number;
  cdrFromTwwTier: number;
  cdrFrom4pc: number;
  cdrFromVoh: number;
  spellNum: number;
  totalCDR: number;
  affectedSpell: number;
  numberOfCasts: number;
}

export default HolyWordCDRBySpell;
