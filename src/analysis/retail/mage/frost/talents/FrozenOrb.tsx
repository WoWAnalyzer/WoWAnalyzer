import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvents } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const ICE_CALLER_REDUCTION_MS = 300;

export default class FrozenOrb extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  hasIceCaller: boolean = this.selectedCombatant.hasTalent(TALENTS.ICE_CALLER_TALENT);
  orbCasts: FrozenOrbCast[] = [];

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FROZEN_ORB_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.FROZEN_ORB_TALENT),
      this.onOrbCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLIZZARD_DAMAGE),
      this._reduceCooldown,
    );
  }

  onOrbCast(event: CastEvent) {
    this.log(event);
    const hits: DamageEvent[] = GetRelatedEvents(event, 'SpellDamage');
    this.log(hits);
    const targets: number[] = [];
    hits.forEach((h) => {
      if (!targets.includes(h.targetID)) {
        targets.push(h.targetID);
      }
    });

    this.orbCasts.push({
      ordinal: this.orbCasts.length + 1,
      cast: event,
      ffstacks: this.selectedCombatant.getBuff(SPELLS.FINGERS_OF_FROST_BUFF.id)?.stacks || 0,
      targetsHit: targets.length || 0,
    });
    this.log(this.orbCasts);
  }

  _reduceCooldown() {
    if (!this.hasIceCaller) {
      return;
    }

    if (this.spellUsable.isOnCooldown(TALENTS.FROZEN_ORB_TALENT.id)) {
      this.spellUsable.reduceCooldown(TALENTS.FROZEN_ORB_TALENT.id, ICE_CALLER_REDUCTION_MS);
    }
  }

  get averageTargetsHit() {
    let totalHits = 0;
    this.orbCasts.forEach((o) => (totalHits += o.targetsHit));
    return totalHits / this.orbCasts.length;
  }
}

export interface FrozenOrbCast {
  ordinal: number;
  cast: CastEvent;
  ffstacks: number;
  targetsHit: number;
}
