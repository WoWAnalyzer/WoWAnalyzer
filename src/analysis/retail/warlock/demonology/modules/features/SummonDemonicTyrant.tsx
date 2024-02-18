import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import DemoPets from '../pets/DemoPets';
import './SummonTyrant.scss';
import SpellLink from 'interface/SpellLink';
// import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import { CastEvent } from 'parser/core/Events';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';

const debug = false;

interface TyrantCast {
  event: CastEvent;
  castNumber: number;
  demonsEmpowered: { [id: string]: any };
}

class SummonDemonicTyrant extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  demoPets!: DemoPets;
  _reignOfTyrannyPower!: number[];
  _hasReignOfTyranny!: boolean;
  _hasGFG!: boolean;

  _summsWithDemonicPower!: { [id: string]: any }[]; // TODO remove in favour of tyrantCasts
  _tyrantsCast!: number;
  _tyrantCasts!: TyrantCast[];

  constructor(options: Options) {
    super(options);
    this._tyrantsCast = 0;
    this._summsWithDemonicPower = [];
    this._summsWithDemonicPower[0] = {};
    this._hasReignOfTyranny = this.selectedCombatant.hasTalent(TALENTS.REIGN_OF_TYRANNY_TALENT);
    this._hasGFG = this.selectedCombatant.hasTalent(TALENTS.GRIMOIRE_FELGUARD_TALENT);
    this._tyrantCasts = [];

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_DEMONIC_TYRANT),
      this.summonDemonicTyrantCast,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER_PET).spell(SPELLS.DEMONIC_POWER),
      this.demonicPowerAppliedToPet,
    );
  }

  summonDemonicTyrantCast(event: CastEvent) {
    this._tyrantsCast += 1;
    this._summsWithDemonicPower[this._tyrantsCast] = {};
    this._tyrantCasts[this._tyrantsCast] = {
      event: event,
      castNumber: this._tyrantsCast,
      demonsEmpowered: {},
    };
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
    this._summsWithDemonicPower[this._tyrantsCast][petInfo.name] =
      this._summsWithDemonicPower[this._tyrantsCast][petInfo.name] + 1 || 1;
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

  getQualitativePerformanceForTyrant(
    gfg: boolean,
    dogs: boolean,
    imps: number,
  ): QualitativePerformance {
    if (!gfg || !dogs) {
      return QualitativePerformance.Fail;
    }

    if ((this._hasReignOfTyranny && imps === 15) || imps === 10) {
      return QualitativePerformance.Perfect;
    }

    if (imps >= 7) {
      return QualitativePerformance.Good;
    }

    if (imps >= 3) {
      return QualitativePerformance.Ok;
    }

    return QualitativePerformance.Fail;
  }

  getPerformanceExplanation(
    actualPerformance: QualitativePerformance,
    dogs: boolean,
    gfg: boolean,
    imps: number,
  ): JSX.Element {
    const impsExtended = `${imps}/${this._hasReignOfTyranny ? '15' : '10'} imps`;
    switch (actualPerformance) {
      case QualitativePerformance.Perfect:
        return <>Perfect usage, you extended the most demons possible</>;
      case QualitativePerformance.Good:
        return <>Good usage, you extended {impsExtended}</>;
      case QualitativePerformance.Ok:
        return <>Bad usage, you extended {impsExtended}</>;
      default: // QualitativePerformance.Fail
        return dogs && gfg ? (
          <>Terrible usage, you only extended ${impsExtended}</>
        ) : dogs ? (
          <>
            Terrible usage, you missed <SpellLink spell={TALENTS.GRIMOIRE_FELGUARD_TALENT} />
          </>
        ) : (
          <>
            Terrible usage, you missed <SpellLink spell={TALENTS.CALL_DREADSTALKERS_TALENT} />
          </>
        );
    }
  }

  calcTyrantUsage(tyrantCastNum: number): SpellUse {
    const castEvent = this._tyrantCasts[tyrantCastNum];

    // performance
    let goodGFG = true;
    if (this._hasGFG) {
      if (tyrantCastNum === 1 && this._summsWithDemonicPower[tyrantCastNum]['Felguard'] !== 1) {
        goodGFG = false;
      }
      // can consider as perfect cast if tyrant cast before GFG is up
      if (this._summsWithDemonicPower[tyrantCastNum]['Felguard'] !== 1) {
        goodGFG = false;
        // TODO add check for can consider as perfect cast if tyrant cast before GFG is up
      }
    }

    const goodDogs = this._summsWithDemonicPower[tyrantCastNum]['Dreadstalker'] > 1;

    const performance = this.getQualitativePerformanceForTyrant(
      goodGFG,
      goodDogs,
      this._summsWithDemonicPower[tyrantCastNum]['Wild Imp'],
    );

    const summary = <div>summary asd</div>;

    const details = <div>details</div>;

    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'idk-what-this-is',
        timestamp: castEvent.event.timestamp,
        performance,
        summary,
        details,
      },
    ];

    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );

    const imps = this._summsWithDemonicPower[tyrantCastNum]['Wild Imp'];
    const performanceExplanation = this.getPerformanceExplanation(
      actualPerformance,
      goodDogs,
      goodGFG,
      imps,
    );

    return {
      event: castEvent.event,
      checklistItems,
      performance,
      performanceExplanation,
    };
  }

  calculateTyrantUses(): SpellUse[] {
    const uses: SpellUse[] = [];

    for (let tyrCast = 1; tyrCast <= this.numTyrCasts; tyrCast += 1) {
      uses.push(this.calcTyrantUsage(tyrCast));
    }

    return uses;
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.SUMMON_DEMONIC_TYRANT} />
        </strong>{' '}
        is your main offensive cooldown lorem ipsum dolor sit amet consectetur adipisicing elit.
        Sapiente fuga ipsum sit nisi quam magnam vitae dignissimos, asperiores cum alias animi
        commodi labore vel autem ratione inventore pariatur quisquam ut cupiditate veniam nostrum
        fugit! Officiis, dolore. Dolores alias natus laborum nemo aliquam ducimus numquam aut vel
        aliquid eaque, debitis at!
      </p>
    );

    // const empoweredDemons = this.populatedEmpoweredDemonsTable;
    // const castEntries: BoxRowEntry[] = [];
    // for (let tyrCast = 1; tyrCast <= this.numTyrCasts; tyrCast += 1) {
    //   const value = QualitativePerformance.Good
    //   const tooltip = (
    //     <div>{Object.entries(empoweredDemons[tyrCast]).map(([demon, num]) => (
    //       <p key={"guideTyrTooltip"+tyrCast+demon+num}>{demon} : {num}</p>
    //     ))}
    //     </div>
    //   )
    //   castEntries.push({value, tooltip})
    // }

    return (
      <ContextualSpellUsageSubSection
        title="Demonic Tyrant"
        explanation={explanation}
        uses={this.calculateTyrantUses()}
      />
    );
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
