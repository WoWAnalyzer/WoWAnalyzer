import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { CastEvent, GetRelatedEvents, HealEvent } from 'parser/core/Events';
import RunicPowerTracker from '../../runicpower/RunicPowerTracker';
import { DEATH_STRIKE_HEAL } from './normalizer';

export enum DeathStrikeReason {
  /** A cast that does a good amount of healing. */
  GoodHealing,
  /** A cast while at low health. May not do much healing. */
  LowHealth,
  /** A cast that generates a blood shield that prevents death. */
  BloodShield,
  /** A cast that dumps runic power to avoid capping. */
  DumpRP,
  /** Any other cast type. */
  Other,
}

const GOOD_HIT_THRESHOLD = 0.2;
const LOW_HP_THRESHOLD = 0.5; // BDK gets a pretty high low hp threshold because of low mitigation.
// 1 rp = 10 in the event.
const DUMP_RP_THRESHOLD = 850;

type CastReason = {
  reason: DeathStrikeReason;
  cast: CastEvent;
};

export default class DeathStrike extends Analyzer {
  static dependencies = {
    rp: RunicPowerTracker,
  };

  protected rp!: RunicPowerTracker;

  readonly casts: CastReason[] = [];

  private _totalHealing: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.spell(talents.DEATH_STRIKE_TALENT), this.onCast);

    this.addEventListener(Events.heal.spell(SPELLS.DEATH_STRIKE_HEAL), this.recordHeal);
  }

  get totalHealing(): number {
    return this._totalHealing;
  }

  private recordHeal(event: HealEvent) {
    this._totalHealing += event.amount + (event.absorbed ?? 0);
  }

  private onCast(event: CastEvent) {
    const healEvent = GetRelatedEvents(event, DEATH_STRIKE_HEAL)?.[0] as HealEvent | undefined;

    if (healEvent) {
      // good healing means at least 40% hp. totally made up
      const healingPct = healEvent.amount / healEvent.maxHitPoints;
      const initialHpPct = (healEvent.hitPoints - healEvent.amount) / healEvent.maxHitPoints;

      if (healingPct >= GOOD_HIT_THRESHOLD) {
        this.casts.push({
          reason: DeathStrikeReason.GoodHealing,
          cast: event,
        });
      } else if (initialHpPct <= LOW_HP_THRESHOLD) {
        this.casts.push({
          reason: DeathStrikeReason.LowHealth,
          cast: event,
        });
      } else if ((this.rp.getResource(event)?.amount ?? 0) >= DUMP_RP_THRESHOLD) {
        this.casts.push({
          reason: DeathStrikeReason.DumpRP,
          cast: event,
        });
      } else {
        // TODO: blood shield generation?
        this.casts.push({
          reason: DeathStrikeReason.Other,
          cast: event,
        });
      }
    } else {
      // other for this. don't understand it
      this.casts.push({
        reason: DeathStrikeReason.Other,
        cast: event,
      });
    }
  }
}
