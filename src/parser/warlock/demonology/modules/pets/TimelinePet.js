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

export class TimelinePet {
  name = 'unknown';
  guid = null;
  id = null;
  instance = null;
  spawn = null;
  expectedDespawn = null;
  summonAbility = null;
  summonedBy = null;
  // difference between summonAbility and summonedBy:
  // summonAbility is the summon ability itself (Summon Wild Imp, Summon Shivarra, Summon Vicious Hellhound, Summon Prince Malchezaar, ...)
  // summonedBy is the "source" from player's perspective - whether it's Hand of Gul'dan, Nether Portal, Inner Demons, ...
  realDespawn = null;
  despawnedBy = null;
  history = [];
  // is used for highlighting in timeline
  meta = {
    iconClass: '',
    tooltip: '',
  };

  // Wild Imp properties
  x = null; // position due to Implosion
  y = null;
  shouldImplode = false;
  currentEnergy; // energy because they can despawn "prematurely" due to their mechanics

  constructor(petInfo, id, instance, timestamp, duration, summonedBy, summonAbility) {
    this.name = petInfo.name;
    this.guid = petInfo.guid;
    this.id = id;
    this.instance = instance;
    this.spawn = timestamp;
    this.expectedDespawn = timestamp + duration;
    this.summonedBy = summonedBy;
    this.summonAbility = summonAbility;
  }

  setWildImpProperties(playerPosition) {
    this.x = playerPosition.x;
    this.y = playerPosition.y;
    this.shouldImplode = false;
    this.currentEnergy = 100;
  }

  updatePosition(event) {
    this.x = event.x;
    this.y = event.y;
  }

  despawn(timestamp, reason) {
    this.realDespawn = timestamp;
    this.despawnedBy = reason;
  }

  pushHistory(...contents) {
    this.history.push([...contents]);
  }

  extend() {
    // ASSUME full duration, but it gets updated for Wild Imps, on Demonic Power buff remove (their extend mechanic works differently)
    this.expectedDespawn += DEMONIC_TYRANT_EXTENSION;
    this.setMeta(META_CLASSES.EMPOWERED, META_TOOLTIPS.EMPOWERED);
  }

  setMeta(iconClass, tooltip) {
    this.meta.iconClass = iconClass;
    this.meta.tooltip = tooltip;
  }
}
