import { render, screen, within } from '@testing-library/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import FrostDeathKnightConfig from 'analysis/retail/deathknight/frost/CONFIG';
import FrostDeathKnightCombatLogParser from 'analysis/retail/deathknight/frost/CombatLogParser';
import getWipeCount from 'common/getWipeCount';
import { isEligibleFight } from 'common/isEligibleFight';
import GameBranch from 'game/GameBranch';
import { findByBossId, normalizedEncounterId } from 'game/raids';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import FightSelectionPanelList from 'interface/report/FightSelectionPanelList';
import Header from 'interface/report/Results/Header';
import { FightProvider } from 'interface/report/context/FightContext';
import { ReportProvider } from 'interface/report/context/ReportContext';
import EventEmitter from 'parser/core/modules/EventEmitter';
import type CharacterProfile from 'parser/core/CharacterProfile';
import { type AnyEvent, type CombatantInfoEvent, EventType, type Item } from 'parser/core/Events';
import type Fight from 'parser/core/Fight';
import type { PlayerDetails } from 'parser/core/Player';
import type Report from 'parser/core/Report';
import getConfig from 'parser/getConfig';

import { parseCombatLog, parseCombatLogTimestamp } from '../LocalCombatLogParser';
import { TARGET_DUMMY_PRE_ROLL_MS } from './constants';

const fixturePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  'test-fixtures/derived/current-retail-samples.log',
);

const emptyGearSlot = () => ({
  id: 0,
  itemLevel: 0,
  quality: 1,
  icon: 'inv_misc_questionmark',
});

function completeCombatantInfo(sourceID: number, timestamp: number): CombatantInfoEvent {
  // Current authentic v22 data has 18 positional gear entries and represents empty
  // protocol slots as `(0,0,(),(),())`; the API shape normalizes those to item 0.
  const gear: Item[] = Array.from({ length: 18 }, emptyGearSlot);
  gear[0] = {
    id: 249970,
    itemLevel: 289,
    quality: 4,
    icon: 'inv_helm_plate_raiddeathknight',
    permanentEnchant: 7991,
    bonusIDs: [6652, 13440],
    gems: [{ id: 240908, itemLevel: 295, icon: 'inv_jewelcrafting_cutgem' }],
  };
  gear[15] = {
    id: 237846,
    itemLevel: 295,
    quality: 4,
    icon: 'inv_sword_1h_midnight',
    permanentEnchant: 3368,
  };

  return {
    type: EventType.CombatantInfo,
    timestamp,
    sourceID,
    expansion: 'retail',
    pin: '',
    gear,
    auras: [],
    faction: 1,
    specID: 251,
    strength: 1944,
    agility: 513,
    stamina: 30352,
    intellect: 334,
    dodge: 0,
    parry: 0,
    block: 0,
    armor: 1186,
    critMelee: 1186,
    critRanged: 1186,
    critSpell: 98,
    speed: 52,
    leech: 276,
    hasteMelee: 276,
    hasteRanged: 276,
    hasteSpell: 0,
    avoidance: 1175,
    mastery: 34,
    versatilityDamageDone: 34,
    versatilityHealingDone: 34,
    versatilityDamageReduction: 1956,
    talentTree: [
      { nodeID: 76033, id: 96161, rank: 2 },
      { nodeID: 76113, id: 96243, rank: 1 },
    ],
    talents: [],
    pvpTalents: [],
  };
}

