import SPELLS from 'common/SPELLS';
import type ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { soulShardWastePriority } from './priorities';

const MINUTE = 60000;

const build = (wasted: number, minutes: number) =>
  soulShardWastePriority({
    tracker: { wasted } as unknown as ResourceTracker,
    fightDuration: minutes * MINUTE,
    weight: 5,
    spender: SPELLS.HAND_OF_GULDAN_CAST,
    shardsPerCast: 3,
  });

describe('soulShardWastePriority', () => {
  it('returns null without a tracker', () => {
    expect(
      soulShardWastePriority({
        tracker: undefined,
        fightDuration: MINUTE,
        weight: 5,
        spender: SPELLS.HAND_OF_GULDAN_CAST,
        shardsPerCast: 3,
      }),
    ).toBeNull();
  });

  it('uses the Soul Shard thresholds of the shared suggestion', () => {
    expect(build(0, 5)?.performance).toBe(QualitativePerformance.Perfect);
    expect(build(2, 5)?.performance).toBe(QualitativePerformance.Good);
    expect(build(9, 7)?.performance).toBe(QualitativePerformance.Ok);
    expect(build(20, 5)?.performance).toBe(QualitativePerformance.Fail);
  });

  it('keeps a stable id and a countable title', () => {
    const priority = build(3, 5);
    expect(priority?.id).toBe('soul-shard-waste');
    expect(priority?.title).toBe('Waste fewer Soul Shards');
    expect(priority?.score).toBeCloseTo(1 - 0.6 / (10 / 3));
  });
});
