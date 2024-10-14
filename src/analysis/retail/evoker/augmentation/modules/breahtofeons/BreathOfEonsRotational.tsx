import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import Events, {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  CastEvent,
  EmpowerEndEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  RemoveBuffEvent,
  RemoveDebuffEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import {
  BREATH_EBON_APPLY_LINK,
  BREATH_OF_EONS_DEBUFF_LINK,
  EBON_MIGHT_BUFF_LINKS,
  ebonIsFromBreath,
  getBreathOfEonsBuffEvents,
  getBreathOfEonsDamageEvents,
  getBreathOfEonsDebuffApplyEvents,
} from '../normalizers/CastLinkNormalizer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Potions from 'common/SPELLS/thewarwithin/potions';
import BreathOfEonsSection from './BreathOfEonsSection';
import spells from 'common/SPELLS/dragonflight/trinkets';
import trinkets from 'common/ITEMS/dragonflight/trinkets';
import Combatant from 'parser/core/Combatant';
import Combatants from 'parser/shared/modules/Combatants';
import { SpellTracker } from 'analysis/retail/evoker/shared/modules/components/ExplanationGraph';
import BreathOfEonsHelper from './BreathOfEonsHelper';
import { BREATH_OF_EONS_SPELLS } from '../../constants';

export type BreathOfEonsWindows = {
  flightData: SpellTracker[];
  breathPerformance: BreathWindowPerformance;
  start: number;
  end: number;
};

type BreathWindowPerformance = {
  temporalWoundsCounter: SpellTracker[];
  ebonMightDroppedDuringBreath: boolean;
  ebonMightDroppedDuration: number;
  ebonMightDrops: number[];
  ebonMightProblems: SpellTracker[];
  possibleTrinkets: number;
  trinketUsed: number;
  possiblePotions: number;
  potionUsed: number;
  fireBreaths: number;
  possibleFireBreaths: number;
  upheavals: number;
  possibleUpheavals: number;
  timeskipTalented: boolean;
  possibleTimeSkips: number;
  timeSkips: number;
  damageProblemPoints: SpellTracker[];
  earlyDeaths: number;
  successfulHits: number;
  potentialLostDamage: number;
  damage: number;
  buffedPlayers: Map<string, Combatant>;
  earlyDeadMobs: RemoveDebuffEvent[];
};

/**
 * Breath of Eons is Augmentations major cooldown, it works as a damage amp for your allies
 * with Ebon Might up. Therefore it is important to play around this window correctly.
 *
 * Currently in this module we will be analyzing the buff management aspect of the cooldown usages,
 * along with cast performance (Empowers/Timeskip/Potion/Trinket).
 *
 * Essentially keeping track of Ebon Might, Shifting Sands and Temporal Wounds debuffs.
 * We show this using a graph to help visualize the information.
 * We mark problem points such as letting Ebon Might drop or mobs with debuff dying early. These
 * are marked on the graph as red circles.
 *
 * Ideally in the future we would like to introduce outside information gathered from fetchWCL.
 * Some of these things would be either tracking spell usages of your buffed/non buffed teammates,
 * to figure out if a window should have been shifted.
 * Even better solution would be to track raid DPS and compare to see if your should have shifted
 * and/or buffed other players for a stronger burst window.
 * Prolly easier to just make a WCL component for this count of analysis though.
 *
 */

const GRAPH_BUFFER = 3000;

class BreathOfEonsRotational extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    combatants: Combatants,
  };
  protected spellUsable!: SpellUsable;
  protected combatants!: Combatants;

  windows: BreathOfEonsWindows[] = [];

  activeDebuffs: number = 0;
  isEbonMightActive: boolean = false;

  breathWindowActive: boolean = false;
  totalCasts: number = 0;
  latestEbonMightDrop!: RemoveBuffEvent;
  latestEbonMightEvent!: RemoveBuffEvent | ApplyBuffEvent;

  ebonMightCounter: number = 0;
  ebonMightCount: SpellTracker[] = [];
  shiftingsSandsCounter: number = 0;
  shiftingSandsCount: SpellTracker[] = [];

  fireBreath = this.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_AUGMENTATION_TALENT)
    ? SPELLS.FIRE_BREATH_FONT
    : SPELLS.FIRE_BREATH;

  upheaval = this.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_AUGMENTATION_TALENT)
    ? SPELLS.UPHEAVAL_FONT
    : SPELLS.UPHEAVAL;

  trackedSpells = [TALENTS.TIME_SKIP_TALENT];
  empowers = [this.fireBreath, this.upheaval];

  trinketItems = [
    trinkets.IRIDEUS_FRAGMENT,
    trinkets.SPOILS_OF_NELTHARUS,
    trinkets.MIRROR_OF_FRACTURED_TOMORROWS,
  ];

  trinketSpells = [
    spells.IRIDEUS_FRAGMENT,
    spells.SPOILS_OF_NELTHARUS_CRIT,
    spells.SPOILS_OF_NELTHARUS_HASTE,
    spells.SPOILS_OF_NELTHARUS_MASTERY,
    spells.SPOILS_OF_NELTHARUS_VERSATILITY,
    spells.MIRROR_OF_FRACTURED_TOMORROWS,
  ];

  trackedPotions = [Potions.TEMPERED_POTION];

  foundTrinket = this.selectedCombatant.hasTrinket(trinkets.IRIDEUS_FRAGMENT.id)
    ? spells.IRIDEUS_FRAGMENT.id
    : this.selectedCombatant.hasTrinket(trinkets.SPOILS_OF_NELTHARUS.id)
      ? spells.SPOILS_OF_NELTHARUS_CRIT.id
      : this.selectedCombatant.hasTrinket(trinkets.MIRROR_OF_FRACTURED_TOMORROWS.id)
        ? spells.MIRROR_OF_FRACTURED_TOMORROWS.id
        : undefined;

  constructor(options: Options) {
    super(options);

    /** DEBUFF EVENTS */
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.TEMPORAL_WOUND_DEBUFF),
      (event) => {
        this.onDebuffApply(event);
      },
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.TEMPORAL_WOUND_DEBUFF),
      (event) => {
        this.onDebuffRemove(event);
      },
    );

    /** BUFF EVENTS */
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_EXTERNAL),
      (event) => {
        this.onEbonMightApply(event);
      },
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_EXTERNAL),
      (event) => {
        this.onEbonMightRemove(event);
      },
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHIFTING_SANDS_BUFF),
      (event) => {
        this.onShiftingSandsApply(event);
      },
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SHIFTING_SANDS_BUFF),
      (event) => {
        this.onShiftingSandsRemove(event);
      },
    );
    /** CAST EVENTS */
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(BREATH_OF_EONS_SPELLS), (event) => {
      this.onBreathCast(event);
    });
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.trackedSpells), (event) => {
      this.onCast(event);
    });
    this.addEventListener(Events.empowerEnd.by(SELECTED_PLAYER).spell(this.empowers), (event) => {
      this.onCast(event);
    });
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.trinketSpells), (event) => {
      this.onCast(event);
    });
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.trackedPotions), (event) => {
      this.onCast(event);
    });
    /** SPELL USABLE EVENTS */
    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(this.empowers),
      (event) => {
        this.onUpdateSpellUsable(event);
      },
    );
    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(this.trinketSpells),
      (event) => {
        this.onUpdateSpellUsable(event);
      },
    );
    /** FIGHT END */
    this.addEventListener(Events.fightend, this.finalize);
  }

  private onBreathCast(event: CastEvent) {
    /** Grab all the related events regarding Breath of Eons
     * The relevant Debuff events have been linked to the cast event by the CastLinkNormalizer
     * This makes analysis much easier since we would otherwise need to do a lot of filtering
     * Due to other Augmentations apparently also wanting to use Breath of Eons alongside you :) */
    const flightEvents = getBreathOfEonsBuffEvents(event);
    const flightData: SpellTracker[] = [];
    const debuffHits = getBreathOfEonsDebuffApplyEvents(event).length;

    // Create counter for Flight Time
    flightEvents.forEach((flightEvent) => {
      if (flightEvent.type === EventType.ApplyBuff) {
        flightData.push({ timestamp: flightEvent.timestamp, count: 0 });
        flightData.push({
          timestamp: flightEvent.timestamp,
          count: debuffHits / 2,
        });
      } else {
        flightData.push({ timestamp: flightEvent.timestamp, count: 0 });
      }
    });

    // -1 indicates no proper use trinket
    let trinketReady = this.foundTrinket
      ? this.spellUsable.isAvailable(this.foundTrinket)
        ? 1
        : 0
      : -1;
    let trinketUsed = 0;
    // Check if Trinket was used pre-breath
    this.trinketSpells.forEach((trinket) => {
      if (this.selectedCombatant.hasBuff(trinket.id)) {
        trinketUsed = 1;
        trinketReady = 1;
      }
    });

    let potionReady = this.spellUsable.isAvailable(Potions.TEMPERED_POTION.id) ? 1 : 0;
    let potionUsed = 0;
    // Check if Potion was used pre-breath
    this.trackedPotions.forEach((potion) => {
      if (this.selectedCombatant.hasBuff(potion.id)) {
        potionUsed = 1;
        potionReady = 1;
      }
    });

    /** Since Breath cast happens before it applies Ebon Might
     * Check if Ebon Might was applied by Breath of Eons
     * and add our combatants from the bufflinks */
    const currentBuffedTargets: Map<string, Combatant> = new Map();
    if (ebonIsFromBreath(event)) {
      GetRelatedEvents(event, BREATH_EBON_APPLY_LINK).forEach((relatedEvent) => {
        GetRelatedEvents(relatedEvent, EBON_MIGHT_BUFF_LINKS).forEach((ebonMightEvent) => {
          if (ebonMightEvent.type === EventType.ApplyBuff) {
            const buffTarget = this.combatants.players[ebonMightEvent.targetID];
            currentBuffedTargets.set(buffTarget.name, buffTarget);
          }
        });
      });
    } else {
      const players = Object.values(this.combatants.players);
      players.forEach((player) => {
        if (player.hasBuff(SPELLS.EBON_MIGHT_BUFF_EXTERNAL.id)) {
          currentBuffedTargets.set(player.name, player);
        }
      });
    }

    this.windows.push({
      flightData: flightData,

      breathPerformance: {
        temporalWoundsCounter: [],
        ebonMightDroppedDuringBreath: false,
        ebonMightDroppedDuration: 0,
        ebonMightDrops: [],
        possibleTrinkets: trinketReady,
        trinketUsed: trinketUsed,
        possiblePotions: potionReady,
        potionUsed: potionUsed,
        fireBreaths: 0,
        possibleFireBreaths: this.spellUsable.isAvailable(this.fireBreath.id) ? 1 : 0,
        upheavals: 0,
        possibleUpheavals: this.spellUsable.isAvailable(this.upheaval.id) ? 1 : 0,
        timeskipTalented:
          this.selectedCombatant.hasTalent(TALENTS.TIME_SKIP_TALENT) &&
          !this.selectedCombatant.hasTalent(TALENTS.INTERWOVEN_THREADS_TALENT),
        possibleTimeSkips: this.spellUsable.isAvailable(TALENTS.TIME_SKIP_TALENT.id) ? 1 : 0,
        timeSkips: 0,
        damageProblemPoints: [],
        ebonMightProblems: [],
        earlyDeaths: 0,
        successfulHits: 0,
        potentialLostDamage: 0,
        damage: 0,
        buffedPlayers: currentBuffedTargets,
        earlyDeadMobs: [],
      },
      start: 0,
      end: 0,
    });
    this.totalCasts = this.totalCasts + 1;
  }

  /** Track casts inside of Breath Windows */
  private onCast(event: CastEvent | EmpowerEndEvent) {
    if (!this.breathWindowActive) {
      return;
    }
    const perfWindow = this.currentPerformanceBreathWindow;
    if (event.ability.guid === this.fireBreath.id) {
      perfWindow.fireBreaths += 1;
    } else if (event.ability.guid === this.upheaval.id) {
      perfWindow.upheavals += 1;
    } else if (event.ability.guid === TALENTS.TIME_SKIP_TALENT.id) {
      perfWindow.timeSkips += 1;
    } else if (event.ability.guid === this.foundTrinket) {
      perfWindow.trinketUsed += 1;
    } else if (
      event.ability.guid === this.trackedPotions[0].id ||
      event.ability.guid === this.trackedPotions[1].id
    ) {
      perfWindow.potionUsed += 1;
    }
  }

  /** Track when spells/trinkets/pots become ready during Breath Windows */
  private onUpdateSpellUsable(event: UpdateSpellUsableEvent) {
    if (this.breathWindowActive && event.updateType === UpdateSpellUsableType.EndCooldown) {
      const perfWindow = this.currentPerformanceBreathWindow;
      if (event.ability.guid === this.fireBreath.id) {
        perfWindow.possibleFireBreaths += 1;
      } else if (event.ability.guid === this.upheaval.id) {
        perfWindow.possibleUpheavals += 1;
      } else if (event.ability.guid === this.foundTrinket) {
        perfWindow.possibleTrinkets += 1;
      }
    }
  }

  /** Keep track of Ebon Might, if it gets applied during an active
   * window, count the lost uptime.
   * Push to the Ebon Might counter used for the graph */
  private onEbonMightApply(event: ApplyBuffEvent) {
    this.isEbonMightActive = true;
    this.ebonMightCounter += 1;

    if (
      this.breathWindowActive &&
      event.timestamp !== this.latestEbonMightEvent.timestamp &&
      this.latestEbonMightDrop
    ) {
      const perfWindow = this.currentPerformanceBreathWindow;
      const droppedUptime = perfWindow.ebonMightDrops.reduce(
        (acc, timestamp) => acc + (event.timestamp - timestamp) / perfWindow.buffedPlayers.size,
        0,
      );

      perfWindow.ebonMightDrops = [];
      perfWindow.ebonMightDroppedDuration += droppedUptime;
    }
    this.latestEbonMightEvent = event;
    this.ebonMightCount.push({ timestamp: event.timestamp, count: this.ebonMightCounter });
  }

  /** Keep track of Ebon Might, if it gets removed during an active
   * window, mark it down as a problem point, used for the graph. */
  private onEbonMightRemove(event: RemoveBuffEvent) {
    this.isEbonMightActive = false;
    this.latestEbonMightEvent = event;
    this.ebonMightCounter -= 1;

    this.ebonMightCount.push({ timestamp: event.timestamp, count: this.ebonMightCounter });

    if (this.breathWindowActive) {
      const perfWindow = this.currentPerformanceBreathWindow;
      perfWindow.ebonMightDroppedDuringBreath = true;
      this.latestEbonMightDrop = event;

      const prevProblem = perfWindow.ebonMightProblems[perfWindow.ebonMightProblems.length - 1];
      perfWindow.ebonMightDrops.push(event.timestamp);

      const ebonMightProblem = {
        timestamp: event.timestamp,
        count: this.ebonMightCounter,
        tooltip: 'You dropped Ebon Might',
      };

      // If you drop multiple Ebon Mights at the same time, only push one Problem point
      if (prevProblem && prevProblem.timestamp === event.timestamp) {
        perfWindow.ebonMightProblems[perfWindow.ebonMightProblems.length - 1] = ebonMightProblem;
      } else {
        perfWindow.ebonMightProblems.push(ebonMightProblem);
      }
    }
  }

  private onShiftingSandsApply(event: ApplyBuffEvent) {
    this.shiftingsSandsCounter += 1;

    this.shiftingSandsCount.push({
      timestamp: event.timestamp,
      count: this.shiftingsSandsCounter,
    });
  }

  private onShiftingSandsRemove(event: RemoveBuffEvent) {
    this.shiftingsSandsCounter -= 1;

    this.shiftingSandsCount.push({
      timestamp: event.timestamp,
      count: this.shiftingsSandsCounter,
    });
  }

  private onDebuffApply(event: ApplyDebuffEvent) {
    if (this.currentBreathWindow.start === 0) {
      this.breathWindowActive = true;

      this.currentPerformanceBreathWindow.temporalWoundsCounter = [
        {
          timestamp: event.timestamp,
          count: 0,
        },
      ];
      this.currentBreathWindow.start = event.timestamp;
    }

    if (HasRelatedEvent(event, BREATH_OF_EONS_DEBUFF_LINK)) {
      this.activeDebuffs = this.activeDebuffs + 1;
    }

    this.currentPerformanceBreathWindow.temporalWoundsCounter.push({
      timestamp: event.timestamp,
      count: this.activeDebuffs,
    });
  }

  /** Here we keep track of removal of Temporal Wounds
   * we figure out if the removal was because it ran out (good),
   * or if it was because the mob died early (bad).
   * If a mob dies early you lose out on ALL the damage gathered within it
   * so it is a definitive problem point which we mark.
   *
   * There is also some calculation of potential damage loss
   * this is kinda guesstimaty cus prio damage and what not
   * it could be (somewhat, still have some contributions missing) accurately
   * be tracked using WCL events.*/
  private onDebuffRemove(event: RemoveDebuffEvent) {
    this.activeDebuffs -= 1;
    const perfWindow = this.currentPerformanceBreathWindow;
    const breathWindow = this.currentBreathWindow;
    perfWindow.temporalWoundsCounter.push({
      timestamp: event.timestamp,
      count: this.activeDebuffs,
    });

    const damageEvents = getBreathOfEonsDamageEvents(event);
    const damageFound = damageEvents.length > 0;
    if (!damageFound) {
      perfWindow.damageProblemPoints.push({
        timestamp: event.timestamp,
        count: this.activeDebuffs,
        tooltip: 'Mob died early.',
      });
      perfWindow.earlyDeaths += 1;
      perfWindow.earlyDeadMobs.push(event);
    } else {
      damageEvents.forEach((damageEvent) => {
        perfWindow.damage += damageEvent.amount + (damageEvent.absorbed ?? 0);
      });
      perfWindow.successfulHits += 1;
    }

    /** In 10.2 blizzard introduced *sparkles* delayed EM buffs *sparkles*
     * so now we need to double check whether or not we actually found our buffed players */
    if (this.currentPerformanceBreathWindow.buffedPlayers.size === 0) {
      const currentBuffedTargets: Map<string, Combatant> = new Map();
      const players = Object.values(this.combatants.players);
      players.forEach((player) => {
        if (player.hasBuff(SPELLS.EBON_MIGHT_BUFF_EXTERNAL.id)) {
          currentBuffedTargets.set(player.name, player);
        }
      });
      this.currentPerformanceBreathWindow.buffedPlayers = currentBuffedTargets;
    }

    if (
      this.activeDebuffs === 0 &&
      !BREATH_OF_EONS_SPELLS.some((spell) => this.selectedCombatant.hasBuff(spell.id))
    ) {
      this.breathWindowActive = false;

      const ebonMightDroppedDuringBreath = perfWindow.ebonMightDroppedDuringBreath;

      if (ebonMightDroppedDuringBreath && perfWindow.ebonMightDrops.length) {
        const droppedUptime = perfWindow.ebonMightDrops.reduce(
          (acc, timestamp) => acc + (event.timestamp - timestamp) / perfWindow.buffedPlayers.size,
          0,
        );

        perfWindow.ebonMightDroppedDuration += droppedUptime;
      }

      breathWindow.breathPerformance = perfWindow;
      breathWindow.end = event.timestamp;

      const endTimestamp =
        event.timestamp + GRAPH_BUFFER < this.owner.fight.end_time
          ? event.timestamp + GRAPH_BUFFER
          : this.owner.fight.end_time;
      perfWindow.temporalWoundsCounter.push({
        timestamp: endTimestamp,
        count: 0,
      });

      // Calculate potential damage loss
      // We add a multiplier to account for prio target damage
      const PRIO_MULTIPLIER = 0.8;
      const potentialDamagePerTarget = perfWindow.damage / perfWindow.successfulHits;
      perfWindow.potentialLostDamage =
        potentialDamagePerTarget * perfWindow.earlyDeaths * PRIO_MULTIPLIER;
    }
  }

  private finalize() {
    if (!this.currentBreathWindow) {
      return;
    }
    // Clean up current window if it runs out during combat end / death etc..
    const breathWindow = this.currentBreathWindow;
    if (breathWindow.end === 0) {
      breathWindow.end = this.owner.fight.end_time;

      // Incase something weird happened make sure we don't make a super long window
      // Length doesnt really matter too much if you dead so we just
      // Cap it at 14s.
      const windowSudoMaxLength = 1400;
      if (breathWindow.end - breathWindow.start > windowSudoMaxLength) {
        breathWindow.end = breathWindow.start + windowSudoMaxLength;
      }
      this.ebonMightCount.push({
        timestamp: this.owner.fight.end_time,
        count: this.ebonMightCounter,
      });
      if (this.currentPerformanceBreathWindow.temporalWoundsCounter.length > 0) {
        this.currentPerformanceBreathWindow.temporalWoundsCounter.push({
          timestamp: this.owner.fight.end_time,
          count: this.activeDebuffs,
        });
      }
    }
  }

  get currentPerformanceBreathWindow() {
    return this.windows[this.totalCasts - 1].breathPerformance;
  }

  get currentBreathWindow() {
    return this.windows[this.totalCasts - 1];
  }

  guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }
    return (
      <BreathOfEonsSection
        windows={this.windows}
        fightStartTime={this.owner.fight.start_time}
        fightEndTime={this.owner.fight.end_time}
        ebonMightCount={this.ebonMightCount}
        shiftingSandsCount={this.shiftingSandsCount}
      />
    );
  }
  helperSection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }
    return (
      <BreathOfEonsHelper
        windows={this.windows}
        fightStartTime={this.owner.fight.start_time}
        fightEndTime={this.owner.fight.end_time}
        owner={this.owner}
      />
    );
  }
}

export default BreathOfEonsRotational;
