import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import StaggerFabricator from '../core/StaggerFabricator';

const QUICK_SIP_RATE = 0.01 / 3;
const DAMAGE_BUFFER = 150; // for SCK to break this, you need over 150% haste. good luck.

const SHUFFLE_DURATION = {
  [SPELLS.BLACKOUT_KICK_BRM.id]: 3,
  [talents.KEG_SMASH_TALENT.id]: 5,
  [SPELLS.SPINNING_CRANE_KICK_BRM.id]: 1,
};

export default class QuickSip extends Analyzer {
  static dependencies = {
    staggerFab: StaggerFabricator,
  };

  protected staggerFab!: StaggerFabricator;
  protected rank: number;

  constructor(options: Options) {
    super(options);

    this.rank = this.selectedCombatant.getTalentRank(talents.QUICK_SIP_TALENT);
    this.active = this.rank > 0;

    // we can't see total duration from buff events, so we use applicators for this
    // - Blackout Kick: 3s per cast
    // - Keg Smash: 5s per cast
    // - SCK: 1s per tick that hits at least one enemy
    this.addEventListener(
      Events.damage.spell([
        talents.KEG_SMASH_TALENT,
        SPELLS.SPINNING_CRANE_KICK_BRM,
        SPELLS.BLACKOUT_KICK_BRM,
      ]),
      this.onDamage,
    );
  }

  private lastDamageBySpellId = new Map<number, number>();
  private isFirstHit(event: DamageEvent) {
    const abilityId = event.ability.guid;
    const lastHitTimestamp = this.lastDamageBySpellId.get(abilityId);

    if (!lastHitTimestamp || event.timestamp - lastHitTimestamp > DAMAGE_BUFFER) {
      return true;
    }
    return false;
  }

  private recordHit(event: DamageEvent) {
    this.lastDamageBySpellId.set(event.ability.guid, event.timestamp);
  }

  private onDamage(event: DamageEvent) {
    if (this.isFirstHit(event)) {
      const pct = SHUFFLE_DURATION[event.ability.guid] * this.rank * QUICK_SIP_RATE;
      const amount = this.staggerFab.staggerPool * pct;

      this.staggerFab.removeStagger(event, amount);
    }

    this.recordHit(event);
  }
}
