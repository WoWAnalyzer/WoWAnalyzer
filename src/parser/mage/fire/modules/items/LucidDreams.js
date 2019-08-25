import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatTracker from 'parser/shared/modules/StatTracker';

const debug = false;

class LucidDreams extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
    statTracker: StatTracker,
  };

  lastTimestamp = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.LUCID_DREAMS.traitId);
    if (!this.active) {
      return;
    }
    this.hasMajor = this.selectedCombatant.hasMajor(SPELLS.LUCID_DREAMS.traitId);
    if(this.hasMajor) {
      this.abilities.add({
        spell: SPELLS.LUCID_DREAMS_MAJOR,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          },
      });
    }
    this.addEventListener(EventEmitter.catchAll, this.onEvent);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.LUCID_DREAMS_MAJOR), this.onLucidApplied);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.LUCID_DREAMS_MAJOR), this.onLucidRemoved);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.LUCID_DREAMS_MINOR_RESOURCE_REFUND), this.onLucidEnergize);
  }

  onEvent(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.LUCID_DREAMS_MAJOR.id) || event.timestamp <= this.lastTimestamp || this.lastTimestamp === 0 || !this.spellUsable.isOnCooldown(SPELLS.FIRE_BLAST.id)) {
      return;
    }
    this.spellUsable.reduceCooldown(SPELLS.FIRE_BLAST.id, event.timestamp - this.lastTimestamp, event.timestamp);
    this.lastTimestamp = event.timestamp;
  }

  onLucidApplied(event) {
    this.lastTimestamp = event.timestamp;
  }

  onLucidRemoved(event) {
    this.spellUsable.reduceCooldown(SPELLS.FIRE_BLAST.id, event.timestamp - this.lastTimestamp, event.timestamp);
    this.lastTimestamp = 0;
  }

  onLucidEnergize(event) {
    const rechargeTime = ((this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? 10 : 12) / (1 + this.statTracker.currentHastePercentage)) * 1000;
    const refund = rechargeTime / 2;
    if (this.spellUsable.isOnCooldown(SPELLS.FIRE_BLAST.id)) {
      debug && this.log("Fire Blast Cooldown Refund: " + refund);
      this.spellUsable.reduceCooldown(SPELLS.FIRE_BLAST.id, refund, event.timestamp);
    }
  }
}

export default LucidDreams;
