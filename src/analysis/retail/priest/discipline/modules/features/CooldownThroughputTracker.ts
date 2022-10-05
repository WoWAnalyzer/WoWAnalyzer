import SPELLS from 'common/SPELLS';
import { CastEvent, HealEvent } from 'parser/core/Events';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
  TrackedCooldown,
} from 'parser/shared/modules/CooldownThroughputTracker';
import { TALENTS_PRIEST } from 'common/TALENTS';
import EventHistory from 'parser/shared/modules/EventHistory';

import isAtonement from '../core/isAtonement';
import Atonement from '../spells/Atonement';

const EVANGELISM_ADDED_DURATION = 6000;

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static dependencies = {
    ...CoreCooldownThroughputTracker.dependencies,
    atonementModule: Atonement,
    eventHistory: EventHistory,
  };
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.RAPTURE.id,
      summary: [
        BUILT_IN_SUMMARY_TYPES.ABSORBS_APPLIED,
        BUILT_IN_SUMMARY_TYPES.ABSORBED,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
    },
  ];
  lastEvangelism: TrackedCooldown | null = null;
  protected atonementModule!: Atonement;
  protected eventHistory!: EventHistory;

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === TALENTS_PRIEST.EVANGELISM_TALENT.id) {
      // When Evangelism is cast we want to see it in our cooldowns, but since it isn't a buff we can't use the regular `cooldownSpells`.
      const atonedPlayers = this.atonementModule.numAtonementsActive;

      this.lastEvangelism = this.addCooldown(
        {
          spell: TALENTS_PRIEST.EVANGELISM_TALENT.id,
          summary: [
            BUILT_IN_SUMMARY_TYPES.HEALING,
            {
              value: atonedPlayers,
              label: 'Atonements',
              tooltip: 'The amount of atonements that were up at time of casting Evangelism.',
            },
            {
              value: `${atonedPlayers * 6}s`,
              label: 'Duration gained',
              tooltip: 'The total Atonement duration gained from casting Evangelism.',
            },
          ],
        },
        event.timestamp,
      );

      // Since Evangelism isn't a buff it doesn't really have a duration, for the sake of still providing somewhat useful info we just set the end to the last moment that Evangelism's effect did something
      let lastAtonementExpiration = event.timestamp;
      this.atonementModule.currentAtonementTargets.forEach((target) => {
        if (
          lastAtonementExpiration === null ||
          target.atonementExpirationTimestamp > lastAtonementExpiration
        ) {
          lastAtonementExpiration = target.atonementExpirationTimestamp;
        }
      });
      this.lastEvangelism.end = lastAtonementExpiration + EVANGELISM_ADDED_DURATION;
    }
    if (
      this.lastEvangelism &&
      this.lastEvangelism.end &&
      this.lastEvangelism &&
      event.timestamp < this.lastEvangelism.end
    ) {
      this.lastEvangelism.events.push(event);
    }

    super.onCast(event);
  }

  onHeal(event: HealEvent) {
    if (this.lastEvangelism && isAtonement(event)) {
      const target = this.atonementModule.currentAtonementTargets.find(
        (item) => item.target === event.targetID,
      );
      // Pets, guardians, etc.
      if (!target) {
        return;
      }

      // Add all healing that shouldn't exist due to expiration
      if (event.timestamp > target.atonementExpirationTimestamp) {
        this.lastEvangelism.events.push(event);
      }
    }

    super.onHeal(event);
  }
}

export default CooldownThroughputTracker;
