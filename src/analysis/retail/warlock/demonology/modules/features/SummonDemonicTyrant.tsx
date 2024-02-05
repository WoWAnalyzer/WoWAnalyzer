import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import DemoPets from '../pets/DemoPets';
import './SummonTyrant.scss';

const debug = false;

class SummonDemonicTyrant extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  demoPets!: DemoPets;
  _reignOfTyrannyPower!: number[];
  _hasReignOfTyranny!: boolean;
  _petsPerCast!: Record<number, number>[];

  _summsWithDemonicPower!: { [id: string]: any }[];
  _tyrantCast!: number;

  constructor(options: Options) {
    super(options);
    this._tyrantCast = 0;
    this._summsWithDemonicPower = [];
    this._summsWithDemonicPower[0] = {};
    this._hasReignOfTyranny = this.selectedCombatant.hasTalent(TALENTS.REIGN_OF_TYRANNY_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_DEMONIC_TYRANT),
      this.summonDemonicTyrantCast,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER_PET).spell(SPELLS.DEMONIC_POWER),
      this.demonicPowerAppliedToPet,
    );
  }

  summonDemonicTyrantCast() {
    this._tyrantCast += 1;
    this._summsWithDemonicPower[this._tyrantCast] = {};
  }

  demonicPowerAppliedToPet(event: ApplyBuffEvent) {
    if (!event.targetID) {
      debug && this.error('Pet applyBuff event with no targetID', event);
      return;
    }
    const petInfo = this.demoPets._getPetInfo(event.targetID);
    if (!petInfo) {
      debug && this.error(`Pet applyBuff event with nonexistant pet id ${event.sourceID}`);
      return;
    }

    // TODO fix main pet getting two applications of this buff in the same tyrant
    this._summsWithDemonicPower[this._tyrantCast][petInfo.name] =
      this._summsWithDemonicPower[this._tyrantCast][petInfo.name] + 1 || 1;
  }

  statistic() {
    const numTyrCasts = this._summsWithDemonicPower.length - 1;

    // add averages
    for (let tyrCast = 0; tyrCast <= numTyrCasts; tyrCast += 1) {
      // this should start at 1 but everything dies if it doesn't start at 0
      this._summsWithDemonicPower[tyrCast]['Total'] = Object.values(
        this._summsWithDemonicPower[tyrCast],
      ).reduce((a, c) => a + c, 0);

      for (const [key, value] of Object.entries(this._summsWithDemonicPower[tyrCast])) {
        if (!this._summsWithDemonicPower[0][key]) {
          this._summsWithDemonicPower[0][key] = 0;
        }
        this._summsWithDemonicPower[0][key] += value;
      }
    }

    for (const key of Object.keys(this._summsWithDemonicPower[0])) {
      this._summsWithDemonicPower[0][key] /= numTyrCasts;
    }

    let RoTAvgBuff = 0;
    if (this._hasReignOfTyranny) {
      this._summsWithDemonicPower.forEach((_, index) => {
        this._summsWithDemonicPower[index]['RoT Buff'] =
          this._summsWithDemonicPower[index]['Total'] * 10 + '%';
      });
      RoTAvgBuff = this._summsWithDemonicPower[0]['RoT Buff'];
    }

    let row = 0;
    const petTableRows = Object.keys(this._summsWithDemonicPower[0]).map((demonSource) => {
      row += 1;
      return (
        <tr key={'row' + demonSource}>
          <td className="tyr-align-left">{demonSource}</td>
          {Object.entries(this._summsWithDemonicPower).map(([key, tyrCastSumms]) => (
            <td className={row % 2 ? 'tyr-odd-row' : ''} key={demonSource + key}>
              {tyrCastSumms[demonSource]}
            </td>
          ))}
        </tr>
      );
    });

    const petTable = (
      <table className="tyr-table">
        <thead>
          <tr>
            <th className="tyr-align-left">Tyrant Cast</th>
            {Object.keys(this._summsWithDemonicPower).map((key) => (
              <th className="tyr-align-center" key={'tyrcast' + key}>
                {Number(key) !== 0 ? Number(key) : 'Average'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{petTableRows}</tbody>
      </table>
    );

    const avgDemonsEmpowered = Number(this._summsWithDemonicPower[0]['Total']);
    const avgWildImpsEmpowered = Number(this._summsWithDemonicPower[0]['Wild Imp']);

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        tooltip="Number of pets empowered by each Demonic Tyrant summon."
        dropdown={petTable}
      >
        <BoringSpellValueText spell={SPELLS.SUMMON_DEMONIC_TYRANT}>
          {avgDemonsEmpowered.toFixed(1)} <small>Avg. demons buffed</small>
          <br />
          {this._hasReignOfTyranny && <small>{RoTAvgBuff} Avg. RoT bonus dmg</small>}
          {this._hasReignOfTyranny && <br />}
          <small>
            {avgWildImpsEmpowered.toFixed(1)}/{this._hasReignOfTyranny ? 15 : 10} Avg. imps buffed
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SummonDemonicTyrant;
