import SPELLS from 'common/SPELLS/midnight/trinkets';
import { Options } from 'parser/core/Analyzer';
import { RemoveBuffEvent } from 'parser/core/Events';
import StatTracker, { StatBuff } from 'parser/shared/modules/StatTracker';
import FanaticalInspiration from './FanaticalInspiration';

type SecondaryStat = 'crit' | 'haste' | 'mastery' | 'versatility';

type TestStatTracker = Pick<
  StatTracker,
  | 'add'
  | 'currentCritRating'
  | 'currentHasteRating'
  | 'currentMasteryRating'
  | 'currentVersatilityRating'
>;

function makeStatTracker(ratings: Record<SecondaryStat, number>): TestStatTracker {
  return {
    add: vi.fn(),
    get currentCritRating() {
      return ratings.crit;
    },
    get currentHasteRating() {
      return ratings.haste;
    },
    get currentMasteryRating() {
      return ratings.mastery;
    },
    get currentVersatilityRating() {
      return ratings.versatility;
    },
  };
}

function makeOptions(
  statTracker: TestStatTracker,
  removeBuffListener: { current: ((event: RemoveBuffEvent) => void) | null },
): Options {
  return {
    owner: {
      selectedCombatant: {},
      addEventListener: vi.fn((_filter, listener) => {
        removeBuffListener.current = listener as (event: RemoveBuffEvent) => void;
      }),
    },
    priority: 0,
    statTracker,
  } as unknown as Options;
}

function loadFanaticalInspiration(ratings: Record<SecondaryStat, number>) {
  const statTracker = makeStatTracker(ratings);
  const removeBuffListener: { current: ((event: RemoveBuffEvent) => void) | null } = {
    current: null,
  };
  new FanaticalInspiration(makeOptions(statTracker, removeBuffListener));
  const buff = vi.mocked(statTracker.add).mock.calls[0][1] as StatBuff;

  return { buff, removeBuffListener, statTracker };
}

function statAmount(buff: StatBuff, stat: SecondaryStat): number {
  const value = buff[stat];
  return typeof value === 'function' ? value({} as never, null) : (value ?? 0);
}

describe('FanaticalInspiration', () => {
  it.each<SecondaryStat>(['crit', 'haste', 'mastery', 'versatility'])(
    'tracks highest current %s as 173 rating',
    (stat) => {
      const ratings = {
        crit: 100,
        haste: 100,
        mastery: 100,
        versatility: 100,
        [stat]: 200,
      };
      const { buff, statTracker } = loadFanaticalInspiration(ratings);

      expect(statTracker.add).toHaveBeenCalledWith(SPELLS.FANATICAL_INSPIRATION.id, buff);
      expect(statAmount(buff, stat)).toBe(173);
    },
  );

  it('uses crit, haste, mastery, versatility as the tie breaker order', () => {
    const { buff } = loadFanaticalInspiration({
      crit: 200,
      haste: 200,
      mastery: 200,
      versatility: 200,
    });

    expect(statAmount(buff, 'crit')).toBe(173);
    expect(statAmount(buff, 'haste')).toBe(0);
    expect(statAmount(buff, 'mastery')).toBe(0);
    expect(statAmount(buff, 'versatility')).toBe(0);
  });

  it('keeps the same selected stat until the buff is removed', () => {
    const ratings = {
      crit: 100,
      haste: 200,
      mastery: 100,
      versatility: 100,
    };
    const { buff, removeBuffListener } = loadFanaticalInspiration(ratings);

    expect(statAmount(buff, 'haste')).toBe(173);

    ratings.haste = 100;
    ratings.mastery = 300;

    expect(statAmount(buff, 'haste')).toBe(173);
    expect(statAmount(buff, 'mastery')).toBe(0);

    removeBuffListener.current?.({} as RemoveBuffEvent);

    expect(statAmount(buff, 'haste')).toBe(0);
    expect(statAmount(buff, 'mastery')).toBe(173);
  });
});
