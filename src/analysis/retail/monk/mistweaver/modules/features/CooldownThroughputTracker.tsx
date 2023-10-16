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
import SpellLink from 'interface/SpellLink';

const YULON_SPELL_ID = TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id;

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
      durationTooltip: (
        <>
          Duration includes the duration of any{' '}
          <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} />s and{' '}
          <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} />s applied during{' '}
          <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />.
        </>
      ),
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

  private _hasYuLonAttribution(event: HealEvent) {
    const tracker = this.hotTracker.hots[event.targetID]?.[event.ability.guid];
    return tracker && this.hotTracker.fromYuLon(tracker);
  }

  private _prune(cooldown: HotAttributedTrackedEvent) {
    cooldown.events.splice(
      cooldown.lastAttributedIndex + 1,
      cooldown.events.length - cooldown.lastAttributedIndex,
    );
    cooldown.end = cooldown.events[cooldown.events.length - 1].timestamp;
  }

  startCooldown(event: CastEvent | ApplyBuffEvent | ApplyDebuffEvent, isCastCooldown?: boolean) {
    if (event.type === EventType.ApplyBuff && event.ability.guid === YULON_SPELL_ID) {
      const index = this.activeCooldowns.findIndex((cooldown) => cooldown.spell === YULON_SPELL_ID);
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

    // Instead of ending Yu'Lon when the duration expires, keep the CD tracker
    // active until the last hot applied during Yu'Lon falls off. In practice,
    // we'll keep it active until the next cast or until the fight ends and prune
    // it afterwards.
    if (!cd || spellId !== YULON_SPELL_ID) {
      return;
    }

    const extendedCD = cd as HotAttributedTrackedEvent;
    extendedCD.lastAttributedIndex = extendedCD.lastAttributedIndex ?? 0;
    extendedCD.end = null;
    this.activeCooldowns.push(extendedCD);
  }

  onFightend() {
    const cd = this.activeCooldowns.find((cooldown) => cooldown.spell === YULON_SPELL_ID);
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
        cooldown.spell === YULON_SPELL_ID &&
        event.type === EventType.Heal &&
        this._hasYuLonAttribution(event)
      ) {
        (cooldown as HotAttributedTrackedEvent).lastAttributedIndex = cooldown.events.length - 1;
      }
    });
  }
}

export default CooldownThroughputTracker;
