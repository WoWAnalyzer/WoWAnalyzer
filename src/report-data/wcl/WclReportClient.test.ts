import { adaptV2Report } from './WclReportClient';

describe('adaptV2Report', () => {
  it('adapts v2 report, fight and actor fields at the source boundary', () => {
    const locator = {
      kind: 'warcraft-logs',
      code: 'abcdefghijklmnop',
      isAnonymous: false,
    } as const;
    const report = adaptV2Report(
      {
        code: locator.code,
        title: 'Browser report',
        owner: { name: 'Uploader' },
        startTime: 1_000,
        endTime: 5_000,
        zone: { id: 42 },
        masterData: {
          lang: 'en',
          logVersion: 22,
          gameVersion: 1,
          actors: [
            { id: 1, name: 'Player', type: 'Player', subType: 'Mage', gameID: 11 },
            { id: 2, name: 'Boss', type: 'NPC', subType: 'Boss', gameID: 22 },
          ],
        },
        fights: [
          {
            id: 7,
            encounterID: 99,
            startTime: 100,
            endTime: 900,
            name: 'Boss',
            kill: true,
            friendlyPlayers: [1],
            enemyNPCs: [{ id: 2, instanceCount: 1, groupCount: 1 }],
            phaseTransitions: [{ id: 1, startTime: 100 }],
          },
        ],
      },
      locator,
    );

    expect(report).toMatchObject({
      code: locator.code,
      locator,
      title: 'Browser report',
      owner: 'Uploader',
      zone: 42,
      fights: [{ id: 7, boss: 99, start_time: 100, end_time: 900, kill: true }],
      friendlies: [{ id: 1, name: 'Player', fights: [{ id: 7 }] }],
      enemies: [{ id: 2, guid: 22, fights: [{ id: 7, groups: 1, instances: 1 }] }],
    });
  });
});
