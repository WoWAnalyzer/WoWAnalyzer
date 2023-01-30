import COMMON_SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AutoAttackCooldownEvent, CastEvent, EventType } from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import SPELLS from 'common/SPELLS/classic/hunter';

const HASTE_POTION_BUFF = 28507;
const DRAGONSPINE_FLURRY_BUFF = 34775;
const THUNDERING_SKYFIRE_DIAMOND_BUFF = 39959; // meta gem
const BERSERKING_BUFF = 20554; // Troll racial
const HASTE_RATING_PER_PERCENT = 15.7;
const baseHaste = 0.15; // quiver
const serpentSwiftnessHaste = 0.2;
const hasteBuffs = {
  [SPELLS.RAPID_FIRE.id]: 0.4,
  [DRAGONSPINE_FLURRY_BUFF]: 325 / HASTE_RATING_PER_PERCENT / 100,
  [HASTE_POTION_BUFF]: 400 / HASTE_RATING_PER_PERCENT / 100,
  [COMMON_SPELLS.BLOODLUST.id]: 0.3,
  [COMMON_SPELLS.HEROISM.id]: 0.3,
  [THUNDERING_SKYFIRE_DIAMOND_BUFF]: 240 / HASTE_RATING_PER_PERCENT / 100,
  [BERSERKING_BUFF]: 0.1,
};

const weaponSpeeds: { [itemId: number]: number } = {
  // bows
  15289: 2.3, // Archstrike Bow
  17069: 2.5, // Striker's Mark
  18713: 2.9, // Rhok'delar, Longbow of the Ancient Keepers
  18833: 1.8, // Grand Marshal's Bullseye
  18835: 1.8, // High Warlord's Recurve
  19350: 2.6, // Heartstriker
  19993: 2.8, // Hoodoo Hunting Bow
  20038: 2.6, // Mandokir's Sting
  21478: 2.2, // Bow of Taut Sinew
  21616: 2.7, // Huhuran's Stinger
  22811: 2.9, // Soulstring
  25243: 2.7, // Windtalker Bow
  25244: 2.7, // Viper Bow
  25245: 2.7, // Razorsong Bow
  25246: 2.7, // Thalassian Compound Bow
  25247: 2.7, // Expert's Bow
  25248: 2.7, // Talbuk Hunting Bow
  25249: 2.7, // Ranger's Recurved Bow
  25250: 2.7, // Rocslayer Longbow
  25251: 2.7, // Orc Flatbow
  25252: 2.7, // Dream Catcher Bow
  25253: 2.7, // Windspear Longbow
  25406: 2.5, // Broken Longbow
  25496: 2.8, // Mag'har Bow
  25953: 2.7, // Ethereal Warp-Bow
  25971: 3.3, // Stout Oak Longbow
  27526: 2.4, // Skyfire Hawk-Bow
  27817: 2.8, // Starbolt Longbow
  27930: 2.5, // Splintermark
  27931: 2.5, // Splintermark
  27987: 3, // Melmorta's Twilight Longbow
  28772: 2.9, // Sunfury Bow of the Phoenix
  29152: 2.8, // Marksman's Bow
  29351: 3, // Wrathtide Longbow
  30105: 3, // Serpent Spine Longbow
  30226: 2.5, // Alley's Recurve
  30318: 2.9, // Netherstrand Longbow
  30759: 2.1, // Mag'hari Light Recurve
  30906: 3, // Bristleblitz Striker
  31072: 2.6, // Lohn'goron, Bow of the Torn-heart
  31303: 2.8, // Valanos' Longbow
  31416: 2.2, // Scorch Wood Bow
  31762: 2.7, // Feather-Wrapped Bow
  32336: 3, // Black Bow of the Betrayer
  33474: 3, // Ancient Amani Longbow
  34196: 3, // Golden Bow of Quel'Thalas
  34334: 2.7, // Thori'dal, the Stars' Fury
  34529: 3, // Vengeful Gladiator's Longbow
  35047: 3, // Brutal Gladiator's Longbow
  // crossbows
  18836: 2.9, // Grand Marshal's Repeater
  18837: 2.9, // High Warlord's Crossbow
  19361: 3.4, // Ashjre'thul, Crossbow of Smiting
  20599: 3.1, // Polished Ironwood Crossbow
  21459: 3.1, // Crossbow of Imminent Doom
  22347: 3.2, // Fahrad's Reloading Repeater
  22812: 3.2, // Nerubian Slavemaker
  24381: 2.9, // Coilfang Needler
  25257: 2.7, // Citadel Crossbow
  25258: 2.7, // Repeater Crossbow
  25259: 2.7, // Collapsible Crossbow
  25260: 2.7, // Archer's Crossbow
  25261: 2.7, // Mighty Crossbow
  25262: 2.7, // Battle Damaged Crossbow
  25263: 2.7, // Assassins' Silent Crossbow
  25264: 2.7, // Pocket Ballista
  25265: 2.7, // Barreled Crossbow
  25266: 2.7, // Well-Balanced Crossbow
  25267: 2.7, // Rampant Crossbow
  27507: 3, // Adamantine Repeater
  28062: 2.9, // Expedition Repeater
  28294: 3.1, // Gladiator's Heavy Crossbow
  28397: 3, // Emberhawk Crossbow
  28504: 2.8, // Steelhawk Crossbow
  28933: 3.2, // High Warlord's Heavy Crossbow
  28960: 3.2, // Grand Marshal's Heavy Crossbow
  30397: 2.7, // Spymaster's Crossbow
  30757: 2.3, // Draenic Light Crossbow
  31986: 3, // Merciless Gladiator's Crossbow of the Phoenix
  32253: 2.9, // Legionkiller
  32645: 2.8, // Crystalline Crossbow
  33006: 3, // Vengeful Gladiator's Heavy Crossbow
  34674: 2.6, // Truestrike Crossbow
  34892: 2.8, // Crossbow of Relentless Strikes
  35018: 3, // Brutal Gladiator's Heavy Crossbow
  // guns
  17072: 2.6, // Blastershot Launcher
  18282: 2.5, // Core Marksman Rifle
  18855: 2.9, // Grand Marshal's Hand Cannon
  18860: 2.9, // High Warlord's Street Sweeper
  19368: 2.8, // Dragonbreath Hand Cannon
  19853: 2.8, // Gurubashi Dwarf Destroyer
  20722: 2.8, // Crystal Slugthrower
  21272: 2.6, // Blessed Qiraji Musket
  21800: 2.8, // Silithid Husked Launcher
  22810: 2, // Toxin Injector
  23557: 3, // Larvae of the Great Worm
  23742: 2.8, // Fel Iron Musket
  23746: 3, // Adamantite Rifle
  23747: 2.4, // Felsteel Boomstick
  23748: 3.1, // Ornate Khorium Rifle
  24389: 3, // Legion Blunderbuss
  25271: 2.7, // Croc-Hunter's Rifle
  25272: 2.7, // PC-54 Shotgun
  25273: 2.7, // Sawed-Off Shotgun
  25274: 2.7, // Cliffjumper Shotgun
  25275: 2.7, // Dragonbreath Musket
  25276: 2.7, // Tauren Runed Musket
  25277: 2.7, // Sporting Rifle
  25278: 2.7, // Nessingwary Longrifle
  25279: 2.7, // Sen'jin Longrifle
  25280: 2.7, // Game Hunter Musket
  25281: 2.7, // Big-Boar Battle Rifle
  25405: 1.8, // Rusted Musket
  25544: 2.7, // Zerid's Vintage Musket
  25639: 2.5, // Hemet's Elekk Gun
  25972: 2.5, // Deadeye's Piece
  27794: 2.9, // Recoilless Rocket Ripper X-54
  27898: 2, // Wrathfire Hand-Cannon
  28286: 3, // Telescopic Sharprifle
  28581: 2.7, // Wolfslayer Sniper Rifle
  29115: 2.4, // Consortium Blaster
  29151: 2.7, // Veteran's Musket
  29949: 2.9, // Arcanite Steam-Pistol
  30279: 2.2, // Mama's Insurance
  30724: 2.6, // Barrel-Blade Longrifle
  30758: 2.2, // Aldor Guardian Rifle
  31000: 2.6, // Bloodwarder's Rifle
  31204: 2.8, // The Gunblade
  31323: 2.7, // Don Santos' Famous Hunting Rifle
  32325: 1.9, // Rifle of the Stoic Guardian
  32756: 2.8, // Gyro-Balanced Khorium Destroyer
  32780: 2, // The Boomstick
  33491: 2.9, // Tuskbreaker
  34530: 3, // Vengeful Gladiator's Rifle
  35075: 3, // Brutal Gladiator's Rifle
};

