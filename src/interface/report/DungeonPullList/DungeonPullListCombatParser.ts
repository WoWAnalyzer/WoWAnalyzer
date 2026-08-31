import Config from 'parser/Config';
import CombatLogParser, { DependenciesDefinition } from 'parser/core/CombatLogParser';
import { WCLDungeonPull, WCLFight } from 'parser/core/Fight';
import { PlayerDetails } from 'parser/core/Player';
import { DungeonPullEvents } from '../hooks/useEvents';
import { useEffect, useMemo, useRef, useState } from 'react';
import Abilities from 'parser/core/modules/Abilities';
import Auras from 'parser/core/modules/Auras';
import Report from 'parser/core/Report';
import Events, {
  AbilityEvent,
  CombatantInfoEvent,
  DeathEvent,
  EventType,
} from 'parser/core/Events';
import CharacterProfile from 'parser/core/CharacterProfile';
import EventEmitter from 'parser/core/modules/EventEmitter';
import Spell from 'common/SPELLS/Spell';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Ability from 'parser/core/modules/Ability';
import StateHistory from 'parser/core/StateHistory';
import Haste from 'parser/shared/modules/Haste';
import StatTracker from 'parser/shared/modules/StatTracker';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import Enemies from 'parser/shared/modules/Enemies';
import Combatants from 'parser/shared/modules/Combatants';

export class RetailDungeonPullListCombatParser extends CombatLogParser {
  static defaultModules: DependenciesDefinition = {
    haste: Haste,
    statTracker: StatTracker,
    spellManaCost: SpellManaCost,
    abilityTracker: AbilityTracker,
  };
}

