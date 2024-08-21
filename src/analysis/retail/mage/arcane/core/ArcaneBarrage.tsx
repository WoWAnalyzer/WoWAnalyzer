import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RefreshBuffEvent,
  GetRelatedEvents,
} from 'parser/core/Events';
import ArcaneChargeTracker from './ArcaneChargeTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const TEMPO_DURATION = 12000;

export default class ArcaneBarrage extends Analyzer {
  static dependencies = {
    arcaneChargeTracker: ArcaneChargeTracker,
    spellUsable: SpellUsable,
  };

  protected arcaneChargeTracker!: ArcaneChargeTracker;
  protected spellUsable!: SpellUsable;

  hasArcaneTempo: boolean = this.selectedCombatant.hasTalent(TALENTS.ARCANE_TEMPO_TALENT);
  hasNetherPrecision: boolean = this.selectedCombatant.hasTalent(TALENTS.NETHER_PRECISION_TALENT);

  barrageCasts: ArcaneBarrageCast[] = [];
  lastTempoApply: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_TEMPO_BUFF),
      this.onTempo,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_TEMPO_BUFF),
      this.onTempo,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_TEMPO_BUFF),
      this.onTempo,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_BARRAGE),
      this.onBarrage,
    );
  }

  onTempo(event: ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent) {
    this.lastTempoApply = event.timestamp;
  }

  onBarrage(event: CastEvent) {
    const hasTempo = this.selectedCombatant.hasBuff(SPELLS.ARCANE_TEMPO_BUFF.id);
    const netherPrecision = this.selectedCombatant.getBuff(SPELLS.NETHER_PRECISION_BUFF.id);
    const touchCD = this.spellUsable.cooldownRemaining(TALENTS.TOUCH_OF_THE_MAGI_TALENT.id);
    const evocationCD = this.spellUsable.cooldownRemaining(TALENTS.EVOCATION_TALENT.id);
    const charges = this.arcaneChargeTracker.current;
    const targetsHit = GetRelatedEvents(event, 'SpellDamage').length;
    const resource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.MANA.id,
    );
    const manaPercent = resource && resource.amount / resource.max;

    this.barrageCasts.push({
      ordinal: this.barrageCasts.length + 1,
      cast: event,
      tempoRemaining: hasTempo
        ? TEMPO_DURATION - (event.timestamp - this.lastTempoApply)
        : undefined,
      netherPrecisionStacks: netherPrecision ? netherPrecision.stacks : undefined,
      touchCD: touchCD || 0,
      evocationCD: evocationCD || 0,
      clearcasting: this.selectedCombatant.hasBuff(
        SPELLS.CLEARCASTING_ARCANE.id,
        event.timestamp - 10,
      ),
      arcaneOrbAvail: this.spellUsable.isAvailable(SPELLS.ARCANE_ORB.id),
      charges,
      targetsHit: targetsHit || 0,
      mana: manaPercent,
    });

    this.arcaneChargeTracker.clearCharges(event);
  }
}

export interface ArcaneBarrageCast {
  ordinal: number;
  cast: CastEvent;
  tempoRemaining?: number;
  netherPrecisionStacks?: number;
  touchCD: number;
  evocationCD: number;
  clearcasting: boolean;
  arcaneOrbAvail: boolean;
  charges: number;
  targetsHit: number;
  mana?: number;
}