function prepareMinimalTargetDummyFight() {
  const [header, castLine, damageLine] = readFileSync(fixturePath, 'utf8').trimEnd().split('\n');
  const segmentStartText = header.slice(0, header.indexOf('  '));
  const activityStartText = castLine.slice(0, castLine.indexOf('  '));
  const segmentStart = parseCombatLogTimestamp(segmentStartText)!;
  const activityStart = parseCombatLogTimestamp(activityStartText)!;
  const preRollTimestampText = '8/14/2026 12:46:20.0000';
  const preRollTimestamp = parseCombatLogTimestamp(preRollTimestampText)!;
  const playerGuid = 'Player-0000-00000001';
  const syntheticEnvelope = [
    header,
    `${segmentStartText}  ENCOUNTER_START,999999,"Training Dummy",0,0,2393`,
    `${segmentStartText}  COMBATANT_INFO,${playerGuid},1,1944,513,30352,334,0,0,0,0,1186,1186,1186,98,52,276,276,276,0,1175,34,34,34,1956,251,[],(0),[],[],10,0,0,0`,
    `${preRollTimestampText}  SPELL_AURA_APPLIED,${playerGuid},"Téstknight-ExampleRealm",0x511,0x80000000,${playerGuid},"Téstknight-ExampleRealm",0x511,0x80000000,1235111,"Pre-roll Aura",0x20,BUFF`,
    castLine,
    damageLine,
    `${activityStartText}  ENCOUNTER_END,999999,"Training Dummy",0,0,0,0`,
  ].join('\n');
  const parsed = parseCombatLog(syntheticEnvelope, 'target-dummy-spike');
  const fightStart = Math.max(segmentStart, activityStart - TARGET_DUMMY_PRE_ROLL_MS);
  const fight: Fight = {
    ...parsed.report.fights[0],
    boss: -1,
    name: 'Training Dummy',
    start_time: fightStart,
    end_time: activityStart,
    kill: false,
    offset_time: 0,
    filtered: false,
  };
  const playerActor = parsed.actors.find((actor) => actor.guid === playerGuid)!;
  const targetActor = parsed.actors.find((actor) => actor.guid.includes('-243208-'))!;
  const combatantInfo = completeCombatantInfo(playerActor.id, fightStart);
  const events: AnyEvent[] = [
    combatantInfo,
    ...parsed.events.filter(
      (event) =>
        event.type !== EventType.CombatantInfo &&
        event.timestamp >= fight.start_time &&
        event.timestamp <= fight.end_time,
    ),
  ];
  const report: Report = {
    ...parsed.report,
    fights: [fight],
    start: fight.start_time,
    end: fight.end_time,
  };
  const player: PlayerDetails = {
    id: playerActor.id,
    guid: playerActor.id,
    name: playerActor.name,
    server: 'ExampleRealm',
    region: 'EU',
    className: 'DeathKnight',
    specName: 'Frost',
    specID: combatantInfo.specID,
    role: 'dps',
    ilvl: 289,
  };

  return {
    activityStart,
    combatantInfo,
    events,
    fight,
    player,
    playerActor,
    preRollTimestamp,
    report,
    segmentStart,
    targetActor,
  };
}

const characterProfile: CharacterProfile = {
  achievementPoints: 0,
  blizzardUpdatedAt: '',
  class: 6,
  createdAt: '',
  faction: 1,
  gender: 0,
  heartOfAzeroth: undefined,
  id: 1,
  lastSeenAt: '',
  name: 'Téstknight',
  race: 1,
  realm: 'ExampleRealm',
  region: 'EU',
  role: 'dps',
  spec: 'Frost',
  talents: '',
  thumbnail: '/img/fallback-character.jpg',
};

