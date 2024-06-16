import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { PerformanceMark } from 'interface/guide';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { QualitativePerformance, getLowestPerf } from 'parser/ui/QualitativePerformance';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import Lifebind from './Lifebind';

const MAX_ECHO_DURATION = 18000;

interface CastInfo {
  timestamp: number;
  numLifebinds: number;
  possibleTargets: number;
  endChannelTime: number;
}

class EmeraldCommunion extends Analyzer {
  static dependencies = {
    lifebind: Lifebind,
    combatants: Combatants,
    spellusable: SpellUsable,
  };
  protected combatants!: Combatants;
  protected lifebind!: Lifebind;
  protected spellusable!: SpellUsable;
  numCasts: number = 0;
  numTaCasts: number = 0;
  casts: CastInfo[] = [];
  percentCovered: number[] = [];
  potentialEchoTargets: Map<number, number> = new Map<number, number>();

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_EVOKER.EMERALD_COMMUNION_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS_EVOKER.LIFEBIND_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.EMERALD_COMMUNION_TALENT),
      this.onCast,
    );
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this.onAlly);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onAlly);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER), this.onAlly);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.EMERALD_COMMUNION_TALENT),
      this.onEndChannel,
    );
  }

  onAlly(event: ApplyBuffEvent | RefreshBuffEvent | HealEvent) {
    if (!this.combatants.getEntity(event)) {
      return;
    }
    this.potentialEchoTargets.set(event.targetID, event.timestamp);
  }

  // check last time we affected a target with a buff/heal and see if it is within length of an echo
  getPotentialTargets(timestamp: number) {
    return Array.from(this.potentialEchoTargets.values()).filter((time) => {
      return time >= timestamp - MAX_ECHO_DURATION;
    }).length;
  }

  onCast(event: ApplyBuffEvent) {
    this.numCasts += 1;
    const possibleTargets = this.getPotentialTargets(event.timestamp);
    this.percentCovered.push(this.lifebind.curNumLifebinds / possibleTargets);
    this.potentialEchoTargets.clear();
    this.casts.push({
      timestamp: event.timestamp,
      numLifebinds: this.lifebind.curNumLifebinds,
      possibleTargets: possibleTargets,
      endChannelTime: 0,
    });
  }

  onEndChannel(event: RemoveBuffEvent) {
    this.casts.at(-1)!.endChannelTime = event.timestamp;
  }

  get percentWithLifebindOnCast() {
    return (
      this.percentCovered.reduce((prev, cur) => {
        return cur + prev;
      }, 0) / this.percentCovered.length
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.percentWithLifebindOnCast,
      isLessThan: {
        major: 0.4,
        average: 0.5,
        minor: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_EVOKER.EMERALD_COMMUNION_TALENT} />
        </b>{' '}
        is a powerful healing CD that restores %HP/%Mana over it's duration. When combined with{' '}
        <SpellLink spell={TALENTS_EVOKER.LIFEBIND_TALENT} /> which can easily be applied to a large
        portion of the raid with <SpellLink spell={TALENTS_EVOKER.RESONATING_SPHERE_TALENT} />,{' '}
        <SpellLink spell={TALENTS_EVOKER.EMERALD_COMMUNION_TALENT} /> will do an insane amount of
        healing that can cover almost any mechanic in the game.
      </p>
    );
    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_EVOKER.EMERALD_COMMUNION_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
          <br />
          {this.casts.map((info, idx) => {
            const header = (
              <>
                <SpellLink spell={TALENTS_EVOKER.EMERALD_COMMUNION_TALENT} /> @{' '}
                {this.owner.formatTimestamp(info.timestamp)}
              </>
            );
            const checklistItems: CooldownExpandableItem[] = [];
            let targetsHitPerf = QualitativePerformance.Good;
            // only check lifebind targets if they are echo build
            if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.STASIS_TALENT)) {
              const percentHit = info.numLifebinds / info.possibleTargets;
              if (percentHit < 0.7) {
                targetsHitPerf = QualitativePerformance.Fail;
              } else if (percentHit < 0.8) {
                targetsHitPerf = QualitativePerformance.Ok;
              }
              checklistItems.push({
                label: (
                  <>
                    Targets with <SpellLink spell={TALENTS_EVOKER.LIFEBIND_TALENT} /> before casting{' '}
                    <SpellLink spell={TALENTS_EVOKER.EMERALD_COMMUNION_TALENT} />
                  </>
                ),
                result: <PerformanceMark perf={targetsHitPerf} />,
                details: (
                  <>
                    {info.numLifebinds}/{info.possibleTargets}
                  </>
                ),
              });
            }
            let ticksPerf = QualitativePerformance.Good;
            const secondsChanneling = Math.max(0, (info.endChannelTime - info.timestamp) / 1000);
            if (secondsChanneling < 3.5) {
              ticksPerf = QualitativePerformance.Fail;
            } else if (secondsChanneling < 4.5) {
              ticksPerf = QualitativePerformance.Ok;
            }
            checklistItems.push({
              label: (
                <>
                  Seconds of channeling{' '}
                  <SpellLink spell={TALENTS_EVOKER.EMERALD_COMMUNION_TALENT} />
                </>
              ),
              result: <PerformanceMark perf={ticksPerf} />,
              details: <>{secondsChanneling.toFixed(1)} seconds</>,
            });
            const lowestPerf = getLowestPerf([ticksPerf, targetsHitPerf]);
            return (
              <CooldownExpandable
                header={header}
                checklistItems={checklistItems}
                perf={lowestPerf}
                key={idx}
              />
            );
          })}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS_EVOKER.EMERALD_COMMUNION_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default EmeraldCommunion;
