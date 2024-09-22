import talents from 'common/TALENTS/deathknight';
import spells from 'common/SPELLS/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  FightEndEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

interface ErwCast {
  timestamp: number;
  wastedRp: number;
  wastedRunes: number;
  gainedRp: number;
  gainedRunes: number;
}

export default class EmpowerRuneWeapon extends Analyzer {
  erwTracker: ErwCast[] = [];

  currentTimestamp = 0;
  wastedRp = 0;
  wastedRunes = 0;
  gainedRunes = 0;
  gainedRp = 0;

  constructor(options: Options) {
    super(options);

    this.currentTimestamp = 0;

    //throwing an error. These talents no longer exist.
    //Would love to see if this has downstream effects LMAO
    /*     this.active =
      this.selectedCombatant.hasTalent(talents.EMPOWER_RUNE_WEAPON_SHARED_TALENT) ||
      this.selectedCombatant.hasTalent(talents.EMPOWER_RUNE_WEAPON_FROST_TALENT); */
    this.active = this.selectedCombatant.hasTalent(talents.EMPOWER_RUNE_WEAPON_TALENT);

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(spells.EMPOWER_RUNE_WEAPON),
      this.onResourceGain,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(spells.EMPOWER_RUNE_WEAPON),
      this.onErwStart,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(spells.EMPOWER_RUNE_WEAPON),
      this.onErwEnd,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(spells.EMPOWER_RUNE_WEAPON),
      this.onErwEnd,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onErwStart(event: ApplyBuffEvent) {
    this.currentTimestamp = event.timestamp;
  }

  onResourceGain(event: ResourceChangeEvent) {
    if (event.resourceChangeType === RESOURCE_TYPES.RUNES.id) {
      this.gainedRunes += event.resourceChange - event.waste;
      this.wastedRunes += event.waste;
    } else if (event.resourceChangeType === RESOURCE_TYPES.RUNIC_POWER.id) {
      this.gainedRp += event.resourceChange - event.waste;
      this.wastedRp += event.waste;
    }
  }

  onErwEnd(event: RemoveBuffEvent | RefreshBuffEvent) {
    this.erwTracker.push({
      timestamp: this.currentTimestamp,
      wastedRp: this.wastedRp,
      wastedRunes: this.wastedRunes,
      gainedRunes: this.gainedRunes,
      gainedRp: this.gainedRp,
    });
    this.wastedRp = 0;
    this.wastedRunes = 0;
    this.gainedRp = 0;
    this.gainedRunes = 0;
  }

  onFightEnd(event: FightEndEvent) {
    if (this.selectedCombatant.hasBuff(spells.EMPOWER_RUNE_WEAPON.id)) {
      this.erwTracker.push({
        timestamp: this.currentTimestamp,
        wastedRp: this.wastedRp,
        wastedRunes: this.wastedRunes,
        gainedRunes: this.gainedRunes,
        gainedRp: this.gainedRp,
      });
    }
  }

  get guideCastBreakdown() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={spells.EMPOWER_RUNE_WEAPON} />
        </strong>{' '}
        is a strong resource cooldown used primarily to extend{' '}
        <SpellLink spell={talents.BREATH_OF_SINDRAGOSA_TALENT} />. It is best used to extend your
        Breath when you notice you can no longer generate enough RP to stop the drain. This is
        typically when you have no Runes available and do not get a
        <SpellLink spell={spells.RUNIC_EMPOWERMENT} /> proc
      </p>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.erwTracker.map((cast, idx) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink spell={spells.EMPOWER_RUNE_WEAPON} />
            </>
          );
          const checklistItems: CooldownExpandableItem[] = [];
          const runicPowerPerf = cast.wastedRp
            ? QualitativePerformance.Fail
            : QualitativePerformance.Good;
          checklistItems.push({
            label: 'Runic Power Gained',
            result: <PerformanceMark perf={runicPowerPerf} />,
            details: <>{cast.gainedRp - cast.wastedRp}</>,
          });

          const runesPerf = cast.wastedRunes
            ? QualitativePerformance.Fail
            : QualitativePerformance.Good;
          checklistItems.push({
            label: 'Runes Gained',
            result: <PerformanceMark perf={runesPerf} />,
            details: <>{cast.gainedRunes - cast.wastedRunes}</>,
          });

          let overallPerf = QualitativePerformance.Good;
          if (cast.wastedRp > 0 || cast.wastedRunes > 0) {
            overallPerf = QualitativePerformance.Ok;
          }
          if (cast.wastedRp > 0 && cast.wastedRp) {
            overallPerf = QualitativePerformance.Ok;
          }

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={overallPerf}
              key={idx}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}
