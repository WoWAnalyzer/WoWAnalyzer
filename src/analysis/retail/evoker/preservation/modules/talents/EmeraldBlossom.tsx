import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent, CastEvent, GetRelatedEvents } from 'parser/core/Events';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { formatNumber } from 'common/format';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import CastDetail, {
  type PerCastData,
  type PerCastStat,
} from 'interface/guide/components/CastDetail';
import { isCastFromEB } from 'analysis/retail/evoker/shared/modules/normalizers/EssenceBurstCastLinkNormalizer';
import { EMERALD_BLOSSOM_CAST } from '../../normalizers/EventLinking/constants';

class EmeraldBlossom extends Analyzer {
  numBlossoms = 0;
  totalHits = 0;
  totalHealing = 0;
  totalOverhealing = 0;
  countedTimestamps: Set<number> = new Set<number>();
  castEntries: PerCastData[] = [];
  goodThreshold = 0;
  perfectThreshold = 0;
  totalCastHits = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EMERALD_BLOSSOM_CAST),
      this.onBlossomCast,
    );
  }

  onBlossomCast(event: CastEvent) {
    const blossomHealing = GetRelatedEvents<HealEvent>(event, EMERALD_BLOSSOM_CAST);
    const blossomHeals = [];
    const seedlingsHeals = [];
    const data = {
      essenceBurst: isCastFromEB(event),
      totalTargets: 0,
      blossomTargets: 0,
      blossomHealing: 0,
      seedlingsTargets: 0,
      seedlingsHealing: 0,
    };

    blossomHealing.forEach((heal) => {
      data.totalTargets++;
      if (heal.ability.guid === SPELLS.FLUTTERING_SEEDLINGS_HEAL.id) {
        seedlingsHeals.push(heal);
        data.seedlingsTargets++;
        data.seedlingsHealing += (heal.amount || 0) + (heal.absorbed || 0);
      } else {
        blossomHeals.push(heal);
        data.blossomTargets++;
        data.blossomHealing += (heal.amount || 0) + (heal.absorbed || 0);
      }
    });

    let info = '';
    let performance = QualitativePerformance.Perfect;
    if (!data.essenceBurst) {
      performance = QualitativePerformance.Fail;
      info = 'Emerald Blossom should be cast with an essence burst.';
    } else if (data.totalTargets < 3) {
      performance = QualitativePerformance.Fail;
    } else if (data.totalTargets < 5) {
      performance = QualitativePerformance.Ok;
    } else if (data.totalTargets < 7) {
      performance = QualitativePerformance.Good;
    }

    const stats: PerCastStat[] = [
      {
        label: 'Essence',
        value: data.essenceBurst ? 'Essence Burst' : 'Natural Essence',
        tooltip: data.essenceBurst
          ? 'This Blossom was cast while Essence Burst was active.'
          : 'This Blossom was cast with natural Essence.',
      },
      {
        label: 'Blossom Targets',
        value: `${data.blossomTargets}`,
        tooltip: `This cast hit ${data.blossomTargets} targets.`,
      },
      {
        label: 'Blossom Healing',
        value: formatNumber(data.blossomHealing),
        tooltip: `Emerald Blossom Healing: ${formatNumber(data.blossomHealing)}.`,
      },
      {
        label: 'Seedlings',
        value: `${data.seedlingsTargets}`,
        tooltip: `This Blossom produced ${data.seedlingsTargets} Fluttering Seedlings.`,
      },
      {
        label: 'Seedling Heal',
        value: formatNumber(data.seedlingsHealing),
        tooltip: `Healing dealt by Fluttering Seedlings: ${formatNumber(data.seedlingsHealing)}.`,
      },
    ];

    const castEntry = {
      performance: performance,
      timestamp: this.owner.formatTimestamp(event.timestamp),
      stats,
      details: info,
      tooltip: (
        <>
          <p>
            @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong>
          </p>
        </>
      ),
    };

    this.castEntries.push(castEntry);
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> is a core spell in the Preservation Evoker
          kit and you should use the vast majority of your{' '}
          <SpellLink spell={TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT} /> on it. Every{' '}
          <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> cast will generate a stack of{' '}
          <SpellLink spell={TALENTS_EVOKER.TWIN_ECHOES_TALENT} /> which gives you an extra{' '}
          <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> later on.
        </p>
        <p>
          Thanks to <SpellLink spell={TALENTS_EVOKER.FLUTTERING_SEEDLINGS_TALENT} /> you don't need
          to aim the <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> towards a stacked group of
          players, as any misses will be replaced by seedlings that do a very similar amount of
          healing.
        </p>
      </>
    );

    const data =
      this.castEntries.length === 0 ? (
        <div>
          <RoundedPanel>
            <strong>
              No <SpellLink spell={SPELLS.EMERALD_BLOSSOM_CAST} /> cast.
            </strong>
          </RoundedPanel>
        </div>
      ) : (
        <div>
          <RoundedPanel>
            <CastDetail title="Emerald Blossom Casts" casts={this.castEntries} />
          </RoundedPanel>
        </div>
      );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default EmeraldBlossom;
