import { CastEvent, EventType } from 'parser/core/Events';
import { Info } from 'parser/core/metric';

import lowRankSpells from './lowRankSpells';

const castEvent = (id: number): CastEvent => ({
  type: EventType.Cast,
  ability: {
    guid: id,
    name: 'test',
    type: 1,
    abilityIcon: 'test',
  },
  sourceID: 1,
  sourceIsFriendly: true,
  targetID: 2,
  targetIsFriendly: false,
  timestamp: 0,
});

describe('lowRankSpells', () => {
  const config = {
    5: [1, 3],
  };
  const info: Pick<Info, 'playerId'> = {
    playerId: 1,
  };

  it('starts empty', () => {
    expect(lowRankSpells(config).run([], info as Info)).toHaveLength(0);
  });
  it('fails on low rank spells', () => {
    expect(lowRankSpells(config).run([castEvent(1)], info as Info)).toHaveLength(1);
    expect(lowRankSpells(config).run([castEvent(3)], info as Info)).toHaveLength(1);
  });
  it('ignores unrelated spells', () => {
    expect(lowRankSpells(config).run([castEvent(2)], info as Info)).toHaveLength(0);
  });
  it('passes on the main spell', () => {
    expect(lowRankSpells(config).run([castEvent(5)], info as Info)).toHaveLength(0);
  });
  it("ignores other player's spells", () => {
    expect(
      lowRankSpells(config).run(
        [
          {
            ...castEvent(1),
            sourceID: 2,
            targetID: 1,
          },
        ],
        info as Info,
      ),
    ).toHaveLength(0);
  });
});
