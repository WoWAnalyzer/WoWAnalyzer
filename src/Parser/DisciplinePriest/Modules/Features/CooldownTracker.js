import SPELLS from 'common/SPELLS';

import CoreCooldownTracker from 'Parser/Core/Modules/CooldownTracker';

const EVANGELISM_ADDED_DURATION = 6000;

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,
    SPELLS.RAPTURE,
  ];

  lastEvangelism = null;
  on_byPlayer_cast(event) {
    super.on_byPlayer_cast(event);

    const spellId = event.ability.guid;
    if (spellId === SPELLS.EVANGELISM_TALENT.id) {
      // When Evangelism is cast we want to see it in our cooldowns, but since it isn't a buff we can't use the regular `cooldownSpells`.
      this.lastEvangelism = this.addCooldown(SPELLS.EVANGELISM_TALENT, event.timestamp);

      // Since Evangelism isn't a buff it doesn't really have a duration, for the sake of still providing somewhat useful info we just set the end to the last moment that Evangelism's effect did something
      let lastAtonementExpiration = null;
      this.owner.modules.atonement.currentAtonementTargets.forEach((target) => {
        if (lastAtonementExpiration === null || target.atonementExpirationTimestamp > lastAtonementExpiration) {
          lastAtonementExpiration = target.atonementExpirationTimestamp;
        }
      });
      this.lastEvangelism.end = lastAtonementExpiration + EVANGELISM_ADDED_DURATION;
    }
    if (this.lastEvangelism && event.timestamp < this.lastEvangelism.end) {
      this.lastEvangelism.events.push(event);
    }

    super.on_byPlayer_cast(event);
  }
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (this.lastEvangelism && [SPELLS.ATONEMENT_HEAL_NON_CRIT.id, SPELLS.ATONEMENT_HEAL_CRIT.id].indexOf(spellId) !== -1) {
      const target = this.owner.modules.atonement.currentAtonementTargets.find(id => id.target !== event.targetID);
      // Pets, guardians, etc.
      if (!target) {
        return;
      }

      // Add all healing that shouldn't exist due to expiration
      if (event.timestamp > target.atonementExpirationTimestamp) {
        this.lastEvangelism.events.push(event);
      }
    }

    super.on_byPlayer_heal(event);
  }
}

export default CooldownTracker;
