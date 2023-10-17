import Events, { ApplyBuffEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import { isArmorMitigated } from 'parser/retail/modules/isArmorMitigated';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Enemies from 'parser/shared/modules/Enemies';
import { shouldIgnore } from 'parser/shared/modules/hit-tracking/utilities';
import { TrackedHit } from 'interface/guide/components/DamageTakenPointChart';
import { Uptime } from 'parser/ui/UptimeBar';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

export type IronfurTrackedHit = TrackedHit & { stacks: number };

export default class Ironfur extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  hits: IronfurTrackedHit[] = [];
  uptime: Uptime[] = [];

  totalHits: number = 0;
  coveredHits: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.IRONFUR),
      this.onIronfurApply,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.IRONFUR),
      this.onIronfurRemove,
    );
    this.addEventListener(Events.fightend, this.finalize);
  }

  private onIronfurApply(event: ApplyBuffEvent) {
    const uptime: Uptime = {
      start: event.timestamp,
      end: event.timestamp,
    };

    this.uptime.push(uptime);
  }

  private onIronfurRemove(event: RemoveBuffEvent) {
    let uptime = this.uptime[this.uptime.length - 1];
    if (!uptime) {
      uptime = {
        start: this.owner.fight.start_time,
        end: event.timestamp,
      };

      this.uptime.push(uptime);
    } else {
      uptime.end = event.timestamp;
    }
  }

  private finalize() {
    const uptime = this.uptime[this.uptime.length - 1];
    if (!uptime || uptime.end !== uptime.start) {
      return;
    }

    uptime.end = this.owner.fight.end_time;
  }

  onDamageTaken(event: DamageEvent) {
    // No direct way to determine which damage events are mitigated by armor, but 99% of the time
    // it's "physical, not periodic". Will add a blacklist/whitelist if needed for special cases.
    // Hits that do 0 damage are typically a dodge, which should also not be counted here.
    const damage = event.amount + (event.absorbed || 0);
    if (damage !== 0 && isArmorMitigated(event) && !shouldIgnore(this.enemies, event)) {
      const stacks = this.selectedCombatant.getBuffStacks(SPELLS.IRONFUR.id);

      this.totalHits += 1;
      if (stacks > 0) {
        this.coveredHits += 1;
      }

      let mitigated = QualitativePerformance.Fail;
      if (stacks === 1) {
        mitigated = QualitativePerformance.Good;
      } else if (stacks > 1) {
        mitigated = QualitativePerformance.Perfect;
      }

      this.hits.push({
        event,
        mitigated,
        stacks,
      });
    }
  }

  // TODO recreate statistic

  // get hitsMitigated() {
  //   return this._hitsPerStack.slice(1).reduce((sum, x) => sum + x, 0);
  // }
  //
  // get hitsUnmitigated() {
  //   return this._hitsPerStack[0] || 0;
  // }
  //
  // get ironfurStacksApplied() {
  //   return this._hitsPerStack.reduce((sum, x, i) => sum + x * i, 0);
  // }
  //
  // get totalHitsTaken() {
  //   return this._hitsPerStack.reduce((sum, x) => sum + x, 0);
  // }
  //
  // get overallIronfurUptime() {
  //   // Avoid NaN display errors
  //   if (this.totalHitsTaken === 0) {
  //     return 0;
  //   }
  //
  //   return this.ironfurStacksApplied / this.totalHitsTaken;
  // }
  //
  // get suggestionThresholds() {
  //   return {
  //     actual: this.overallIronfurUptime,
  //     isLessThan: {
  //       minor: 0.9,
  //       average: 0.8,
  //       major: 0.7,
  //     },
  //     style: ThresholdStyle.PERCENTAGE,
  //   };
  // }
  //
  // get percentOfHitsMitigated() {
  //   if (this.totalHitsTaken === 0) {
  //     return 0;
  //   }
  //   return this.hitsMitigated / this.totalHitsTaken;
  // }
  //
  // _hitsPerStack = [];
  //
  // constructor(options) {
  //   super(options);
  //   this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  //   this.addEventListener(Events.fightend, this.onFightEnd);
  // }
  //
  // registerHit(stackCount) {
  //   if (!this._hitsPerStack[stackCount]) {
  //     this._hitsPerStack[stackCount] = 0;
  //   }
  //
  //   this._hitsPerStack[stackCount] += 1;
  // }
  //
  // onDamageTaken(event) {
  //   // Physical
  //   if (event.ability.type === SCHOOLS.ids.PHYSICAL) {
  //     const ironfur = this.selectedCombatant.getBuff(SPELLS.IRONFUR.id);
  //     this.registerHit(ironfur ? ironfur.stacks : 0);
  //   }
  // }
  //
  // computeIronfurUptimeArray() {
  //   return this._hitsPerStack.map((hits) => hits / this.totalHitsTaken);
  // }
  //
  // onFightEnd() {
  //   if (debug) {
  //     console.log(`Hits with ironfur ${this.hitsMitigated}`);
  //     console.log(`Hits without ironfur ${this.hitsUnmitigated}`);
  //     console.log('Ironfur uptimes:', this.computeIronfurUptimeArray());
  //   }
  // }
  //
  // suggestions(when) {
  //   when(this.percentOfHitsMitigated)
  //     .isLessThan(0.9)
  //     .addSuggestion((suggest, actual, recommended) =>
  //       suggest(
  //         <span>
  //           You only had the <SpellLink spell={SPELLS.IRONFUR.id} /> buff for{' '}
  //           {formatPercentage(actual)}% of physical damage taken. You should have the Ironfur buff
  //           up to mitigate as much physical damage as possible.
  //         </span>,
  //       )
  //         .icon(SPELLS.IRONFUR.icon)
  //         .actual(
  //           t({
  //             id: 'druid.guardian.suggestions.ironfur.uptime',
  //             message: `${formatPercentage(actual)}% was mitigated by Ironfur`,
  //           }),
  //         )
  //         .recommended(`${Math.round(formatPercentage(recommended))}% or more is recommended`)
  //         .regular(recommended - 0.1)
  //         .major(recommended - 0.2),
  //     );
  // }
  //
  // statistic() {
  //   const totalIronFurTime = this.selectedCombatant.getBuffUptime(SPELLS.IRONFUR.id);
  //   const uptimes = this.computeIronfurUptimeArray().reduce(
  //     (str, uptime, stackCount) => (
  //       <>
  //         {str}
  //         <li>
  //           {stackCount} stack{stackCount !== 1 ? 's' : ''}: {formatPercentage(uptime)}%
  //         </li>
  //       </>
  //     ),
  //     null,
  //   );
  //
  //   return (
  //     <Statistic
  //       position={STATISTIC_ORDER.CORE(10)}
  //       size="flexible"
  //       tooltip={
  //         <>
  //           Ironfur usage breakdown:
  //           <ul>
  //             <li>
  //               You were hit <strong>{this.hitsMitigated}</strong> times with your Ironfur buff.
  //             </li>
  //             <li>
  //               You were hit <strong>{this.hitsUnmitigated}</strong> times{' '}
  //               <strong>
  //                 <em>without</em>
  //               </strong>{' '}
  //               your Ironfur buff.
  //             </li>
  //           </ul>
  //           <strong>Uptimes per stack: </strong>
  //           <ul>{uptimes}</ul>
  //           <strong>{formatPercentage(this.percentOfHitsMitigated)}%</strong> of physical attacks
  //           were mitigated with Ironfur, and your overall uptime was{' '}
  //           <strong>{formatPercentage(totalIronFurTime / this.owner.fightDuration)}%</strong>.
  //         </>
  //       }
  //     >
  //       <BoringValueText
  //         label={
  //           <>
  //             <SpellIcon id={SPELLS.IRONFUR.id} /> Hits mitigated with Ironfur / Average Stacks{' '}
  //           </>
  //         }
  //       >
  //         {`${formatPercentage(this.percentOfHitsMitigated)}%`}
  //       </BoringValueText>
  //     </Statistic>
  //   );
  // }
}