describe('TD-00B minimal target-dummy hypothesis', () => {
  beforeAll(() => {
    i18n.load('en', {});
    i18n.activate('en');
  });

  it('feeds the clamped, untouched fixture window and complete combatant info to a supported analyzer', () => {
    const prepared = prepareMinimalTargetDummyFight();
    const config = getConfig(GameBranch.Retail, prepared.combatantInfo.specID, prepared.player);

    expect(config).toBe(FrostDeathKnightConfig);
    expect(prepared.fight.start_time).toBe(prepared.segmentStart);
    expect(prepared.activityStart - prepared.segmentStart).toBeLessThan(TARGET_DUMMY_PRE_ROLL_MS);
    expect(prepared.events[0]).toBe(prepared.combatantInfo);
    expect(prepared.events.find((event) => event.type === EventType.ApplyBuff)).toMatchObject({
      timestamp: prepared.preRollTimestamp,
      sourceID: prepared.playerActor.id,
      targetID: prepared.playerActor.id,
      ability: { guid: 1235111, name: 'Pre-roll Aura' },
    });
    expect(prepared.combatantInfo.gear).toHaveLength(18);
    expect(prepared.combatantInfo.gear.slice(16)).toEqual([emptyGearSlot(), emptyGearSlot()]);

    expect(prepared.playerActor).toMatchObject({
      guid: 'Player-0000-00000001',
      name: 'Téstknight-ExampleRealm',
      flags: 0x511,
    });
    expect(prepared.targetActor).toMatchObject({
      guid: 'Creature-0-0000-0-0-243208-0000000001',
      name: 'Cleave Training Dummy',
      flags: 0xa28,
      friendly: false,
    });
    expect(prepared.report.enemies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          guid: 243208,
          name: 'Cleave Training Dummy',
        }),
      ]),
    );
    expect(prepared.events.find((event) => event.type === EventType.Cast)).toMatchObject({
      timestamp: prepared.activityStart,
      sourceID: prepared.playerActor.id,
      targetID: undefined,
      ability: { guid: 207230, name: 'Frostscythe' },
      classResources: [{ type: 5, amount: 6, max: 6, cost: 2 }],
      mapID: 2393,
    });
    expect(prepared.events.find((event) => event.type === EventType.Damage)).toMatchObject({
      timestamp: prepared.activityStart,
      sourceID: prepared.playerActor.id,
      targetID: prepared.targetActor.id,
      targetIsFriendly: false,
      ability: { guid: 207230, name: 'Frostscythe' },
      amount: 2771,
      mapID: 2393,
    });

    const parser = new FrostDeathKnightCombatLogParser(
      config!,
      prepared.report,
      prepared.player,
      prepared.fight,
      prepared.combatantInfo,
      characterProfile,
      [prepared.player],
    );
    const normalizedEvents = parser.normalize(
      prepared.events.filter((event) => event.type !== EventType.CombatantInfo),
    );
    const eventEmitter = parser.getModule(EventEmitter);
    normalizedEvents.forEach((event) => eventEmitter.triggerEvent(event));
    parser.finish();

    expect(parser.finished).toBe(true);
    expect(parser.selectedCombatant.specId).toBe(251);
    expect(parser.generateResults(false)).toBeDefined();
  });

  it('keeps the local sentinel visible, grouped, navigable, and renderable', () => {
    const prepared = prepareMinimalTargetDummyFight();
    const secondFight: Fight = {
      ...prepared.fight,
      id: 2,
      start_time: prepared.fight.end_time + 1_000,
      end_time: prepared.fight.end_time + 31_000,
    };
    const report = { ...prepared.report, fights: [prepared.fight, secondFight] };

    expect(isEligibleFight(prepared.fight)).toBe(true);
    expect(findByBossId(prepared.fight.boss)).toBeNull();
    expect(normalizedEncounterId(prepared.fight.boss)).toBe(-1);
    expect(getWipeCount(report.fights, prepared.fight)).toBe(1);
    expect(getWipeCount(report.fights, secondFight)).toBe(2);
    const analyzerUrl = makeAnalyzerUrl(report, prepared.fight.id, prepared.player.id);
    expect(analyzerUrl).toMatch(/^\/local\/target-dummy-spike\/1-/);
    expect(analyzerUrl).toContain('Training+Dummy');
    expect(analyzerUrl).toContain('/1-T%C3%A9stknight-ExampleRealm/standard');

    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const { unmount } = render(
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <FightSelectionPanelList
            report={report}
            fights={report.fights}
            killsOnly={false}
            playerId={prepared.player.id}
          />
        </MemoryRouter>
      </I18nProvider>,
    );
    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('link')).toHaveLength(2);
    expect(within(list).getAllByRole('heading', { level: 2 })).toHaveLength(1);
    unmount();

    render(
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <ReportProvider report={report} refreshReport={vi.fn()}>
            <FightProvider fight={prepared.fight}>
              <Header
                config={FrostDeathKnightConfig}
                player={prepared.player}
                characterProfile={characterProfile}
                boss={null}
                fight={prepared.fight}
                tabs={[]}
                selectedTab="overview"
                makeTabUrl={(tab) => tab}
                isLoading
                selectedPhaseIndex={-1}
                handlePhaseSelection={vi.fn()}
                handleTimeSelection={vi.fn()}
                timeFilter={undefined}
              />
            </FightProvider>
          </ReportProvider>
        </MemoryRouter>
      </I18nProvider>,
    );
    expect(screen.getByTestId('boss-difficulty-and-name')).toHaveTextContent('Training Dummy');
    expect(screen.getByTestId('boss-difficulty-and-name')).toHaveTextContent('Wipe');
    expect(screen.getByAltText('Training Dummy')).toHaveAttribute(
      'src',
      'https://assets.rpglogs.com/img/warcraft/bosses/-1-icon.jpg',
    );
  });
});
