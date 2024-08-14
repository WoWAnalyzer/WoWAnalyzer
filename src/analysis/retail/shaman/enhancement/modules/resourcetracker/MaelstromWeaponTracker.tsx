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
];
const SUPERCHARGE_MAELSTROM = 3;
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
  hasStaticAccumulation = false;

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
    this.hasStaticAccumulation = this.selectedCombatant.hasTalent(
      TALENTS.STATIC_ACCUMULATION_TALENT,
    );

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
      let gain = GetRelatedEvents(
        event,
        MAELSTROM_GENERATOR_LINK,
        (e) => e.type === EventType.ApplyBuff || e.type === EventType.ApplyBuffStack,
      ).length;
      let waste = GetRelatedEvents(
        event,
        MAELSTROM_GENERATOR_LINK,
        (e) => e.type === EventType.RefreshBuff,
      ).length;

      const spent = event.resourceCost ? event.resourceCost[this.resource.id] : 0;
      const total = gain + waste;
      if (spent > 0 && total) {
        switch (total) {
          case spent + SUPERCHARGE_MAELSTROM:
            // static accumulation is first and we assume it can't have any waste
            this.applyBuilder(TALENTS.STATIC_ACCUMULATION_TALENT.id, spent, 0, event.timestamp);
            gain -= spent;
            waste += gain < 0 ? -gain : 0;
            gain = Math.max(0, gain);
            // Apply supercharge if there's any gain or waste
            if (gain + waste > 0) {
              this.applyBuilder(TALENTS.SUPERCHARGE_TALENT.id, gain, waste, event.timestamp);
            }
            break;
          case spent:
            this.applyBuilder(TALENTS.STATIC_ACCUMULATION_TALENT.id, gain, waste, event.timestamp);
            break;
          case SUPERCHARGE_MAELSTROM:
            this.applyBuilder(TALENTS.SUPERCHARGE_TALENT.id, gain, waste, event.timestamp);
            break;
          default:
            DEBUG &&
              console.error(
                `${total} Maelstrom was gained by ${event.ability.name} but only ${spent} was spent at ${this.owner.formatTimestamp(event.timestamp, 3)}`,
                event,
              );
            break;
        }
      } else {
        if (gain || waste) {
          this.applyBuilder(event.ability.guid, gain, waste, event.timestamp);
        }
      }
    }
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
