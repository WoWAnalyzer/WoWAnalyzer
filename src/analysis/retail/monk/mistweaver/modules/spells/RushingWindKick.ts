import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { getRWKHitsPerCast } from '../../normalizers/CastLinkNormalizer';

class RushingWindKick extends Analyzer {
  healing = 0;
  overhealing = 0;
  hits = 0;
  casts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RUSHING_WIND_KICK_HEAL),
      this.onHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT),
      this.onCast,
    );
  }

  get avgTargetsHit() {
    return this.casts > 0 ? this.hits / this.casts : 0;
  }

  private onCast(event: CastEvent) {
    const rwkHits = getRWKHitsPerCast(event);
    this.casts += 1;
    this.hits += rwkHits.length || 0;
  }
  private onHeal(event: HealEvent) {
    this.overhealing += event.overheal || 0;
    this.healing += event.amount + (event.absorbed || 0);
  }
}

export default RushingWindKick;
