import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { Resource } from 'game/RESOURCE_TYPES';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  RefreshBuffEvent,
  ChangeBuffStackEvent,
  EventType,
  CastEvent,
  FreeCastEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  ClassResources,
  GetRelatedEvent,
} from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  MAELSTROM_GENERATOR_LINK,
  MAELSTROM_WEAPON_SPEND_LINK,
} from '../normalizers/EventLinkNormalizer';

const DEBUG = false;

export const PERFECT_WASTED_PERCENT = 0.1;
export const GOOD_WASTED_PERCENT = 0.2;
export const OK_WASTED_PERCENT = 0.3;

const WITCH_DOCTORS_ANCESTRY_REDUCTION_MS: Record<number, number> = { 1: 1000, 2: 2000 };

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

  ignoreNextRefresh = true;
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

  onChangeStack(
    event: ApplyBuffEvent | ApplyBuffStackEvent | RemoveBuffEvent | RemoveBuffStackEvent,
  ) {
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
      this.ignoreNextRefresh = true;
      const generator = GetRelatedEvent<CastEvent>(event, MAELSTROM_GENERATOR_LINK);
      this._applyBuilder(
        generator?.ability.guid ?? event.ability.guid,
        change,
        0,
        event.timestamp,
        resource,
      );
      this.reduceFeralSpiritCooldown();
    } else {
      const spenderEvent = GetRelatedEvent<CastEvent | FreeCastEvent>(
        event,
        MAELSTROM_WEAPON_SPEND_LINK,
      );
      if (spenderEvent) {
        this._applySpender(spenderEvent, -change, resource);
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
  }

  onRefresh(event: RefreshBuffEvent) {
    if (this.ignoreNextRefresh) {
      this.ignoreNextRefresh = false;
      return;
    }

    if (this.current === 10) {
      const generator = GetRelatedEvent<CastEvent>(event, MAELSTROM_GENERATOR_LINK);
      this._applyBuilder(
        generator?.ability.guid ?? event.ability.guid,
        0,
        1,
        event.timestamp,
        this.getMaelstromResource(event),
      );
      this.reduceFeralSpiritCooldown();
    }
  }

  onFeralSpiritCast() {
    this.outOfOrderCooldownReduction += this.cooldownPerMaelstromGained;
  }

  reduceFeralSpiritCooldown() {
    if (!this.selectedCombatant.hasTalent(TALENTS.WITCH_DOCTORS_ANCESTRY_TALENT)) {
      return;
    }

    if (this.spellUsable.isOnCooldown(TALENTS.FERAL_SPIRIT_TALENT.id)) {
      const effectiveReduction = this.spellUsable.reduceCooldown(
        TALENTS.FERAL_SPIRIT_TALENT.id,
        this.cooldownPerMaelstromGained + this.outOfOrderCooldownReduction,
      );
      this.feralSpiritTotalCooldownReduction += effectiveReduction;
      this.feralSpiritCooldownReductionWasted +=
        this.cooldownPerMaelstromGained - effectiveReduction;
      this.outOfOrderCooldownReduction = 0;
    } else {
      this.feralSpiritCooldownReductionWasted += Math.max(
        this.cooldownPerMaelstromGained - this.outOfOrderCooldownReduction,
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
