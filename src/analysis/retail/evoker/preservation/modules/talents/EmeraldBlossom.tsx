import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { ThresholdStyle } from 'parser/core/ParseResults';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { getHealEvents, isFromFieldOfDreams } from '../../normalizers/EventLinking/helpers';
import { SpellLink } from 'interface';
import { formatNumber, formatPercentage } from 'common/format';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

const BOUNTIFUL_ADDITIONAL_TARGETS = 2;
const BASE_TARGETS = 3;

class EmeraldBlossom extends Analyzer {
  bountifulBloomHealing: number = 0;
  bountifulBloomOverhealing: number = 0;
  extraBountifulHits: number = 0;
  numBlossoms: number = 0;
  totalHits: number = 0;
  totalHealing: number = 0;
  totalOverhealing: number = 0;
  countedTimestamps: Set<number> = new Set<number>();
  castEntries: BoxRowEntry[] = [];
  bountifulRank: number = 0;
  goodThreshold: number = 0;
  perfectThreshold: number = 0;
  totalCastHits: number = 0;

  constructor(options: Options) {
    super(options);
    this.bountifulRank = this.selectedCombatant.getTalentRank(
      TALENTS_EVOKER.BOUNTIFUL_BLOOM_TALENT,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EMERALD_BLOSSOM),
      this.onHealBatch,
    );
    this.perfectThreshold = BASE_TARGETS + this.bountifulRank * BOUNTIFUL_ADDITIONAL_TARGETS;
    this.goodThreshold = BASE_TARGETS - 1 + this.bountifulRank * BOUNTIFUL_ADDITIONAL_TARGETS;
  }

  get averageNumTargets() {
    return this.totalHits / this.numBlossoms;
  }

  get averageExtraTargets() {
    return this.extraBountifulHits / this.numBlossoms;
  }

  processBatch(events: HealEvent[]) {
    if (events.some((ev) => isFromFieldOfDreams(ev))) {
      return;
    }
    this.totalCastHits += events.length;
    let value = QualitativePerformance.Perfect;
    let effective = 0;
    let overheal = 0;
    let timestamp = events.at(0)!.timestamp;
    events.forEach((ev) => {
      effective += ev.amount + (ev.absorbed || 0);
      overheal = ev.overheal || 0;
      timestamp = timestamp < ev.timestamp ? timestamp : ev.timestamp;
    });
    const overhealPercent = overheal / (overheal + effective);
    if (events.length < this.goodThreshold || overhealPercent > 0.8) {
      value = QualitativePerformance.Fail;
    } else if (overhealPercent > 0.7) {
      value = QualitativePerformance.Ok;
    } else if (events.length < this.perfectThreshold || overhealPercent > 0.6) {
      value = QualitativePerformance.Good;
    }
    const tooltip = (
      <>
        @ <strong>{this.owner.formatTimestamp(timestamp)}</strong>, Targets hit:{' '}
        <strong>{events.length}</strong>
        <br />
        <>
          Healing: {formatNumber(effective)} ({formatPercentage(overhealPercent)}% overheal)
        </>
        <br />
      </>
    );
    this.castEntries.push({ value, tooltip });
  }

  // batch process all healevents for single cast to easily decide which to attribute to bountiful
  onHealBatch(event: HealEvent) {
    if (this.countedTimestamps.has(event.timestamp)) {
      return;
    }

    const allHealingEvents = getHealEvents(event);
    this.totalHits += allHealingEvents.length;
    this.numBlossoms += 1;
    for (let i = 0; i < allHealingEvents.length; i += 1) {
      const ev = allHealingEvents[i];
      this.totalHealing += (ev.amount || 0) + (ev.absorbed || 0);
      this.totalOverhealing += ev.overheal || 0;
      if (i >= BASE_TARGETS) {
        // bountiful blossom target
        this.bountifulBloomHealing += (ev.amount || 0) + (ev.absorbed || 0);
        this.bountifulBloomOverhealing += ev.overheal || 0;
        this.extraBountifulHits += 1;
      }
    }
    this.countedTimestamps.add(event.timestamp);
    this.processBatch(allHealingEvents);
  }

  get suggestionThresholds() {
    return {
      actual: this.averageNumTargets,
      isLessThan: {
        minor: 2.5 + this.bountifulRank * BOUNTIFUL_ADDITIONAL_TARGETS,
        average: 2 + this.bountifulRank * BOUNTIFUL_ADDITIONAL_TARGETS,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get avgHitsFromCast() {
    return this.totalCastHits / this.castEntries.length;
  }

  get guideSubsection(): JSX.Element {
    const styleObj = {
      fontSize: 20,
    };
    const styleObjInner = {
      fontSize: 15,
    };
    const explanation = (
      <p>
        <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> is the core spell in the Blossom talent build
        for Preservation Evokers. It is critical to cast{' '}
        <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> on targets that are nearby other allies (more
        often than not this is a melee) so that you can fully utilize its healing, while trying to
        not overheal in the process.
      </p>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div>
            <strong>
              <SpellLink spell={SPELLS.EMERALD_BLOSSOM_CAST} /> casts
            </strong>{' '}
            <small>
              {' '}
              - Blue is a perfect cast with {this.perfectThreshold} targets hit, Green is a good
              cast with {this.goodThreshold} or more with moderate to low overhealing, Yellow is an
              ok cast with a moderate amount of overheal, and Red is a bad cast with high overheal
              or few targets hit. This graphic does not include{' '}
              <SpellLink spell={TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT} /> due to their inherent
              randomness.
            </small>
            <PerformanceBoxRow values={this.castEntries} />
          </div>
          <div style={styleObj}>
            <small style={styleObjInner}>
              <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> -{' '}
            </small>
            <strong>{this.avgHitsFromCast.toFixed(2)}</strong>{' '}
            <small>
              average targets hit per <SpellLink spell={SPELLS.EMERALD_BLOSSOM} />
            </small>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    return this.bountifulRank > 0 && this.averageExtraTargets > 0 ? (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>
              Total Healing from <SpellLink spell={TALENTS_EVOKER.BOUNTIFUL_BLOOM_TALENT} />:{' '}
              {formatNumber(this.bountifulBloomHealing)}
            </li>
            <li>
              Total Overhealing from <SpellLink spell={TALENTS_EVOKER.BOUNTIFUL_BLOOM_TALENT} />:{' '}
              {formatNumber(this.bountifulBloomOverhealing)}
            </li>
            <li>
              Average extra hits from <SpellLink spell={TALENTS_EVOKER.BOUNTIFUL_BLOOM_TALENT} />:{' '}
              {this.averageExtraTargets.toFixed(2)}
            </li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.BOUNTIFUL_BLOOM_TALENT}>
          <ItemHealingDone amount={this.bountifulBloomHealing} />
        </TalentSpellText>
      </Statistic>
    ) : null;
  }
}

export default EmeraldBlossom;
