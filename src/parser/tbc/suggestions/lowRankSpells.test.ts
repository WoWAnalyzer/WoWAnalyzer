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
    expect(lowRankSpells(config)([], info)).toHaveLength(0);
  });
  it('fails on low rank spells', () => {
    expect(lowRankSpells(config)([castEvent(1)], info)).toHaveLength(1);
    expect(lowRankSpells(config)([castEvent(3)], info)).toHaveLength(1);
  });
  it('ignores unrelated spells', () => {
    expect(lowRankSpells(config)([castEvent(2)], info)).toHaveLength(0);
  });
  it('passes on the main spell', () => {
    expect(lowRankSpells(config)([castEvent(5)], info)).toHaveLength(0);
  });
  it("ignores other player's spells", () => {
    expect(
      lowRankSpells(config)(
        [
          {
            ...castEvent(1),
            sourceID: 2,
            targetID: 1,
          },
        ],
        info,
      ),
    ).toHaveLength(0);
  });
});
