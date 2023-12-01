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

const WITCH_DOCTORS_ANCESTRY_REDUCTION_MS: Record<number, number> = { 1: 1000, 2: 2000 };
const MAELSTROM_SPENDERS = MAELSTROM_WEAPON_ELIGIBLE_SPELLS.map((spell) => spell.id);
const MAELSTROM_GENERATORS = [
  TALENTS.STORMSTRIKE_TALENT.id,
  TALENTS.LAVA_LASH_TALENT.id,
  TALENTS.ICE_STRIKE_TALENT.id,
  TALENTS.FROST_SHOCK_TALENT.id,
  TALENTS.FIRE_NOVA_TALENT.id,
  TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT.id,
];

const MaelstromWeaponResource: Resource = {
  id: -99,
  name: 'Maestrom Weapon',
  icon: 'spell_shaman_maelstromweapon',
  url: 'maelstrom_weapon',
};

export default class extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
    spellUsable: SpellUsable,
  };

  cooldownPerMaelstromGained = 0;
  feralSpiritTotalCooldownReduction = 0;
  feralSpiritCooldownReductionWasted = 0;
  outOfOrderCooldownReduction = 0;

  spellUsable!: SpellUsable;

  //ignoreNextRefresh = true;
  isDead: boolean = false;
  lastAppliedTime = 0;
  expiredWaste = 0;

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

    const rank = this.selectedCombatant.getTalentRank(TALENTS.WITCH_DOCTORS_ANCESTRY_TALENT);
    this.cooldownPerMaelstromGained = WITCH_DOCTORS_ANCESTRY_REDUCTION_MS[rank];

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

  onCastSpell(event: CastEvent) {
    if (MAELSTROM_SPENDERS.includes(event.ability.guid)) {
      if (HasRelatedEvent(event, MAELSTROM_SPENDER_LINK)) {
        const cost = event.resourceCost ?? {};
        event.resourceCost = {
          ...cost,
          [this.resource.id]: this.current,
        };
        this._applySpender(event, this.current, {
          amount: this.current,
          max: this.maxResource,
          type: this.resource.id,
        });
      } else {
        DEBUG && console.warn(`Cast is not linked to a spender`, event);
      }
    } else if (MAELSTROM_GENERATORS.includes(event.ability.guid)) {
      const gain = GetRelatedEvents(
        event,
        MAELSTROM_GENERATOR_LINK,
        (e) => e.type === EventType.ApplyBuff || e.type === EventType.ApplyBuffStack,
      ).length;
      const waste = GetRelatedEvents(
        event,
        MAELSTROM_GENERATOR_LINK,
        (e) => e.type === EventType.RefreshBuff,
      ).length;

      if (gain || waste) {
        this._applyBuilder(event.ability.guid, gain, waste, event.timestamp, {
          amount: this.current + gain,
          max: this.maxResource,
          type: this.resource.id,
        });
        this.reduceFeralSpiritCooldown(gain + waste);
      }
    }
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
    this.outOfOrderCooldownReduction += this.cooldownPerMaelstromGained;
  }

  reduceFeralSpiritCooldown(maelstromGained: number = 1) {
    if (!this.selectedCombatant.hasTalent(TALENTS.WITCH_DOCTORS_ANCESTRY_TALENT)) {
      return;
    }

    if (this.spellUsable.isOnCooldown(TALENTS.FERAL_SPIRIT_TALENT.id)) {
      const effectiveReduction = this.spellUsable.reduceCooldown(
        TALENTS.FERAL_SPIRIT_TALENT.id,
        this.cooldownPerMaelstromGained * maelstromGained + this.outOfOrderCooldownReduction,
      );
      this.feralSpiritTotalCooldownReduction += effectiveReduction;
      this.feralSpiritCooldownReductionWasted +=
        this.cooldownPerMaelstromGained * maelstromGained - effectiveReduction;
      this.outOfOrderCooldownReduction = 0;
    } else {
      this.feralSpiritCooldownReductionWasted += Math.max(
        this.cooldownPerMaelstromGained * maelstromGained - this.outOfOrderCooldownReduction,
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
