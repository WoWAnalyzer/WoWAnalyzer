import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, GetRelatedEvents } from 'parser/core/Events';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
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

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TOUCH_OF_THE_MAGI_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_BARRAGE),
      this.onBarrage,
    );
  }

  onBarrage(event: CastEvent) {
    const tempo = this.selectedCombatant.getBuff(SPELLS.ARCANE_TEMPO_BUFF.id);
    const netherPrecision = this.selectedCombatant.getBuff(SPELLS.NETHER_PRECISION_BUFF.id);
    const touchCD = this.spellUsable.cooldownRemaining(TALENTS.TOUCH_OF_THE_MAGI_TALENT.id);
    const evocationCD = this.spellUsable.cooldownRemaining(TALENTS.EVOCATION_TALENT.id);
    const charges = this.arcaneChargeTracker.charges;
    const targetsHit = GetRelatedEvents(event, 'SpellDamage').length;
    const resource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.MANA.id,
    );
    const manaPercent = resource && resource.amount / resource.max;

    let tempoRemaining;
    if (tempo && tempo.refreshHistory.length !== 0) {
      tempoRemaining =
        tempo.refreshHistory[tempo.refreshHistory.length - 1] + TEMPO_DURATION - event.timestamp;
    } else if (tempo && tempo.end) {
      tempoRemaining = tempo.end - event.timestamp;
    } else if (tempo) {
      tempoRemaining = tempo.start + TEMPO_DURATION - event.timestamp;
    }

    this.barrageCasts.push({
      ordinal: this.barrageCasts.length + 1,
      cast: event.timestamp,
      tempoRemaining,
      netherPrecisionStacks:
        this.hasNetherPrecision && netherPrecision ? netherPrecision.stacks : undefined,
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
  }
}

export interface ArcaneBarrageCast {
  ordinal: number;
  cast: number;
  tempoRemaining?: number;
  netherPrecisionStacks?: number;
  touchCD: number;
  evocationCD: number;
  clearcasting: boolean;
  arcaneOrbAvail: boolean;
  charges: number;
  targetsHit: number;
  mana?: number;
  usage?: BoxRowEntry;
}
