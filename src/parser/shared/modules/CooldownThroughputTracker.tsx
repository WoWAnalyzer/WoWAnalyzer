import { defineMessage, Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import CLASSIC_SPELLS from 'common/SPELLS/classic';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { Panel } from 'interface';
import CooldownIcon from 'interface/icons/Cooldown';
import Analyzer, { SELECTED_PLAYER, Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import EventFilter from 'parser/core/EventFilter';
import Events, {
  AnyEvent,
  AbsorbedEvent,
  ApplyBuffEvent,
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  HealEvent,
  RemoveBuffEvent,
  RemoveDebuffEvent,
  SummonEvent,
  DeathEvent,
} from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';
import CooldownOverview from 'parser/ui/CooldownOverview';
import { ReactNode } from 'react';
import GameBranch from 'game/GameBranch';

const debug = false;

export enum BUILT_IN_SUMMARY_TYPES {
  HEALING = 'HEALING',
  OVERHEALING = 'OVERHEALING',
  ABSORBED = 'ABSORBED',
  ABSORBS_APPLIED = 'ABSORBS_APPLIED',
  MANA = 'MANA',
  DAMAGE = 'DAMAGE',
}

export type TrackedEvent = CastEvent | HealEvent | AbsorbedEvent | DamageEvent | ApplyBuffEvent;

export type SummaryDef = {
  label: string;
  tooltip: string;
  value: number | string;
};

export type CooldownSpell = {
  spell: number;
  summary: Array<BUILT_IN_SUMMARY_TYPES | SummaryDef>;
  startBufferFilter?: EventFilter<any>;
  startBufferMS?: number;
  startBufferEvents?: number;
  petID?: number;
  duration?: number;
  branch?: GameBranch;
  durationTooltip?: ReactNode;
};

type BuffCooldownSpell = CooldownSpell & {
  branch: GameBranch;
};

export type TrackedCooldown = CooldownSpell & {
  /** The timestamp to begin tracking events */
  start: number;
  /** The timestamp the Cooldown was cast/applied */
  cdStart: number;
  /** The timestamp the Cooldown ends / we stop trakcing */
  end: number | null;
  events: AnyEvent[];
};

class CooldownThroughputTracker extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;

  static cooldownSpells: BuffCooldownSpell[] = [
    // Retail
    {
      spell: SPELLS.INNERVATE.id,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
      branch: GameBranch.Retail,
    },
    {
      spell: TALENTS_PRIEST.POWER_INFUSION_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE, BUILT_IN_SUMMARY_TYPES.HEALING],
      branch: GameBranch.Retail,
    },
    // Classic
    {
      spell: CLASSIC_SPELLS.BLOODLUST.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE, BUILT_IN_SUMMARY_TYPES.HEALING],
      branch: GameBranch.Classic,
    },
    {
      spell: CLASSIC_SPELLS.HEROISM.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE, BUILT_IN_SUMMARY_TYPES.HEALING],
      branch: GameBranch.Classic,
    },
    {
      spell: CLASSIC_SPELLS.POWER_INFUSION.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE, BUILT_IN_SUMMARY_TYPES.HEALING],
      branch: GameBranch.Classic,
    },
    {
      spell: CLASSIC_SPELLS.TIME_WARP.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE, BUILT_IN_SUMMARY_TYPES.HEALING],
      branch: GameBranch.Classic,
    },
  ];

  static ignoredSpells: number[] = [
    // General spells that you don't want to see in the Cooldown overview (could be boss mechanics etc.) should belong here.
    // If you want to add some spells specific to your spec, redefine this array in your spec CooldownThroughputTracker similarly to cooldownSpells (see Marksmanship Hunter for example)
    ...CASTS_THAT_ARENT_CASTS,
  ];

  static castCooldowns: CooldownSpell[] = [
    // Some cooldowns cannot be tracked by a buff such as the Destruction 'Summon Infernal'. This is usually because they are temporary pet summons.
    // If you want to add some spells specific to your spec, redefine this array in your spec CooldownThroughputTracker similarly to cooldownSpells (see Destruction Warlock for example)
  ];

  pastCooldowns: TrackedCooldown[] = [];
  activeCooldowns: TrackedCooldown[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.fightend, this.onFightEnd);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER), this.onAbsorb);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this.onApplyBuff);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplyBuffToPlayer);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER), this.onRemoveBuff);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER), this.onApplyDebuff);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER), this.onRemoveDebuff);
    this.addEventListener(Events.summon.by(SELECTED_PLAYER), this.onSummon);
    this.addEventListener(Events.death.to(SELECTED_PLAYER_PET), this.onPetDeath);
  }

  startCooldown(
    event: CastEvent | ApplyBuffEvent | ApplyDebuffEvent,
    isCastCooldown: boolean = false,
  ) {
    const branch = this.owner.config.branch;
    const spellId = event.ability.guid;
    const ctor = this.constructor as typeof CooldownThroughputTracker;
    let cooldownSpell: CooldownSpell | undefined;
    if (isCastCooldown) {
      cooldownSpell = ctor.castCooldowns.find((cooldownSpell) => cooldownSpell.spell === spellId);
    } else {
      cooldownSpell = ctor.cooldownSpells.find(
        (cooldownSpell) => cooldownSpell.spell === spellId && branch === cooldownSpell.branch,
      );
    }

    if (!cooldownSpell) {
      return;
    }

    const cooldown = this.addCooldown(cooldownSpell, event.timestamp);
    this.activeCooldowns.push(cooldown);
    debug &&
      console.log(`%cCooldown started: ${SPELLS[cooldownSpell.spell]}`, 'color: green', cooldown);
  }

  addCooldown(cooldownSpell: CooldownSpell, timestamp: number): TrackedCooldown {
    let events: AnyEvent[] = [];
    const cdStart = timestamp;
    let start = cdStart;
    const startBufferMS = cooldownSpell.startBufferMS;
    if (startBufferMS || cooldownSpell.startBufferEvents) {
      // Default to only including cast events by the player
      const filter = cooldownSpell.startBufferFilter || Events.cast.by(SELECTED_PLAYER);
      const ctor = this.constructor as typeof CooldownThroughputTracker;
      events = this.eventHistory
        .last(cooldownSpell.startBufferEvents, startBufferMS, filter)
        .filter((event) => !ctor.ignoredSpells.includes(event.ability.guid));
      if (startBufferMS) {
        start = timestamp - startBufferMS;
      } else {
        // If filtering by only event count, set the start timestamp to the oldest event found
        start = (events[0] && events[0].timestamp) || start;
      }
    }
    const cooldown = {
      ...cooldownSpell,
      start: start,
      cdStart: cdStart,
      end: cooldownSpell.duration ? cooldownSpell.duration * 1000 + timestamp : null,
      events: events,
    };

    this.pastCooldowns.push(cooldown);
    return cooldown;
  }

  endCooldown(event: RemoveDebuffEvent | RemoveBuffEvent) {
    const spellId = event.ability.guid;
    const index = this.activeCooldowns.findIndex((cooldown) => cooldown.spell === spellId);
    if (index === -1) {
      return;
    }

    const cooldown = this.activeCooldowns[index];
    cooldown.end = event.timestamp;
    this.activeCooldowns.splice(index, 1);
    debug &&
      console.log(`%cCooldown ended: ${SPELLS[cooldown.spell].name}`, 'color: red', cooldown);
  }

  onFightEnd() {
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.end = this.owner.fight.end_time;
      debug &&
        console.log(`%cCooldown ended: ${SPELLS[cooldown.spell].name}`, 'color: red', cooldown);
    });
    this.activeCooldowns = [];
  }

  // region Event tracking
  trackEvent(event: TrackedEvent) {
    const ctor = this.constructor as typeof CooldownThroughputTracker;
    if (ctor.castCooldowns.length) {
      this.activeCooldowns = this.activeCooldowns.filter(
        (cooldown) => !cooldown.end || event.timestamp < cooldown.end,
      );
    }

    this.activeCooldowns.forEach((cooldown) => {
      cooldown.events.push(event);
    });
  }

  onCast(event: CastEvent) {
    const ctor = this.constructor as typeof CooldownThroughputTracker;
    const spellId = event.ability.guid;
    if (ctor.ignoredSpells.includes(spellId)) {
      return;
    }
    if (ctor.castCooldowns.findIndex((cooldown) => cooldown.spell === spellId) !== -1) {
      this.startCooldown(event, true);
    } else {
      this.trackEvent(event);
    }
  }

  onHeal(event: HealEvent) {
    this.trackEvent(event);
  }

  onAbsorb(event: AbsorbedEvent) {
    this.trackEvent(event);
  }

  onDamage(event: DamageEvent) {
    this.trackEvent(event);
  }

  onPetDamage(event: DamageEvent) {
    this.trackEvent(event);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.trackEvent(event);
  }

  onApplyBuffToPlayer(event: ApplyBuffEvent) {
    this.startCooldown(event);
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.endCooldown(event);
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    this.startCooldown(event);
  }

  onRemoveDebuff(event: RemoveDebuffEvent) {
    this.endCooldown(event);
  }

  onSummon(event: SummonEvent) {
    const spellId = event.ability.guid;
    const ctor = this.constructor as typeof CooldownThroughputTracker;
    const cooldownSpell = ctor.cooldownSpells.find(
      (cooldownSpell) => cooldownSpell.spell === spellId,
    );
    if (!cooldownSpell) {
      return;
    }

    // This fixes weirdness were you can get the pet and the buff at the same time *cough yu'lon*
    const index = this.activeCooldowns.findIndex((cooldown) => cooldown.spell === spellId);
    if (index !== -1) {
      return;
    }

    const cooldown = this.addCooldown(cooldownSpell, event.timestamp);
    cooldown.petID = event.targetID;
    this.activeCooldowns.push(cooldown);
    debug &&
      console.log(`%cCooldown started: ${SPELLS[cooldown.spell].name}`, 'color: green', cooldown);
  }

  onPetDeath(event: DeathEvent) {
    const petID = event.targetID;
    const index = this.activeCooldowns.findIndex((cooldown) => cooldown.petID === petID);
    if (index === -1) {
      return;
    }

    const cooldown = this.activeCooldowns[index];
    cooldown.end = event.timestamp;
    this.activeCooldowns.splice(index, 1);
    debug &&
      console.log(`%cCooldown ended: ${SPELLS[cooldown.spell].name}`, 'color: red', cooldown);
  }

  // endregion

  tab() {
    return {
      title: defineMessage({
        id: 'shared.cooldownThroughputTracker.tab',
        message: `Cooldowns`,
      }),
      icon: CooldownIcon,
      url: 'cooldowns',
      render: () => (
        <Panel
          title={
            <Trans id="shared.cooldownThroughputTracker.tab.title">Throughput cooldowns</Trans>
          }
          explanation={
            <Trans id="shared.cooldownThroughputTracker.tab.explanation">
              This shows the effectiveness of your throughput cooldowns and your cast behavior
              during them. Click on <i>More</i> to see details such as the delay between casting
              spells and the healing or damage done with them. Take a look at the timeline for a
              different kind of view of your casts during buffs.
            </Trans>
          }
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
