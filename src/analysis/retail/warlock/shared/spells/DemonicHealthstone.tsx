import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent, DeathEvent, AnyEvent } from 'parser/core/Events';
import { SpellUse, ChecklistUsageInfo } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import TALENTS from 'common/TALENTS/warlock';
import { formatNumber } from 'common/format';

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

  get totalUses(): number {
    return this.casts.length;
  }

  getSpellUsesWithPotentialMisses(fightStart: number, fightEnd: number): SpellUse[] {
    const uses: SpellUse[] = [];

    const sortedCasts = [...this.casts].sort((a, b) => a.event.timestamp - b.event.timestamp);

    // Add actual casts
    for (const cast of sortedCasts) {
      uses.push(this.explainPerformance(cast, fightStart));
    }

    // Estimate possible uses
    const fightDuration = fightEnd - fightStart;
    const possibleUses = Math.floor(fightDuration / 60000);

    const actualUses = sortedCasts.length;
    const missingUses = possibleUses - actualUses;

    if (missingUses <= 0) {
      return uses;
    }

    for (let i = 0; i < missingUses; i++) {
      const performance = QualitativePerformance.Ok;

      const checklistItems: ChecklistUsageInfo[] = [
        {
          check: 'missed',
          timestamp: fightEnd,
          performance,
          summary: <span>Healthstone was not used</span>,
          details: (
            <span>
              Demonic Healthstone is a powerful defensive tool. Holding it for too long or not using
              all available charges can result in missed survivability.
            </span>
          ),
        },
      ];

      uses.push({
        event: { timestamp: fightEnd } as unknown as AnyEvent,
        performance,
        checklistItems,
        performanceExplanation: 'Missed potential use',
      });
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

    const fightTimeMs = cast.event.timestamp - fightStart;
    const minutes = Math.floor(fightTimeMs / 60000);
    const seconds = Math.floor((fightTimeMs % 60000) / 1000);

    return {
      event: cast.event as unknown as AnyEvent,
      performance,
      checklistItems,
      performanceExplanation: `Healed at ${minutes}:${String(seconds).padStart(2, '0')}`,
      extraDetails: `${formatNumber(cast.amount)} healed (${formatNumber(cast.overheal)} overheal)`,
    };
  }
}

export default DemonicHealthstone;
