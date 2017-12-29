import SPELLS from 'common/SPELLS';
import RushingJadeWind, { RUSHING_JADE_WIND_BUFF } from './RushingJadeWind';

const talentless_combatant = {
  hasTalent: (id) => false,
};

const talented_combatant = {
  hasTalent: (id) => id === SPELLS.RUSHING_JADE_WIND_TALENT.id,
};

const BUFF = {...RUSHING_JADE_WIND_BUFF, guid: RUSHING_JADE_WIND_BUFF.id};

const player = 1;

// should have 50% uptime, sequences of applybuff/applybuff or
// removebuff/removebuff are assumed to never happen
const halfUptime = [
  {sourceID: player, targetID: player, timestamp: 1000, type: "applybuff", ability: BUFF},
  {sourceID: player, targetID: player, timestamp: 2000, type: "removebuff", ability: BUFF},
  {sourceID: player, targetID: player, timestamp: 3000, type: "applybuff", ability: BUFF},
  {sourceID: player, targetID: player, timestamp: 4000, type: "removebuff", ability: BUFF},
  {sourceID: player, targetID: player, timestamp: 5000, type: "applybuff", ability: BUFF},
  {sourceID: player, targetID: player, timestamp: 6000, type: "removebuff", ability: BUFF},
  {sourceID: player, targetID: player, timestamp: 8000, type: "applybuff", ability: BUFF},
];

describe("Rushing Jade Wind", () => {
  let rjw;
  beforeEach(() => {
    rjw = new RushingJadeWind({
      byPlayer: () => true,
      toPlayer: () => true,
      byPlayerPet: () => false,
      toPlayerPet: () => false,
      fight: {
        start_time: 0,
        end_time: 10000,
      },
      fightDuration: 10000,
    });
    rjw.combatants = {selected: talented_combatant};
    rjw.triggerEvent("initialized");
  });

  it("should be inactive for a user without the talent", () => {
    rjw.combatants.selected = talentless_combatant;
    rjw.triggerEvent("initialized");
    expect(rjw.active).toBe(false);
  });

  it("should be active for a user with the talent", () => {
    // the default is for rjw to use the talent
    rjw.triggerEvent("initialized");
    expect(rjw.active).toBe(true);
  });

  it("should show 0% uptime if no events have been processed", () => {
    rjw.owner.fightDuration = 0;
    expect(rjw.uptime).toBe(0);
  });

  it("should show 0% uptime if the fight ends without it ever activating", () => {
    rjw.triggerEvent("finished");
    expect(rjw.uptime).toBe(0);
  });

  it("should track uptime via the buff", () => {
    halfUptime.forEach((event) => rjw.triggerEvent("byPlayer_" + event.type, event));
    rjw.triggerEvent("finished");
    expect(rjw.uptime).toBe(0.5);
  });
});
