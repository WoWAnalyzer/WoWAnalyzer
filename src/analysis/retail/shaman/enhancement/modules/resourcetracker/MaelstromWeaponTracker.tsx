import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { RefreshBuffEvent, ChangeBuffStackEvent, EventType } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

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

class MaelstromWeaponTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
    spellUsable: SpellUsable,
  };

  cooldownPerMaelstromGained = 0;
  feralSpiritTotalCooldownReduction = 0;
  feralSpiritCooldownReductionWasted = 0;
  outOfOrderCooldownReduction = 0;

  spellUsable!: SpellUsable;

  nextRefreshIsWaste = false;
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
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.onRefresh,
    );
    this.addEventListener(
      Events.changebuffstack.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.onStacksChange,
    );

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

  onStacksChange(event: ChangeBuffStackEvent) {
    if (event.stacksGained > 0) {
      this._applyBuilder(
        event.ability.guid,
        event.stacksGained,
        0,
        event.timestamp,
        this.getMaelstromResource(event),
      );
      if (this.current === 10) {
        this.nextRefreshIsWaste = true;
      }
      this.reduceFeralSpiritCooldown();
    } else {
      this.nextRefreshIsWaste = false;
      this._applySpender(event, -event.stacksGained, this.getMaelstromResource(event));
    }
  }

  onRefresh(event: RefreshBuffEvent) {
    if (this.nextRefreshIsWaste) {
      this.nextRefreshIsWaste = false;
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

export default MaelstromWeaponTracker;
