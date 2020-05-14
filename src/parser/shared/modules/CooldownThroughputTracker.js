import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Panel from 'interface/others/Panel';
import CooldownIcon from 'interface/icons/Cooldown';
import CooldownOverview from 'interface/others/CooldownOverview';
import Analyzer from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';

const debug = false;

export const BUILT_IN_SUMMARY_TYPES = {
  HEALING: 'HEALING',
  OVERHEALING: 'OVERHEALING',
  ABSORBED: 'ABSORBED',
  ABSORBS_APPLIED: 'ABSORBS_APPLIED',
  MANA: 'MANA',
  DAMAGE: 'DAMAGE',
};

class CooldownThroughputTracker extends Analyzer {
  static cooldownSpells = [
    {
      spell: SPELLS.INNERVATE,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
    },
  ];

  static castCooldowns = [
    // Some cooldowns cannot be tracked by a buff such as the Destruction 'Summon Infernal'. This is usually because their are temporary pet summons.
    // if you want to add some spells specific to your spec, redefine this array in your spec CooldownThroughputTracker similarly to cooldownSpells (see Destruction Warlock for example)
  ]

  static ignoredSpells = [
    // general spells that you don't want to see in the Cooldown overview (could be boss mechanics etc.) should belong here
    // if you want to add some spells specific to your spec, redefine this array in your spec CooldownThroughputTracker similarly to cooldownSpells (see Marksmanship Hunter for example)
    ...CASTS_THAT_ARENT_CASTS,
  ];

  static trackPlayerPetDamage = false;

  pastCooldowns = [];
  activeCooldowns = [];

  startCooldown(event, castCooldown = false) {
    const spellId = event.ability.guid;
    let cooldownSpell = null;

    if (castCooldown) {
      cooldownSpell = this.constructor.castCooldowns.find(cooldownSpell => cooldownSpell.spell.id === spellId);
    } else {
      cooldownSpell = this.constructor.cooldownSpells.find(cooldownSpell => cooldownSpell.spell.id === spellId);
    }

    if (!cooldownSpell) {
      return;
    }

    const cooldown = this.addCooldown(cooldownSpell, event.timestamp);
    this.activeCooldowns.push(cooldown);
    debug && console.log(`%cCooldown started: ${cooldownSpell.spell.name}`, 'color: green', cooldown);
  }
  addCooldown(cooldownSpell, timestamp) {
    const cooldown = {
      ...cooldownSpell,
      start: timestamp,
      end: cooldownSpell.duration ? timestamp + cooldownSpell.duration * 1000 : null,
      events: [],
    };
    this.pastCooldowns.push(cooldown);
    return cooldown;
  }
  endCooldown(event) {
    const spellId = event.ability.guid;
    const index = this.activeCooldowns.findIndex(cooldown => cooldown.spell.id === spellId);
    if (index === -1) {
      return;
    }

    const cooldown = this.activeCooldowns[index];
    cooldown.end = event.timestamp;
    this.activeCooldowns.splice(index, 1);
    debug && console.log(`%cCooldown ended: ${cooldown.spell.name}`, 'color: red', cooldown);
  }
  on_fightend() {
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.end = this.owner.fight.end_time;
      debug && console.log(`%cCooldown ended: ${cooldown.spell.name}`, 'color: red', cooldown);
    });
    this.activeCooldowns = [];
  }

  // region Event tracking
  trackEvent(event) {
    if (this.constructor.castCooldowns.length) {
      // Fixes cooldowns performed by CooldownThroughputTracker::castCooldowns
      this.activeCooldowns = this.activeCooldowns.filter(cooldown => !cooldown.end || event.timestamp < cooldown.end);
    }

    this.activeCooldowns.forEach((cooldown) => {
      cooldown.events.push(event);
    });
  }
  on_byPlayer_cast(event) {
    const spellID = event.ability.guid;
    if (this.constructor.ignoredSpells.includes(spellID)) {
      return;
    }

    if (this.constructor.castCooldowns.findIndex(cooldown => cooldown.spell.id === spellID) !== -1) {
      this.startCooldown(event, true);
    }

    this.trackEvent(event);
  }
  on_byPlayer_heal(event) {
    this.trackEvent(event);
  }
  on_byPlayer_absorbed(event) {
    this.trackEvent(event);
  }
  on_byPlayer_damage(event) {
    this.trackEvent(event);
  }
  on_byPlayer_applybuff(event) {
    this.trackEvent(event);
  }
  on_toPlayer_applybuff(event) {
    this.startCooldown(event);
  }
  on_toPlayer_removebuff(event) {
    this.endCooldown(event);
  }
  on_byPlayer_applydebuff(event) {
    this.startCooldown(event);
  }
  on_byPlayer_removedebuff(event) {
    this.endCooldown(event);
  }
  on_byPlayerPet_damage(event) {
    if (this.constructor.trackPlayerPetDamage) {
      this.trackEvent(event);
    }
  }
  // endregion

  tab() {
    return {
      title: 'Cooldowns',
      icon: CooldownIcon,
      url: 'cooldowns',
      render: () => (
        <Panel
          title="Throughput cooldowns"
          explanation={(
            <>
              This shows the effectiveness of your throughput cooldowns and your cast behavior during them. Click on <i>More</i> to see details such as the delay between casting spells and the healing or damage done with them. Take a look at the timeline for a different kind of view of your casts during buffs.
            </>
          )}
          pad={false}
        >
          <CooldownOverview
            fightStart={this.owner.fight.start_time - this.owner.fight.offset_time}
            fightEnd={this.owner.fight.end_time}
            cooldowns={this.pastCooldowns}
            applyTimeFilter={this.owner.applyTimeFilter}
          />
        </Panel>
      ),
    };
  }
}

export default CooldownThroughputTracker;
