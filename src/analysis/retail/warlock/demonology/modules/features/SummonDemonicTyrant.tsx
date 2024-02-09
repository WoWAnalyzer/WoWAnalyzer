import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

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

  get numTyrCasts(): number {
    return this._summsWithDemonicPower.length - 1;
  }

  get populatedEmpoweredDemonsTable() {
    const populatedSumms = structuredClone(this._summsWithDemonicPower);

    // add averages
    for (let tyrCast = 0; tyrCast <= this.numTyrCasts; tyrCast += 1) {
      // this should start at 1 but everything dies if it doesn't start at 0
      populatedSumms[tyrCast]['Total'] = Object.values(populatedSumms[tyrCast]).reduce(
        (a, c) => a + c,
        0,
      );

      for (const [key, value] of Object.entries(populatedSumms[tyrCast])) {
        if (!populatedSumms[0][key]) {
          populatedSumms[0][key] = 0;
        }
        populatedSumms[0][key] += value;
      }
    }

    for (const key of Object.keys(populatedSumms[0])) {
      populatedSumms[0][key] /= this.numTyrCasts;
      if (populatedSumms[0][key].toString().length > 3) {
        populatedSumms[0][key] = populatedSumms[0][key].toFixed(1);
      }
    }

    if (this._hasReignOfTyranny) {
      populatedSumms.forEach((_, index) => {
        populatedSumms[index]['RoT Buff'] = populatedSumms[index]['Total'] * 10 + '%';
      });
    }

    return populatedSumms;
  }

  get empoweredDemonsTable(): JSX.Element {
    const empoweredDemons = this.populatedEmpoweredDemonsTable;

    let row = 0;
    const petTableRows = Object.keys(empoweredDemons[0]).map((demonSource) => {
      row += 1;
      return (
        <tr key={'row' + demonSource} className={row % 2 ? 'tyr-odd-row' : ''}>
          <td className="tyr-align-left">{demonSource}</td>
          {Object.entries(empoweredDemons).map(([key, tyrCastSumms]) => (
            <td key={demonSource + key}>{tyrCastSumms[demonSource]}</td>
          ))}
        </tr>
      );
    });

    const petTable = (
      <table className="tyr-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Tyrant Cast</th>
            {Object.keys(empoweredDemons).map((key) => (
              <th className="tyr-align-center" key={'tyrcast' + key}>
                {Number(key) !== 0 ? Number(key) : 'Average'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{petTableRows}</tbody>
      </table>
    );

    return petTable;
  }

  get guideSubsection(): JSX.Element {
    const explanation = <p>Test</p>;

    const data = (
      <div>
        <strong>Summon Demonic Tyrant casts</strong>
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    const empoweredDemons = this.populatedEmpoweredDemonsTable;

    const avgDemonsEmpowered = Number(empoweredDemons[0]['Total']);
    const avgWildImpsEmpowered = Number(empoweredDemons[0]['Wild Imp']);
    const avgRoTBuff = empoweredDemons[0]['RoT Buff'];

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        tooltip="Number of pets empowered by each Demonic Tyrant summon."
        dropdown={this.empoweredDemonsTable}
      >
        <BoringSpellValueText spell={SPELLS.SUMMON_DEMONIC_TYRANT}>
          <p>
            {avgDemonsEmpowered.toFixed(1)} <small>Avg. demons buffed</small>
          </p>
          {this._hasReignOfTyranny && (
            <p>
              {avgRoTBuff} <small>Avg. RoT bonus dmg</small>
            </p>
          )}
          <p>
            {avgWildImpsEmpowered.toFixed(1)}/{this._hasReignOfTyranny ? 15 : 10}{' '}
            <small>Avg. imps buffed</small>
          </p>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SummonDemonicTyrant;
