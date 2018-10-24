import SPELLS from 'common/SPELLS';
import StatTracker from 'parser/shared/modules/StatTracker';
import BaseHealerAzerite from './BaseHealerAzerite';

const TOTEM_SPAWN_DISTANCE = 200; // 2 yards
const EBB_AND_FLOW_MINUMUM_DISTANCE = 8;
const EBB_AND_FLOW_MAXIMUM_DISTANCE = 40;

/**
 * Ebb and Flow:
 * Healing Tide Totem restores up to 198 additional health each pulse, based on how close your allies are to the totem.
 * Maximum benefit for allies within 8 yds of the totem.
 */

class EbbAndFlow extends BaseHealerAzerite {
  static dependencies = {
    statTracker: StatTracker,
  };
  static TRAIT = SPELLS.EBB_AND_FLOW.id;
  static HEAL = SPELLS.EBB_AND_FLOW.id;

  healingTideHits = [];
  healingTidePosition = {};
  traitRawHealing = 0;

  constructor(...args) {
    super(...args);
    this.disableStatistic = !this.hasTrait;
    this.traitRawHealing = this.azerite.reduce((total, trait) => total + trait.rawHealing, 0);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HEALING_TIDE_TOTEM_CAST.id) {
      return;
    }
    // totem spawns 2 yards behind and to the right of your position on cast
    // everything gets calculated off of the totems position so this information is important to be precise
    const radians = event.facing / 100;
    const xDistance = TOTEM_SPAWN_DISTANCE * Math.cos(radians);
    const yDistance = TOTEM_SPAWN_DISTANCE * Math.sin(radians);

    this.healingTidePosition = {x: event.x + xDistance, y: event.y + yDistance};
  }

  on_byPlayerPet_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HEALING_TIDE_TOTEM_HEAL.id) {
      return;
    }

    // The trait has a 8 - 40 yards linear falloff
    // 100% effectiveness within 8 yards, 0% at 40 yards
    const a = this.healingTidePosition.x - event.x;
    const b = this.healingTidePosition.y - event.y;
    const distanceToPlayer = Math.sqrt(a*a + b*b) / 100;
    const hitEffectiveness = this.effectiveness(distanceToPlayer);
    this.healingTideHits.push(hitEffectiveness);

    // As we don't disable this module for the spreadsheet information
    if (!this.hasTrait) {
      return;
    }

    const currentIntellect = this.statTracker.currentIntellectRating;
    const healingTideHealing = SPELLS.HEALING_TIDE_TOTEM_HEAL.coefficient * currentIntellect;
    const traitHealing = this.traitRawHealing * hitEffectiveness;
    const traitComponent = traitHealing / (healingTideHealing + traitHealing);

    this.processHealing(event, traitComponent);
  }

  effectiveness(distanceToPlayer) {
    return Math.min(1 - ((distanceToPlayer - EBB_AND_FLOW_MINUMUM_DISTANCE) / (EBB_AND_FLOW_MAXIMUM_DISTANCE - EBB_AND_FLOW_MINUMUM_DISTANCE)), 1);
  }

  get ebbAndFlowEffectiveness() {
    return this.healingTideHits.reduce((total, hit) => total + hit, 0) / this.healingTideHits.length;
  }
}

export default EbbAndFlow;
