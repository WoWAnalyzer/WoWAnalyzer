import { Trans } from '@lingui/macro';
import TALENTS from 'common/TALENTS/paladin';
import { Panel } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Auras';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Combatants from 'parser/shared/modules/Combatants';
import Enemies from 'parser/shared/modules/Enemies';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import DeathRecap from './DeathRecap';
import DEFENSIVE_BUFFS from './DEFENSIVE_BUFFS';

class DeathRecapTracker extends Analyzer {
  deaths = [];
  events = [];
  healed = [];
  damaged = [];
  cooldowns = [];
  buffs = [];
  lastBuffs = [];

  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
    buffsModule: Buffs,
    spellUsable: SpellUsable,
    enemies: Enemies,
  };

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.instakill.to(SELECTED_PLAYER), this.onInstakill);
    this.addEventListener(Events.death.to(SELECTED_PLAYER), this.onDeath);
    this.cooldowns = this.abilities.activeAbilities.filter(
      (ability) =>
        ability.category === SPELL_CATEGORY.DEFENSIVE ||
        ability.category === SPELL_CATEGORY.SEMI_DEFENSIVE ||
        ability.isDefensive,
    );
    // Add additional defensive buffs/debuffs to common/DEFENSIVE_BUFFS
    DEFENSIVE_BUFFS.forEach((e) => {
      this.buffs.push({
        id: e.spell.id,
      });
    });
    this.buffsModule.activeAuras.forEach((buff) => {
      if (buff.spellId instanceof Array) {
        buff.spellId.forEach((spellId) => {
          this.buffs.push({
            id: spellId,
          });
        });
      } else {
        this.buffs.push({
          id: buff.spellId,
        });
      }
    });
  }

  addEvent(event) {
    const extendedEvent = { ...event };
    extendedEvent.time = event.timestamp - this.owner.fight.start_time;

    const cooldownsOnly = this.cooldowns.filter((e) => e.cooldown);
    extendedEvent.defensiveCooldowns = cooldownsOnly.map((e) => ({
      id: e.primarySpell,
      cooldownReady: this.spellUsable.isAvailable(e.primarySpell),
    }));
    if (event.hitPoints > 0) {
      this.lastBuffs = this.buffs.filter((e) => {
        const buff = this.selectedCombatant.getBuff(e.id);
        const hasBuff = buff !== undefined;
        if (!hasBuff) {
          return false;
        }
        if (e.id === TALENTS.BLESSING_OF_SACRIFICE_TALENT.id) {
          return buff.sourceID === this.selectedCombatant.id;
        }
        return true;
      });
    }
    extendedEvent.buffsUp = this.lastBuffs;

    if (!event.sourceIsFriendly && this.enemies.enemies[event.sourceID]) {
      const sourceHasDebuff = (debuff) =>
        (!debuff.end || event.timestamp <= debuff.end) &&
        event.timestamp >= debuff.start &&
        debuff.isDebuff &&
        this.buffs.some((e) => e.id === debuff.ability.guid);
      extendedEvent.debuffsUp = this.enemies.enemies[event.sourceID].buffs
        .filter(sourceHasDebuff)
        .map((e) => ({ id: e.ability.guid }));
    }

    this.events.push(extendedEvent);
  }

  onHeal(event) {
    this.addEvent(event);
  }
  onDamage(event) {
    this.addEvent(event);
  }
  onInstakill(event) {
    this.addEvent(event);
  }
  onDeath(event) {
    if (event.timestamp <= this.owner.fight.start_time) {
      return;
    }
    this.addEvent(event);
    this.deaths.push(event.timestamp);
  }

  get secondsBeforeDeath() {
    return this.deaths.map((deathtime) => ({
      deathtime,
      events: this.events,
      open: false,
    }));
  }

  // TODO: Turn this into a core component that is used directly by Results instead (tab is deprecated)
  tab() {
    if (this.deaths.length === 0) {
      return null;
    }

    return {
      title: <Trans id="interface.report.results.navigationBar.deathRecap">Death Recap</Trans>,
      url: 'death-recap',
      render: () => (
        <Panel
          title={<Trans id="interface.report.results.navigationBar.deathRecap">Death Recap</Trans>}
          pad={false}
        >
          <DeathRecap
            report={this.owner}
            events={this.secondsBeforeDeath}
            combatants={this.combatants.players}
            enemies={this.enemies.enemies}
          />
        </Panel>
      ),
    };
  }
}

export default DeathRecapTracker;
