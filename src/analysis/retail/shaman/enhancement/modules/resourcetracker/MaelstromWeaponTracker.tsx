import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { Resource } from 'game/RESOURCE_TYPES';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  ChangeBuffStackEvent,
  ClassResources,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  MAELSTROM_GENERATOR_LINK,
  MAELSTROM_SPENDER_LINK,
  TEMPEST_LINK,
} from '../normalizers/EventLinkNormalizer';
import { MAELSTROM_WEAPON_ELIGIBLE_SPELLS } from 'analysis/retail/shaman/enhancement/constants';

const DEBUG = true;

export const PERFECT_WASTED_PERCENT = 0.1;
export const GOOD_WASTED_PERCENT = 0.2;
export const OK_WASTED_PERCENT = 0.3;

const MAELSTROM_SPENDERS = MAELSTROM_WEAPON_ELIGIBLE_SPELLS.map((spell) => spell.id);
const MAELSTROM_GENERATORS = [
  TALENTS.STORMSTRIKE_TALENT.id,
  TALENTS.LAVA_LASH_TALENT.id,
  TALENTS.ICE_STRIKE_TALENT.id,
  TALENTS.FROST_SHOCK_TALENT.id,
  TALENTS.FIRE_NOVA_TALENT.id,
  TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT.id,
  TALENTS.CHAIN_LIGHTNING_TALENT.id,
  SPELLS.LIGHTNING_BOLT.id,
  SPELLS.TEMPEST_CAST.id,
];
const SUPERCHARGE_MAELSTROM = 3;
const STORM_SWELL_MAELSTROM = 3;
const FERAL_SPIRIT_CDR_PER_MSW_GAINED = 2000;

const MaelstromWeaponResource: Resource = {
  id: -99,
  name: 'Maestrom Weapon',
  icon: 'spell_shaman_maelstromweapon',
  url: 'maelstrom_weapon',
};

class MaelstromWeaponTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
    spellUsable: SpellUsable,
  };

  feralSpiritTotalCooldownReduction = 0;
  feralSpiritCooldownReductionWasted = 0;
  outOfOrderCooldownReduction = 0;

  spellUsable!: SpellUsable;

  //ignoreNextRefresh = true;
  isDead: boolean = false;
  lastAppliedTime = 0;
  expiredWaste = 0;
  isStormbringer = false;

  refundTalentsEnabled: { [key: number]: boolean };

  constructor(options: Options) {
    super(options);
    this.resource = MaelstromWeaponResource;
    this.refundOnMiss = false;
    this.refundOnMissAmount = 0;
    this.isRegenHasted = false;
    this.maxResource = this.selectedCombatant.hasTalent(TALENTS.OVERFLOWING_MAELSTROM_TALENT)
      ? 10
      : 5;
    this.allowMultipleGainsInSameTimestamp = true;
    this.isStormbringer = this.selectedCombatant.hasTalent(TALENTS.TEMPEST_TALENT);

    this.refundTalentsEnabled = {
      [TALENTS.STATIC_ACCUMULATION_TALENT.id]: this.selectedCombatant.hasTalent(
        TALENTS.STATIC_ACCUMULATION_TALENT,
      ),
      [TALENTS.STORM_SWELL_TALENT.id]: this.selectedCombatant.hasTalent(TALENTS.STORM_SWELL_TALENT),
      [TALENTS.SUPERCHARGE_TALENT.id]: this.selectedCombatant.hasTalent(TALENTS.SUPERCHARGE_TALENT),
    };

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCastSpell);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF),
      this.onFeralSpiritCast,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF),
      this.onFeralSpiritCast,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF),
      this.onFeralSpiritCast,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.onChangeStack,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.onChangeStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.onChangeStack,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.onChangeStack,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.onRefresh,
    );
  }

  get wasted() {
    return super.wasted + this.expiredWaste;
  }

  get rawGain() {
    return this.wasted + this.generated;
  }

  get wastedPercent() {
    return this.wasted / this.rawGain;
  }

  get percentWastedPerformance(): QualitativePerformance {
    const percentWasted = this.wastedPercent;
    if (percentWasted <= PERFECT_WASTED_PERCENT) {
      return QualitativePerformance.Perfect;
    }
    if (percentWasted <= GOOD_WASTED_PERCENT) {
      return QualitativePerformance.Good;
    }
    if (percentWasted <= OK_WASTED_PERCENT) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }

  getResourceCost(event: CastEvent): { [resourceType: number]: number } {
    const cost = event.resourceCost ?? {};
    return {
      ...cost,
      [this.resource.id]: this.current,
    };
  }

  onCastSpell(event: CastEvent) {
    if (MAELSTROM_SPENDERS.includes(event.ability.guid)) {
      if (HasRelatedEvent(event, MAELSTROM_SPENDER_LINK)) {
        event.resourceCost = this.getResourceCost(event);
        this._applySpender(event, this.current, {
          amount: this.current,
          max: this.maxResource,
          type: this.resource.id,
        });
      } else {
        DEBUG &&
          console.warn(
            `${event.ability.name} cast @ ${this.owner.formatTimestamp(
              event.timestamp,
              3,
            )} is not linked to a spender`,
            event,
          );
      }
    }
    if (MAELSTROM_GENERATORS.includes(event.ability.guid)) {
      const gainEvents = GetRelatedEvents(
        event,
        MAELSTROM_GENERATOR_LINK,
        (e) => e.type === EventType.ApplyBuff || e.type === EventType.ApplyBuffStack,
      );
      const wasteEvents = GetRelatedEvents(
        event,
        MAELSTROM_GENERATOR_LINK,
        (e) => e.type === EventType.RefreshBuff,
      );
      let gain = gainEvents.length;
      let waste = wasteEvents.length;

      const spent = event.resourceCost ? event.resourceCost[this.resource.id] : 0;
      const refunded = gain + waste;
      let remaininRefund = refunded;
      // static accumulation first
      if (spent && refunded) {
        // Storm Well refund is guaranteed, so apply this first
        if (
          event.ability.guid === SPELLS.TEMPEST_CAST.id &&
          this.refundTalentsEnabled[TALENTS.STORM_SWELL_TALENT.id]
        ) {
          const hits = GetRelatedEvents(
            event,
            TEMPEST_LINK,
            (e) => e.type === EventType.Damage,
          ).length;
          if (hits === 1 && gain + waste >= STORM_SWELL_MAELSTROM) {
            [gain, waste, remaininRefund] = this.adjustRefundGains(
              STORM_SWELL_MAELSTROM,
              remaininRefund,
            );
            this.applyBuilder(
              TALENTS.STORM_SWELL_TALENT.id,
              STORM_SWELL_MAELSTROM,
              0,
              event.timestamp,
            );
          }
        }
        // static accumulation's refund is variable, so apply it first
        if (
          this.refundTalentsEnabled[TALENTS.STATIC_ACCUMULATION_TALENT.id] &&
          remaininRefund >= spent
        ) {
          [gain, waste, remaininRefund] = this.adjustRefundGains(spent, remaininRefund);
          this.applyBuilder(TALENTS.STATIC_ACCUMULATION_TALENT.id, gain, waste, event.timestamp);
        }
        // apply remaining gain to supercharge
        if (
          this.refundTalentsEnabled[TALENTS.SUPERCHARGE_TALENT.id] &&
          remaininRefund >= SUPERCHARGE_MAELSTROM
        ) {
          [gain, waste, remaininRefund] = this.adjustRefundGains(
            SUPERCHARGE_MAELSTROM,
            remaininRefund,
          );
          this.applyBuilder(TALENTS.SUPERCHARGE_TALENT.id, gain, waste, event.timestamp);
        }

        DEBUG &&
          remaininRefund > 0 &&
          console.warn(
            `${refunded} Maelstrom was refunded by ${event.ability.name}, but ${remaininRefund} was unaccounted for @ timestamp ${this.owner.formatTimestamp(event.timestamp, 3)}. Gain assumed to be from other sources`,
            event,
          );

        // get any leftover gain and waste
        [gain, waste] = this.adjustRefundGains(remaininRefund, remaininRefund);
        // for each, truncate the relevant gain/waste linked events so they're properly accounted for on stack change
        // const truncatedGains = gainEvents.slice(0, gainEvents.length - 1 - gain);
        // const truncatedWastes = wasteEvents.slice(0, wasteEvents.length - 1 - gain);
        // event._linkedEvents = event._linkedEvents?.filter(linkedEvent => ![MAELSTROM_GENERATOR_LINK, MAELSTROM_SPENDER_LINK].includes(linkedEvent.relation) || !(truncatedGains.includes(linkedEvent.event) || !truncatedWastes.includes(linkedEvent.event)));
      }

      const generatorId = [
        SPELLS.LIGHTNING_BOLT.id,
        TALENTS.CHAIN_LIGHTNING_TALENT.id,
        SPELLS.TEMPEST_CAST.id,
      ].includes(event.ability.guid)
        ? SPELLS.MAELSTROM_WEAPON_BUFF.id
        : event.ability.guid;
      if (gain || waste) {
        this.applyBuilder(generatorId, gain, waste, event.timestamp);
      }
    }
  }

  adjustRefundGains(refunded: number, remainingRefund: number) {
    let waste = 0;
    const calculatedCurrent = this.current + refunded;
    if (calculatedCurrent > this.maxResource) {
      waste = calculatedCurrent - this.current - this.maxResource;
    }
    const gain = refunded - waste;
    return [gain, waste, remainingRefund - (gain + waste)];
  }

  applyBuilder(spellId: number, gain: number, waste: number, timestamp: number) {
    this._applyBuilder(spellId, gain, waste, timestamp, {
      amount: this.current + gain,
      max: this.maxResource,
      type: this.resource.id,
    });
    this.reduceFeralSpiritCooldown(gain + waste);
  }

  onChangeStack(
    event: ApplyBuffEvent | ApplyBuffStackEvent | RemoveBuffEvent | RemoveBuffStackEvent,
  ) {
    if (
      HasRelatedEvent(event, MAELSTROM_GENERATOR_LINK) ||
      HasRelatedEvent(event, MAELSTROM_SPENDER_LINK)
    ) {
      return;
    }

    let newStacks = 0;
    if (event.type === EventType.ApplyBuff) {
      newStacks = 1;
    } else if (event.type === EventType.ApplyBuffStack) {
      newStacks = event.stack;
    } else if (event.type === EventType.RemoveBuffStack) {
      newStacks = event.stack;
    }

    const change = newStacks - this.current;
    if (change === 0) {
      DEBUG &&
        console.warn(
          `Unexpected zero gain @ ${this.owner.formatTimestamp(event.timestamp, 1)}`,
          event,
        );
      return;
    }
    const resource: ClassResources = {
      amount: change > 0 ? newStacks : this.current,
      max: this.maxResource,
      type: this.resource.id,
    };

    if (change > 0) {
      this._applyBuilder(event.ability.guid, change, 0, event.timestamp, resource);
      this.reduceFeralSpiritCooldown();
    } else {
      DEBUG &&
        console.warn(
          `Resource change @ ${this.owner.formatTimestamp(
            event.timestamp,
            1,
          )} is not linked to a maelstrom spender`,
          event,
        );
      // if there is no linked event, the stacks expired naturally or death
      this._logAndPushUpdate(
        {
          type: 'drain',
          timestamp: event.timestamp,
          current: 0,
          max: this.maxResource,
          rate: 0,
          atCap: false,
        },
        this.current,
        newStacks,
        false,
      );
    }
  }

  onRefresh(event: RefreshBuffEvent) {
    if (HasRelatedEvent(event, MAELSTROM_GENERATOR_LINK)) {
      return;
    }

    if (this.current === 10) {
      this._applyBuilder(
        event.ability.guid,
        0,
        1,
        event.timestamp,
        this.getMaelstromResource(event),
      );
      this.reduceFeralSpiritCooldown();
    } else {
      DEBUG &&
        console.warn(
          `Refresh event @ ${this.owner.formatTimestamp(event.timestamp, 3)} at ${
            this.current
          } maelstrom`,
          event,
        );
    }
  }

  onFeralSpiritCast() {
    this.outOfOrderCooldownReduction += FERAL_SPIRIT_CDR_PER_MSW_GAINED;
  }

  reduceFeralSpiritCooldown(maelstromGained: number = 1) {
    if (!this.selectedCombatant.hasTalent(TALENTS.WITCH_DOCTORS_ANCESTRY_TALENT)) {
      return;
    }

    if (this.spellUsable.isOnCooldown(TALENTS.FERAL_SPIRIT_TALENT.id)) {
      const effectiveReduction = this.spellUsable.reduceCooldown(
        TALENTS.FERAL_SPIRIT_TALENT.id,
        FERAL_SPIRIT_CDR_PER_MSW_GAINED * maelstromGained + this.outOfOrderCooldownReduction,
      );
      this.feralSpiritTotalCooldownReduction += effectiveReduction;
      this.feralSpiritCooldownReductionWasted +=
        FERAL_SPIRIT_CDR_PER_MSW_GAINED * maelstromGained - effectiveReduction;
      this.outOfOrderCooldownReduction = 0;
    } else {
      this.feralSpiritCooldownReductionWasted += Math.max(
        FERAL_SPIRIT_CDR_PER_MSW_GAINED * maelstromGained - this.outOfOrderCooldownReduction,
        0,
      );
    }
  }

  getMaelstromResource(event: RefreshBuffEvent | ChangeBuffStackEvent) {
    let amount = 0;
    if (event.type === EventType.RefreshBuff) {
      // in order for this to be tracked as an overcapped gain (i.e waste), amount should be max + 1
      amount = this.maxResource;
    } else if (event.type === EventType.ChangeBuffStack) {
      amount = event.stacksGained > 0 ? event.newStacks : event.newStacks;
    }
    return {
      amount: amount,
      max: this.maxResource,
      type: MaelstromWeaponResource.id,
    };
  }
}

export default MaelstromWeaponTracker;
