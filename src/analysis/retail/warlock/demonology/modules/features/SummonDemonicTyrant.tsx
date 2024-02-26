import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  BeginCastEvent,
  BeginChannelEvent,
  EndChannelEvent,
  GlobalCooldownEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import DemoPets from '../pets/DemoPets';
import './SummonTyrant.scss';
import SpellLink from 'interface/SpellLink';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import { CastEvent } from 'parser/core/Events';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import Casts from 'interface/report/Results/Timeline/Casts';
import EmbeddedTimelineContainer, {
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const debug = false;

const CASTS_TO_REMOVE_FROM_TIMELINE = [
  TALENTS.CALL_DREADSTALKERS_TALENT.id,
  TALENTS.SUMMON_DEMONIC_TYRANT_TALENT.id,
  SPELLS.HAND_OF_GULDAN_CAST.id,
  SPELLS.DEMONBOLT.id,
  SPELLS.SHADOW_BOLT_DEMO.id,
  TALENTS.DEMONIC_GATEWAY_TALENT.id,
  SPELLS.INQUISITORS_GAZE_CAST.id,
];

interface TyrantCast {
  event: CastEvent;
  castNumber: number;
  gfgOnCd: boolean;
}

class SummonDemonicTyrant extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
    spellUsable: SpellUsable,
  };

  private demoPets!: DemoPets;
  private spellUsable!: SpellUsable;
  private hasReignOfTyranny = false;
  private hasGFG = false;

  private summsWithDemonicPower: { [id: string]: any }[] = [{}];
  private tyrantsCast = 0;
  private tyrantCasts: TyrantCast[] = [];
  private castTimeline: AnyEvent[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SUMMON_DEMONIC_TYRANT_TALENT);
    if (!this.active) {
      return;
    }
    this.hasReignOfTyranny = this.selectedCombatant.hasTalent(TALENTS.REIGN_OF_TYRANNY_TALENT);
    this.hasGFG = this.selectedCombatant.hasTalent(TALENTS.GRIMOIRE_FELGUARD_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_DEMONIC_TYRANT),
      this.summonDemonicTyrantCast,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER_PET).spell(SPELLS.DEMONIC_POWER),
      this.demonicPowerAppliedToPet,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.begincast.by(SELECTED_PLAYER), this.toTimeline);
    this.addEventListener(Events.EndChannel.by(SELECTED_PLAYER), this.toTimeline);
    this.addEventListener(Events.BeginChannel.by(SELECTED_PLAYER), this.toTimeline);
    this.addEventListener(Events.GlobalCooldown.by(SELECTED_PLAYER), this.toTimeline);
  }

  private summonDemonicTyrantCast(event: CastEvent) {
    this.tyrantsCast += 1;
    this.summsWithDemonicPower[this.tyrantsCast] = {};
    this.tyrantCasts[this.tyrantsCast] = {
      event: event,
      castNumber: this.tyrantsCast,
      gfgOnCd: this.hasGFG
        ? this.spellUsable.isOnCooldown(TALENTS.GRIMOIRE_FELGUARD_TALENT.id)
        : false,
    };
  }

  private demonicPowerAppliedToPet(event: ApplyBuffEvent) {
    if (!event.targetID) {
      debug && this.error('Pet applyBuff event with no targetID', event);
      return;
    }
    const petInfo = this.demoPets._getPetInfo(event.targetID);
    if (!petInfo) {
      debug && this.error(`Pet applyBuff event with nonexistant pet id ${event.sourceID}`);
      return;
    }

    // TODO low prio: fix main pet getting two applications of this buff in the same tyrant
    this.summsWithDemonicPower[this.tyrantsCast][petInfo.name] =
      this.summsWithDemonicPower[this.tyrantsCast][petInfo.name] + 1 || 1;
  }

  private onCast(event: CastEvent) {
    // removes arrow displays for these
    if (CASTS_TO_REMOVE_FROM_TIMELINE.includes(event.ability?.guid)) {
      return;
    }
    this.castTimeline.push(event);
  }

  private toTimeline(
    event: BeginCastEvent | BeginChannelEvent | EndChannelEvent | GlobalCooldownEvent,
  ) {
    this.castTimeline.push(event);
  }

  private get numTyrCasts(): number {
    return this.summsWithDemonicPower.length - 1;
  }

  private get populatedEmpoweredDemonsTable() {
    const populatedSumms = structuredClone(this.summsWithDemonicPower);

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

    if (this.hasReignOfTyranny) {
      populatedSumms.forEach((_, index) => {
        populatedSumms[index]['RoT Buff'] = populatedSumms[index]['Total'] * 10 + '%';
      });
    }

    return populatedSumms;
  }

  private get empoweredDemonsTable(): JSX.Element {
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
                {Number(key) !== 0 ? Number(key) : 'Avg.'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{petTableRows}</tbody>
      </table>
    );

    return petTable;
  }

  private getPerformanceExplanation(
    actualPerformance: QualitativePerformance,
    dogs: boolean,
    gfg: boolean,
    imps: number,
  ): JSX.Element {
    const impsExtended = `${imps}/${this.hasReignOfTyranny ? '15' : '10'} imps`;
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

  private getDogsChecklistItem(tyrantCastNum: number) {
    const castEvent = this.tyrantCasts[tyrantCastNum];
    const dogsPerformance =
      this.summsWithDemonicPower[tyrantCastNum]['Dreadstalker'] > 1
        ? QualitativePerformance.Perfect
        : QualitativePerformance.Fail;

    const dogsSummary = (
      <>
        {this.summsWithDemonicPower[tyrantCastNum]['Dreadstalker'] || 0}/2{' '}
        <SpellLink spell={TALENTS.CALL_DREADSTALKERS_TALENT} />
      </>
    );

    const dogsDetails = (
      <div>
        {this.summsWithDemonicPower[tyrantCastNum]['Dreadstalker'] || 0}/2{' '}
        <SpellLink spell={TALENTS.CALL_DREADSTALKERS_TALENT} /> - these should always be extended
      </div>
    );

    return {
      check: 'dogs',
      timestamp: castEvent.event.timestamp,
      performance: dogsPerformance,
      summary: dogsSummary,
      details: dogsDetails,
    };
  }

  private getImpsPerformance(imps: number): QualitativePerformance {
    if ((this.hasReignOfTyranny && imps === 15) || imps === 10) {
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

  private getImpsChecklistItem(tyrantCastNum: number) {
    const castEvent = this.tyrantCasts[tyrantCastNum];
    const impsSummary = (
      <>
        {this.summsWithDemonicPower[tyrantCastNum]['Wild Imp'] || 0}/
        {this.hasReignOfTyranny ? '15' : '10'} <SpellLink spell={SPELLS.WILD_IMP_HOG_SUMMON} />
      </>
    );

    const impsDetails = (
      <div>
        {this.summsWithDemonicPower[tyrantCastNum]['Wild Imp'] || 0}/
        {this.hasReignOfTyranny ? '15' : '10'} <SpellLink spell={SPELLS.WILD_IMP_HOG_SUMMON} /> -
        you should extend as many <SpellLink spell={SPELLS.WILD_IMP_HOG_SUMMON} />s as possible,
        always save <SpellLink spell={SPELLS.DEMONIC_CORE_BUFF} />s to spend during this set up
      </div>
    );

    return {
      check: 'imps',
      timestamp: castEvent.event.timestamp,
      performance: this.getImpsPerformance(this.summsWithDemonicPower[tyrantCastNum]['Wild Imp']),
      summary: impsSummary,
      details: impsDetails,
    };
  }

  private getGFGChecklistItem(tyrantCastNum: number) {
    const castEvent = this.tyrantCasts[tyrantCastNum];

    let goodGFG = true;
    if (tyrantCastNum === 1 && this.summsWithDemonicPower[tyrantCastNum]['Felguard'] !== 1) {
      goodGFG = false;
    }
    // can consider as perfect cast if tyrant cast before GFG is up
    if (
      this.summsWithDemonicPower[tyrantCastNum]['Felguard'] !== 1 &&
      !this.tyrantCasts[tyrantCastNum].gfgOnCd
    ) {
      goodGFG = false;
    }

    const gfgPerformance = goodGFG ? QualitativePerformance.Perfect : QualitativePerformance.Fail;

    const gfgSummary = (
      <div>
        {this.summsWithDemonicPower[tyrantCastNum]['Felguard'] || 0}/1{' '}
        <SpellLink spell={TALENTS.GRIMOIRE_FELGUARD_TALENT} />
      </div>
    );

    const gfgDetails = (
      <div>
        {this.summsWithDemonicPower[tyrantCastNum]['Felguard'] || 0}/1{' '}
        <SpellLink spell={TALENTS.GRIMOIRE_FELGUARD_TALENT} /> - this must always be extended though
        in some encounters you will want to prioritize{' '}
        <SpellLink spell={TALENTS.SUMMON_DEMONIC_TYRANT_TALENT} /> usage
      </div>
    );

    return {
      check: 'gfg',
      timestamp: castEvent.event.timestamp,
      performance: gfgPerformance,
      summary: gfgSummary,
      details: gfgDetails,
    };
  }

  private calcTyrantUsage(tyrantCastNum: number): SpellUse {
    const castEvent = this.tyrantCasts[tyrantCastNum];
    const checklistItems: ChecklistUsageInfo[] = [];

    const goodDogs = this.summsWithDemonicPower[tyrantCastNum]['Dreadstalker'] > 1;
    checklistItems.push(this.getDogsChecklistItem(tyrantCastNum));

    const imps = this.summsWithDemonicPower[tyrantCastNum]['Wild Imp'];
    checklistItems.push(this.getImpsChecklistItem(tyrantCastNum));

    let goodGFG = true;
    if (this.hasGFG) {
      checklistItems.push(this.getGFGChecklistItem(tyrantCastNum));
      goodGFG =
        checklistItems[checklistItems.length - 1].performance === QualitativePerformance.Perfect;
    }

    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );

    const performanceExplanation = this.getPerformanceExplanation(
      actualPerformance,
      goodDogs,
      goodGFG,
      imps,
    );

    const end = castEvent.event.timestamp + 1000 > 0 ? castEvent.event.timestamp + 1000 : 0;
    const start = castEvent.event.timestamp - 16000;
    const tyrantSetup: AnyEvent[] = this.castTimeline.filter(
      (cast) => cast.timestamp > start && cast.timestamp < end,
    );

    // TODO: add movement overlay and timestamps (like in main timeline view)
    // use "during serenity" example http://localhost:3000/report/myndpGBw3k7rjVDf/4-Mythic+Smolderon+-+Kill+(7:01)/Chonkychan/standard/overview
    return {
      event: castEvent.event,
      checklistItems,
      performance: actualPerformance,
      performanceExplanation,
      extraDetails: (
        <div
          style={{
            overflowX: 'auto',
          }}
        >
          <EmbeddedTimelineContainer secondWidth={43} secondsShown={(end! - start) / 1000}>
            <SpellTimeline>
              <Casts start={start} movement={undefined} secondWidth={43} events={tyrantSetup} />
            </SpellTimeline>
          </EmbeddedTimelineContainer>
        </div>
      ),
    };
  }

  private calculateTyrantUses(): SpellUse[] {
    const uses: SpellUse[] = [];

    for (let tyrCast = 1; tyrCast <= this.numTyrCasts; tyrCast += 1) {
      uses.push(this.calcTyrantUsage(tyrCast));
    }

    return uses;
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <SpellLink spell={SPELLS.SUMMON_DEMONIC_TYRANT} /> is our main offensive cooldown together
        with <SpellLink spell={TALENTS.GRIMOIRE_FELGUARD_TALENT} />. It's value comes from extending
        most of our active demons for 15 seconds, including up to 10{' '}
        <SpellLink spell={SPELLS.WILD_IMP_HOG_SUMMON} />s{' '}
        {this.hasReignOfTyranny ? (
          <>
            {' ('}15 with <SpellLink spell={TALENTS.REIGN_OF_TYRANNY_TALENT} />)
          </>
        ) : (
          ''
        )}
        . Most of the time you will be prioritising{' '}
        <SpellLink spell={TALENTS.GRIMOIRE_FELGUARD_TALENT} /> usage and delaying the Tyrant to
        extend it.
      </>
    );

    return (
      <ContextualSpellUsageSubSection
        title="Demonic Tyrant"
        explanation={explanation}
        uses={this.calculateTyrantUses()}
        castBreakdownSmallText={
          <>
            {' '}
            - Blue and Green are great casts, Yellow means you missed a lot of imps and Red means
            you missed major summons
          </>
        }
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
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
        tooltip="Number of pets empowered by each Demonic Tyrant summon."
        dropdown={this.empoweredDemonsTable}
      >
        <BoringSpellValueText spell={SPELLS.SUMMON_DEMONIC_TYRANT}>
          <p>
            {avgDemonsEmpowered.toFixed(1)} <small>Avg. demons buffed</small>
          </p>
          {this.hasReignOfTyranny && (
            <p>
              {avgRoTBuff} <small>Avg. RoT bonus dmg</small>
            </p>
          )}
          <p>
            {avgWildImpsEmpowered.toFixed(1)}/{this.hasReignOfTyranny ? 15 : 10}{' '}
            <small>Avg. imps buffed</small>
          </p>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SummonDemonicTyrant;
