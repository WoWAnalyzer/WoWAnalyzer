import CLASSIC_SPELLS from 'common/SPELLS/classic';
import { ThresholdStyle, type NumberThreshold } from 'parser/core/ParseResults';
import { AplChecker, build } from 'parser/shared/metrics/apl';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import Events, { AnyEvent, FightEndEvent } from 'parser/core/Events';

export default class AlwaysBeCasting extends CoreAlwaysBeCasting.withDependencies({
  spellUsable: SpellUsable,
}) {
  private aplChecker;

  private lastUptimeStart?: number;

  constructor(options: Options) {
    super(options);

    this.aplChecker = new AplChecker(apl, this.owner.info);

    this.addEventListener(Events.any, this.processAplDowntime);
    this.addEventListener(Events.fightend, this.finalize);
  }

  get downtimeSuggestionThresholds(): NumberThreshold {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.25,
        average: 0.3,
        major: 0.35,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  private processAplDowntime(event: AnyEvent) {
    // the idea here is that we add "uptime" from the point where the APL says "don't cast anything" to the next point where the APL says "cast something"
    const expectedCast = this.aplChecker.expectedCast();

    this.aplChecker.processEvent(event);

    if (expectedCast && this.lastUptimeStart && event.timestamp >= this.owner.fight.start_time) {
      // apl: "cast something"
      if (this.lastUptimeStart !== event.timestamp) {
        this.addNewUptime(this.lastUptimeStart, event.timestamp, false, 'Arms APL-based downtime');
      }
      this.lastUptimeStart = undefined;
    } else if (!expectedCast && !this.lastUptimeStart) {
      // apl: "don't cast anything"
      this.lastUptimeStart = event.timestamp;
    }
  }

  private finalize(event: FightEndEvent) {
    if (this.lastUptimeStart) {
      this.addNewUptime(
        this.lastUptimeStart,
        event.timestamp,
        false,
        'Arms APL-based downtime (finalizer)',
      );
    }
  }
}

const apl = build([
  {
    spell: CLASSIC_SPELLS.REND,
    condition: cnd.debuffMissing(CLASSIC_SPELLS.REND_DEBUFF),
  },
  {
    spell: CLASSIC_SPELLS.COLOSSUS_SMASH,
    condition: cnd.debuffMissing(CLASSIC_SPELLS.COLOSSUS_SMASH),
  },
  CLASSIC_SPELLS.MORTAL_STRIKE,
  {
    spell: CLASSIC_SPELLS.EXECUTE,
    condition: cnd.inExecute(),
  },
  {
    spell: CLASSIC_SPELLS.OVERPOWER,
    condition: cnd.buffPresent(CLASSIC_SPELLS.TASTE_FOR_BLOOD),
  },
  {
    spell: CLASSIC_SPELLS.HEROIC_STRIKE,
    condition: cnd.or(
      cnd.buffPresent(CLASSIC_SPELLS.BATTLE_TRANCE),
      cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: 800 }, 0),
    ),
  },
]);
