import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { RETAIL_EXPANSION } from 'game/Expansion';
import {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  CastEvent,
  EventType,
  HealEvent,
  RemoveBuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
  TrackedCooldown,
  TrackedEvent,
} from 'parser/shared/modules/CooldownThroughputTracker';
import HotTrackerMW from '../core/HotTrackerMW';

const CELESTIAL_SPELL_IDS = [
  TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id,
  TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id,
];

type HotAttributedTrackedEvent = TrackedCooldown & { lastAttributedIndex: number };

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static dependencies = {
    ...CoreCooldownThroughputTracker.dependencies,
    hotTracker: HotTrackerMW,
  };

  protected hotTracker!: HotTrackerMW;

  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
      expansion: RETAIL_EXPANSION,
    },
    {
      spell: TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
      expansion: RETAIL_EXPANSION,
    },
  ];
  static castCooldowns = [
    ...CoreCooldownThroughputTracker.castCooldowns,
    {
      spell: TALENTS_MONK.MANA_TEA_TALENT.id,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
      expansion: RETAIL_EXPANSION,
    },
  ];

  static ignoredSpells = [
    ...CoreCooldownThroughputTracker.ignoredSpells,
    SPELLS.CHI_BURST_HEAL.id,
    SPELLS.REFRESHING_JADE_WIND_HEAL.id,
    TALENTS_MONK.TRANSCENDENCE_TALENT.id,
  ];

  private _hasCelestialAttribution(event: HealEvent) {
    const tracker = this.hotTracker.hots[event.targetID]?.[event.ability.guid];
    return tracker && this.hotTracker.fromCelestial(tracker);
  }

  private _prune(cooldown: HotAttributedTrackedEvent) {
    cooldown.events.splice(
      cooldown.lastAttributedIndex + 1,
      cooldown.events.length - cooldown.lastAttributedIndex,
    );
    cooldown.end = cooldown.events[cooldown.events.length - 1].timestamp;
  }

  startCooldown(event: CastEvent | ApplyBuffEvent | ApplyDebuffEvent, isCastCooldown?: boolean) {
    if (CELESTIAL_SPELL_IDS.includes(event.ability.guid)) {
      const index = this.activeCooldowns.findIndex((cooldown) => cooldown.spell === 0);
      if (index >= 0) {
        const cd = this.activeCooldowns.splice(index, 1)[0];
        this._prune(cd as HotAttributedTrackedEvent);
      }
    }

    super.startCooldown(event, isCastCooldown);
  }

  endCooldown(event: RemoveDebuffEvent | RemoveBuffEvent) {
    const spellId = event.ability.guid;
    const cd = this.activeCooldowns.find((cooldown) => cooldown.spell === spellId);

    super.endCooldown(event);

    // If we just ended a Yu'Lon or Chi-Ji cooldown, then add a fake cooldown to track
    // that will accumulate all events until the next Yu'Lon or Chi-Ji is cast. Once
    // the next celestial is cast, we'll prune out any events that happened after all
    // the hots applied during the celestial have expired.
    if (!(cd && CELESTIAL_SPELL_IDS.includes(spellId))) {
      return;
    }

    const newCd: HotAttributedTrackedEvent = {
      spell: 0,
      summary: cd.summary,
      start: event.timestamp,
      cdStart: event.timestamp,
      end: null,
      events: [],
      lastAttributedIndex: 0,
    };

    const index = this.pastCooldowns.indexOf(cd);
    this.pastCooldowns.splice(index + 1, 0, newCd);
    this.activeCooldowns.push(newCd);
  }

  onFightend() {
    const cd = this.activeCooldowns.find((cooldown) => cooldown.spell === 0);
    if (cd) {
      this._prune(cd as HotAttributedTrackedEvent);
    }

    super.onFightend();
  }

  trackEvent(event: TrackedEvent) {
    super.trackEvent(event);

    // HotTracker is stateful so we have to track whether the hot was applied during YU'Lon or Chi-Ji
    // during event handling rather than during _prune().
    this.activeCooldowns.forEach((cooldown) => {
      if (
        cooldown.spell === 0 &&
        event.type === EventType.Heal &&
        this._hasCelestialAttribution(event)
      ) {
        (cooldown as HotAttributedTrackedEvent).lastAttributedIndex = cooldown.events.length - 1;
      }
    });
  }
}

export default CooldownThroughputTracker;
