import { MappedEvent } from 'parser/core/Events';
import { PetInfo } from 'parser/core/Pet';

const DEMONIC_TYRANT_EXTENSION = 15000;

export const META_CLASSES = {
  EMPOWERED: 'empowered',
  DESTROYED: 'inefficient',
};

export const META_TOOLTIPS = {
  EMPOWERED: 'This pet was empowered by Demonic Tyrant',
  IMPLODED: 'This Wild Imp was later Imploded',
  DEMONIC_CONSUMPTION: 'This Wild Imp was later killed with Demonic Consumption',
  POWER_SIPHON: 'This Wild Imp was later killed by Power Siphon',
};

export const DESPAWN_REASONS = {
  ZERO_ENERGY: 'Killed by having 0 energy',
  IMPLOSION: 'Killed with Implosion',
  DEMONIC_CONSUMPTION: 'Killed with Demonic Consumption',
  POWER_SIPHON: 'Killed with Power Siphon',
  NEW_PERMANENT_PET: 'Killed by summoning new permanent pet',
};

type PetHistoryEntry = [number, string, MappedEvent];

export class TimelinePet {
  name!: string;
  guid!: number;
  id!: number;
  instance!: number;
  spawn!: number;
  expectedDespawn!: number;
  realDespawn: number | null = null;
  despawnedBy: string | null = null;
  summonAbility!: number;
  summonedBy!: number;
  // difference between summonAbility and summonedBy:
  // summonAbility is the summon ability itself (Summon Wild Imp, Summon Shivarra, Summon Vicious Hellhound, Summon Prince Malchezaar, ...)
  // summonedBy is the "source" from player's perspective - whether it's Hand of Gul'dan, Nether Portal, Inner Demons, ...
  history: PetHistoryEntry[] = [];
  // is used for highlighting in timeline
  meta = {
    iconClass: '',
    tooltip: '',
  };

  // Wild Imp properties
  x: number | null = null;
  y: number | null = null;
  shouldImplode: boolean = false;
  currentEnergy: number | null = null; // energy because they can despawn "prematurely" due to their mechanics

  constructor(
    petInfo: PetInfo,
    id: number,
    instance: number,
    timestamp: number,
    duration: number,
    summonAbility: number,
    summonedBy: number,
  ) {
    this.name = petInfo.name;
    this.guid = petInfo.guid;
    this.id = id;
    this.instance = instance;
    this.spawn = timestamp;
    this.expectedDespawn = timestamp + duration;
    this.summonAbility = summonAbility;
    this.summonedBy = summonedBy;
  }

  setWildImpProperties(playerPosition: { x: number; y: number }) {
    this.x = playerPosition.x;
    this.y = playerPosition.y;
    this.shouldImplode = false;
    this.currentEnergy = 100;
  }

  updatePosition(event: MappedEvent) {
    this.x = 'x' in event ? event.x ?? null : null;
    this.y = 'y' in event ? event.y ?? null : null;
  }

  despawn(timestamp: number, reason: string) {
    this.realDespawn = timestamp;
    this.despawnedBy = reason;
  }

  pushHistory(...contents: PetHistoryEntry) {
    this.history.push([...contents]);
  }

  extend() {
    // ASSUME full duration, but it gets updated for Wild Imps, on Demonic Power buff remove (their extend mechanic works differently)
    this.expectedDespawn += DEMONIC_TYRANT_EXTENSION;
    this.setMeta(META_CLASSES.EMPOWERED, META_TOOLTIPS.EMPOWERED);
  }

  setMeta(iconClass: string, tooltip: string) {
    this.meta.iconClass = iconClass;
    this.meta.tooltip = tooltip;
  }
}
