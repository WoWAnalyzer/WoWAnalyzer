import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import Events, { CastEvent, GetRelatedEvents } from 'parser/core/Events';
import ArcaneChargeTracker from '../core/ArcaneChargeTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';

export default class PresenceOfMind extends Analyzer {
  static dependencies = {
    chargeTracker: ArcaneChargeTracker,
    spellUsable: SpellUsable,
  };

  protected chargeTracker!: ArcaneChargeTracker;
  protected spellUsable!: SpellUsable;

  pomData: PresenceOfMindData[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PRESENCE_OF_MIND_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.PRESENCE_OF_MIND_TALENT),
      this.onPresenceMind,
    );
  }

  onPresenceMind(event: CastEvent) {
    this.pomData.push({
      cast: event,
      charges: this.chargeTracker.current,
      stacksUsed: this.getBuffedCastCount(event),
      orbCharges: this.spellUsable.chargesAvailable(TALENTS.ARCANE_ORB_TALENT.id),
      orbCD: this.spellUsable.cooldownRemaining(TALENTS.ARCANE_ORB_TALENT.id),
      clearcasting: this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_ARCANE),
    });
  }

  private getBuffedCastCount(event: CastEvent): number {
    const blasts: CastEvent[] | undefined = GetRelatedEvents(event, 'consume');
    const buffedCasts = blasts.filter((b) =>
      this.selectedCombatant.hasBuff(TALENTS.PRESENCE_OF_MIND_TALENT.id, b.timestamp),
    );
    return buffedCasts.length || 0;
  }
}

export interface PresenceOfMindData {
  cast: CastEvent;
  targets?: number;
  charges: number;
  stacksUsed: number;
  orbCharges: number;
  orbCD: number;
  clearcasting: boolean;
}
