import SPELLS from 'common/SPELLS/midnight/trinkets';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { RemoveBuffEvent } from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';

const FANATICAL_INSPIRATION_STAT_AMOUNT = 173;
const SECONDARY_STATS = ['crit', 'haste', 'mastery', 'versatility'] as const;

type SecondaryStat = (typeof SECONDARY_STATS)[number];

export default class FanaticalInspiration extends Analyzer.withDependencies({
  statTracker: StatTracker,
}) {
  private activeStat: SecondaryStat | null = null;

  constructor(options: Options) {
    super(options);

    this.deps.statTracker.add(SPELLS.FANATICAL_INSPIRATION.id, {
      crit: () => this.statAmount('crit'),
      haste: () => this.statAmount('haste'),
      mastery: () => this.statAmount('mastery'),
      versatility: () => this.statAmount('versatility'),
    });

    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.FANATICAL_INSPIRATION),
      this.onRemoveBuff,
    );
  }

  private statAmount(stat: SecondaryStat): number {
    return this.selectedStat === stat ? FANATICAL_INSPIRATION_STAT_AMOUNT : 0;
  }

  private get selectedStat(): SecondaryStat {
    if (this.activeStat === null) {
      this.activeStat = this.highestSecondaryStat();
    }

    return this.activeStat;
  }

  private highestSecondaryStat(): SecondaryStat {
    return SECONDARY_STATS.reduce((highest, current) =>
      this.currentStatRating(current) > this.currentStatRating(highest) ? current : highest,
    );
  }

  private currentStatRating(stat: SecondaryStat): number {
    switch (stat) {
      case 'crit':
        return this.deps.statTracker.currentCritRating;
      case 'haste':
        return this.deps.statTracker.currentHasteRating;
      case 'mastery':
        return this.deps.statTracker.currentMasteryRating;
      case 'versatility':
        return this.deps.statTracker.currentVersatilityRating;
    }
  }

  private onRemoveBuff(_event: RemoveBuffEvent) {
    this.activeStat = null;
  }
}