class DungeonPullDetailsGenerator extends Analyzer.withDependencies({
  abilities: Abilities,
  auras: Auras,
  abilityTracker: AbilityTracker,
  enemies: Enemies,
  combatants: Combatants,
}) {
  #cooldownUses: AbilityEvent<EventType>[] = [];
  #defensiveUses: AbilityEvent<EventType>[] = [];

  cooldowns: Ability[] = [];
  defensives: Ability[] = [];

  constructor(options: Options) {
    super(options);

    this.deps.abilities.activeAbilities.forEach((ability) => {
      const spells = Array.isArray(ability.spell)
        ? ability.spell.map((id) => ({ id }))
        : { id: ability.spell };
      if (ability.category === SPELL_CATEGORY.COOLDOWNS) {
        this.addEventListener(Events.cast.spell(spells).by(SELECTED_PLAYER), this.addCooldownUse);
        this.cooldowns.push(ability);
      }

      if (ability.category === SPELL_CATEGORY.DEFENSIVE && ability.cooldown >= 60) {
        this.addEventListener(
          Events.cast.spell(spells).by(SELECTED_PLAYER),
          this.addDefensiveCooldownUse,
        );

        this.defensives.push(ability);
      }
    });
  }

  private addCooldownUse(event: AbilityEvent<EventType>) {
    this.#cooldownUses.push(event);
  }

  private addDefensiveCooldownUse(event: AbilityEvent<EventType>) {
    this.#defensiveUses.push(event);
  }

  private static uniqueAbilityIds(events: AbilityEvent<EventType>[]): number[] {
    return Array.from(new Set(events.map((event) => event.ability.guid)));
  }

  getDetails(
    pulls: Pick<DungeonPullEvents, 'target'>[],
    allDeathEvents: DeathEvent[] | undefined,
  ): DungeonPullDetails[] {
    const cooldownUses = new StateHistory(this.#cooldownUses);
    const defensiveUses = new StateHistory(this.#defensiveUses);
    const allDeaths = new StateHistory(allDeathEvents ?? []);

    let totalCount = 0;

    return pulls.map((pull) => {
      const durationSec = (pull.target.end_time - pull.target.start_time) / 1000;
      const countGained = allDeaths
        .slice(pull.target.start_time, pull.target.end_time)
        .data.map(
          (event) =>
            this.owner.fight.npcCountMap?.[this.deps.enemies.getById(event.targetID)?.guid ?? 0] ??
            0,
        )
        .filter((count) => count > 0)
        .reduce((a, b) => a + b, 0);

      totalCount += countGained;

      return {
        pull: pull.target,
        dps:
          this.deps.abilityTracker.getTotalDamageInRange(
            pull.target.start_time,
            pull.target.end_time,
          ) / durationSec,
        hps:
          this.deps.abilityTracker.getTotalHealingInRange(
            pull.target.start_time,
            pull.target.end_time,
          ) / durationSec,

        cooldownsUsed: DungeonPullDetailsGenerator.uniqueAbilityIds(
          cooldownUses.slice(pull.target.start_time, pull.target.end_time).data,
        ),
        defensivesUsed: DungeonPullDetailsGenerator.uniqueAbilityIds(
          defensiveUses.slice(pull.target.start_time, pull.target.end_time).data,
        ),
        countGained,
        countAtEnd: totalCount,
        deaths: allDeaths
          .slice(pull.target.start_time, pull.target.end_time)
          .data.filter((event) => this.deps.combatants.getEntity(event)),
      };
    });
  }
}

export interface DungeonPullDetails {
  pull: WCLDungeonPull;
  dps: number;
  hps: number;
  cooldownsUsed: Spell['id'][];
  defensivesUsed: Spell['id'][];
  countGained: number;
  countAtEnd: number;
  deaths: DeathEvent[];
}

function usePlayerCombatantInfo(
  playerId: number,
  pulls: DungeonPullEvents[],
): CombatantInfoEvent | undefined {
  const [event, setEvent] = useState<CombatantInfoEvent | undefined>();

  useEffect(() => {
    if (event && playerId !== event.sourceID) {
      setEvent(undefined);
    }
  }, [playerId, event]);

  useEffect(() => {
    if (event) {
      return;
    }

    for (const pull of pulls) {
      const event = pull.events.find(
        (event) => event.type === EventType.CombatantInfo && event.sourceID === playerId,
      );

      if (event) {
        setEvent(event as CombatantInfoEvent);
        break;
      }
    }
  }, [event, pulls, playerId, pulls.length]);

  return event;
}

export default function useDungeonPullList({
  fight,
  config,
  player,
  pulls,
  parser: baseParser,
  report,
  characterProfile,
  allPlayers,
  allDeaths,
}: {
  fight: WCLFight;
  config: Config;
  player: PlayerDetails;
  pulls: DungeonPullEvents[];
  parser: typeof CombatLogParser | undefined;
  report: Report;
  characterProfile: CharacterProfile | null;
  allPlayers: PlayerDetails[];
  allDeaths: DeathEvent[] | undefined;
}): DungeonPullDetails[] {
  const nextPullIndex = useRef(0);

  const playerCombatantInfo = usePlayerCombatantInfo(player.id, pulls);

  const parserClass = useMemo(
    () =>
      baseParser
        ? class extends RetailDungeonPullListCombatParser {
            static internalModules: DependenciesDefinition = {
              ...baseParser!.internalModules,
              dungeonPullDetails: DungeonPullDetailsGenerator,
            };

            static specModules: DependenciesDefinition = {
              abilities: CombatLogParser.getModuleClass(baseParser!, Abilities)!,
              auras: CombatLogParser.getModuleClass(baseParser!, Auras)!,
            };
          }
        : undefined,
    [baseParser],
  );

  const parser = useMemo(
    () =>
      parserClass && playerCombatantInfo
        ? new parserClass(
            config,
            report,
            player,
            {
              ...fight,
              offset_time: 0,
            },
            playerCombatantInfo,
            characterProfile!,
            allPlayers,
          )
        : undefined,
    [config, report, player, fight, playerCombatantInfo, characterProfile, allPlayers, parserClass],
  );

  return useMemo(() => {
    if (!parser) {
      return [];
    }
    const emitter = parser.getModule(EventEmitter);
    for (const pull of pulls.slice(nextPullIndex.current)) {
      const events = parser
        .normalize(pull.events.map((event) => ({ ...event })))
        .sort((a, b) => a.timestamp - b.timestamp);

      events.forEach(emitter.triggerEvent.bind(emitter));
    }
    nextPullIndex.current = pulls.length;

    return parser.getModule(DungeonPullDetailsGenerator).getDetails(pulls, allDeaths);
  }, [pulls, parser, allDeaths]);
}