class AutoShotCooldown extends Analyzer {
  protected eventEmitter!: EventEmitter;

  static dependencies = {
    eventEmitter: EventEmitter,
  };

  constructor(options: Options) {
    super(options);
    const rangedWeapon = this.rangedWeapon;
    this.active = rangedWeapon && weaponSpeeds[rangedWeapon.id] !== undefined;
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell({ id: SPELLS.AUTO_SHOT.id }),
      this.onAutoShot,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell({ id: SPELLS.STEADY_SHOT.id }),
      this.onSteadyShot,
    );
  }

  get rangedWeapon() {
    return this.owner.selectedCombatant.gear[17];
  }
  get currentHaste() {
    let haste = 1 * (1 + baseHaste);
    haste *= 1 + serpentSwiftnessHaste;
    Object.keys(hasteBuffs)
      .map(Number)
      .forEach((spellId) => {
        if (this.owner.selectedCombatant.hasBuff(spellId)) {
          haste *= 1 + hasteBuffs[spellId];
        }
      });

    return haste;
  }

  onAutoShot(event: CastEvent) {
    if (!event.channel) {
      console.warn('Auto Shot cast event is missing channel.', event);
      return;
    }

    // This isn't reliably recorded in the combat log (and might not work reliably in the game either)
    // const hasteish = 500 / event.channel.duration;
    const haste = this.currentHaste;

    const rawBowSpeed = weaponSpeeds[this.rangedWeapon.id];
    const autoShotInterval = (rawBowSpeed / haste) * 1000;
    const autoShotCastTime = 500 / haste;
    const duration = autoShotInterval - autoShotCastTime;

    // this.log('as', duration, `${Math.round((haste - 1) * 100)}%`);

    const autoAttackCooldownEvent: Omit<AutoAttackCooldownEvent, 'trigger' | '__fabricated'> = {
      type: EventType.AutoAttackCooldown,
      ability: event.ability,
      timestamp: event.timestamp,
      sourceID: event.sourceID,
      targetID: event.targetID!,
      haste,
      duration,
      attackSpeed: autoShotInterval,
    };

    this.eventEmitter.fabricateEvent(autoAttackCooldownEvent, event);
  }
  onSteadyShot(event: CastEvent) {
    if (!event.channel) {
      console.warn('Steady Shot cast event is missing channel.', event);
      return;
    }

    // const haste = 1500 / event.channel.duration;
    // this.log('ss', event.channel.duration, haste, (3.0 / haste) * 1000);

    // TODO: Validate Haste
    // TODO: When validating Haste consider damage taken delaying SS cast (pushback)
  }
}

export default AutoShotCooldown;
