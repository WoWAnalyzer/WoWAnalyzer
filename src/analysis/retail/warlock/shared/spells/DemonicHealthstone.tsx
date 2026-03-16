import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent, DeathEvent, AnyEvent } from 'parser/core/Events';
import { SpellUse, ChecklistUsageInfo } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import TALENTS from 'common/TALENTS/warlock';

interface HealthstoneCast {
  event: HealEvent;
  amount: number;
  overheal: number;
  soulburnUsed: boolean;
}

class DemonicHealthstone extends Analyzer {
  casts: HealthstoneCast[] = [];
  deaths: DeathEvent[] = [];
  startingCharges: number;
  private soulburnActive = false;

  constructor(options: Options, startingCharges = 3) {
    super(options);
    this.startingCharges = startingCharges;

    // Track actual Healthstone heals
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.DEMONIC_HEALTHSTONE),
      this.onHeal,
    );

    // Track deaths
    this.addEventListener(Events.death.by(SELECTED_PLAYER), this.onDeath);

    // Track Soulburn usage
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SOULBURN_TALENT), () => {
      this.soulburnActive = true;
    });
  }

  private onHeal = (event: HealEvent) => {
    this.casts.push({
      event,
      amount: event.amount || 0,
      overheal: event.overheal || 0,
      soulburnUsed: this.soulburnActive,
    });
    // Reset Soulburn after using a Healthstone
    this.soulburnActive = false;
  };

  private onDeath(event: DeathEvent) {
    this.deaths.push(event);
  }

  getSpellUsesWithPotentialMisses(fightStart: number, fightEnd: number): SpellUse[] {
    const uses: SpellUse[] = [];
    let charges = this.startingCharges;
    const sortedCasts = [...this.casts].sort((a, b) => a.event.timestamp - b.event.timestamp);
    let castIndex = 0;
    let currentTime = fightStart;

    while (currentTime < fightEnd) {
      const intervalStart = currentTime;
      const intervalEnd = Math.min(currentTime + 60 * 1000, fightEnd);

      // Skip dead intervals
      if (this.deaths.some((d) => d.timestamp >= intervalStart && d.timestamp < intervalEnd)) {
        currentTime = intervalEnd;
        continue;
      }

      // Check for actual cast in this interval
      let castThisInterval: HealthstoneCast | undefined = undefined;
      while (
        castIndex < sortedCasts.length &&
        sortedCasts[castIndex].event.timestamp >= intervalStart &&
        sortedCasts[castIndex].event.timestamp < intervalEnd
      ) {
        castThisInterval = sortedCasts[castIndex];
        castIndex++;
        charges--;
      }

      if (castThisInterval) {
        uses.push(this.explainPerformance(castThisInterval, fightStart));
        currentTime = castThisInterval.event.timestamp + 60 * 1000; // next interval starts after cast
      } else if (charges > 0) {
        // Potential missed use
        const intervalStartRel = intervalStart - fightStart;
        const intervalEndRel = intervalEnd - fightStart;

        const checklistItems: ChecklistUsageInfo[] = [
          {
            check: 'missed',
            timestamp: intervalEnd,
            performance: QualitativePerformance.Ok,
            summary: (
              <span>
                Healthstone went unused during {Math.floor(intervalStartRel / 60000)}:
                {String(Math.floor((intervalStartRel % 60000) / 1000)).padStart(2, '0')} –{' '}
                {Math.floor(intervalEndRel / 60000)}:
                {String(Math.floor((intervalEndRel % 60000) / 1000)).padStart(2, '0')}
              </span>
            ),
            details: (
              <span>
                A Healthstone charge was available but not used. Using Soulburn with Healthstone
                increases the amount healed by 30% and increases your max health for a short
                duration.
              </span>
            ),
          },
        ];

        uses.push({
          event: { timestamp: intervalEnd } as unknown as AnyEvent,
          performance: QualitativePerformance.Ok,
          checklistItems,
          performanceExplanation: 'Potential use missed',
        });

        charges--;
        currentTime = intervalEnd;
      } else {
        charges = 3; // refresh charges
        currentTime = intervalEnd;
      }
    }

    return uses;
  }

  private explainPerformance(cast: HealthstoneCast, fightStart: number): SpellUse {
    const performance = cast.soulburnUsed
      ? QualitativePerformance.Perfect
      : QualitativePerformance.Good;

    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'used',
        timestamp: cast.event.timestamp,
        performance,
        summary: cast.soulburnUsed ? (
          <>Used Healthstone with Soulburn</>
        ) : (
          <>Used Healthstone without Soulburn</>
        ),
        details: cast.soulburnUsed ? (
          <>You used Soulburn with this Healthstone, maximizing the heal.</>
        ) : (
          <>
            Healthstone used without Soulburn. Using Soulburn with Healthstone increases the amount
            healed by 30% and increases your max health for a short duration.
          </>
        ),
      },
    ];

    // Use fightStart to calculate relative time
    const fightTimeMs = cast.event.timestamp - fightStart;
    const minutes = Math.floor(fightTimeMs / 60000);
    const seconds = Math.floor((fightTimeMs % 60000) / 1000);

    return {
      event: cast.event as unknown as AnyEvent,
      performance,
      checklistItems,
      performanceExplanation: `Healed at ${minutes}:${String(seconds).padStart(2, '0')}`,
      extraDetails: `${cast.amount} healed (${cast.overheal} overheal)`,
    };
  }
}

export default DemonicHealthstone;
