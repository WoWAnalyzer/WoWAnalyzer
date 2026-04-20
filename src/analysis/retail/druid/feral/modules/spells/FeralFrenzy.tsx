import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ComboPointTracker from 'analysis/retail/druid/feral/modules/core/combopoints/ComboPointTracker';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import Enemies from 'parser/shared/modules/Enemies';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { getLowestPerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { PassFailCheckmark, PerformanceMark } from 'interface/guide';
import EnergyTracker from 'analysis/retail/druid/feral/modules/core/energy/EnergyTracker';
import { getDamageHits } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { formatNumber } from 'common/format';

/**
 * **Feral Frenzy**
 * Spec Talent
 *
 * Unleash a furious frenzy, clawing your target 5 times for X Physical damage and
 * an additional X Bleed damage over 6 sec. Awards 5 combo points.
 */
export default class FeralFrenzy extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
    energyTracker: EnergyTracker,
    enemies: Enemies,
  };

  protected comboPointTracker!: ComboPointTracker;
  protected energyTracker!: EnergyTracker;
  protected enemies!: Enemies;
  isFrantic = false;
  isFocused = false;

  /** Tracker for each Feral Frenzy cast */
  ffTrackers: FeralFrenzyCast[] = [];
  /** Total damage dealt by Feral/Frantic Frenzy (all hits + bleed) */
  totalDamage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.FERAL_FRENZY_TALENT);
    this.isFrantic = this.selectedCombatant.hasTalent(TALENTS_DRUID.FRANTIC_FRENZY_TALENT);
    this.isFocused = this.selectedCombatant.hasTalent(TALENTS_DRUID.FOCUSED_FRENZY_TALENT);

    const damageSpell = this.isFrantic ? SPELLS.FRANTIC_FRENZY_DEBUFF : SPELLS.FERAL_FRENZY_DEBUFF;
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(damageSpell), this.onFfDamage);

    if (!this.isFrantic) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DRUID.FERAL_FRENZY_TALENT),
        this.onCastFf,
      );
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DRUID.FRANTIC_FRENZY_TALENT),
      this.onCastFf,
    );
  }

  onFfDamage(event: DamageEvent) {
    const amount = event.amount + (event.absorbed || 0);
    this.totalDamage += amount;

    const currentCast = this.ffTrackers[this.ffTrackers.length - 1];
    if (!currentCast) {
      // bleed tick from a cast that happened before fight start — not attributable
      return;
    }
    currentCast.damage += amount;

    const enemy = this.enemies.getEntity(event);
    const name = enemy?.name ?? 'Unknown';
    const key = `${event.targetID}.${event.targetInstance ?? 0}`;
    const existing = currentCast.damageByEnemy.get(key);
    if (existing) {
      existing.damage += amount;
    } else {
      currentCast.damageByEnemy.set(key, { name, damage: amount });
    }
  }

  onCastFf(event: CastEvent) {
    const tfOnCast = this.selectedCombatant.hasBuff(SPELLS.TIGERS_FURY.id);
    const cpsOnCast = this.comboPointTracker.current;
    const energyOnCast = this.energyTracker.current;
    const isFrantic = this.isFrantic;
    const damageEvents = getDamageHits(event);
    const hitCount = new Set(damageEvents.map((e) => e.targetID)).size;
    this.ffTrackers.push({
      timestamp: event.timestamp,
      tfOnCast,
      cpsOnCast,
      energyOnCast,
      isFrantic,
      hitCount,
      damage: 0,
      damageByEnemy: new Map(),
    });
  }

  get talent() {
    if (this.isFrantic) {
      return TALENTS_DRUID.FRANTIC_FRENZY_TALENT;
    }
    return TALENTS_DRUID.FERAL_FRENZY_TALENT;
  }

  /** Guide fragment showing a breakdown of each Feral Frenzy cast */
  get guideCastBreakdown() {
    const talent = this.talent;

    const explanation = (
      <div>
        <p>
          <strong>
            <SpellLink spell={talent} />
          </strong>{' '}
          is a brief but extremely powerful bleed. Use it on cooldown. As it gives 5 combo points,
          it's best used at 2 or fewer combo points in order not to waste them.
          {this.isFrantic &&
            ' Should be used within as large of packs as possible for you to gain the most benefit out of it.'}
        </p>
        {this.isFocused && (
          <p>
            {' '}
            With <SpellLink spell={TALENTS_DRUID.FOCUSED_FRENZY_TALENT} />, always use it during{' '}
            <SpellLink spell={SPELLS.TIGERS_FURY} />.
          </p>
        )}
      </div>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.ffTrackers.map((cast, ix) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash; <SpellLink spell={talent} />
            </>
          );

          let cpsPerf = QualitativePerformance.Good;
          if (cast.cpsOnCast > 4) {
            cpsPerf = QualitativePerformance.Fail;
          } else if (cast.cpsOnCast > 2) {
            cpsPerf = QualitativePerformance.Ok;
          }

          let overallPerf = QualitativePerformance.Good;
          overallPerf = getLowestPerf([overallPerf, cpsPerf]);

          const checklistItems: CooldownExpandableItem[] = [];

          if (this.isFocused) {
            checklistItems.push({
              label: (
                <>
                  <SpellLink spell={SPELLS.TIGERS_FURY} /> active
                </>
              ),
              result: <PassFailCheckmark pass={cast.tfOnCast} />,
            });
            if (!cast.tfOnCast) {
              overallPerf = QualitativePerformance.Fail;
            }
          }

          checklistItems.push({
            label: 'Combo Points on cast',
            result: <PerformanceMark perf={cpsPerf} />,
            details: (
              <>
                ({cast.cpsOnCast} CPs)
                {this.isFrantic && <> ({cast.hitCount} Targets hit)</>}
              </>
            ),
          });

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={overallPerf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        wide
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Total damage dealt by <SpellLink spell={this.talent} /> (initial hits + bleed).
          </>
        }
        dropdown={this.castBreakdownTable}
      >
        <BoringSpellValueText spell={this.talent}>
          <ItemPercentDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get castBreakdownTable() {
    return (
      <table className="table table-condensed">
        <thead>
          <tr>
            <th>Cast #</th>
            <th>Time</th>
            <th>Damage</th>
            <th>Enemies Hit</th>
          </tr>
        </thead>
        <tbody>
          {this.ffTrackers.map((cast, index) => (
            <tr key={index}>
              <th scope="row">{index + 1}</th>
              <td>{this.owner.formatTimestamp(cast.timestamp)}</td>
              <td>{formatNumber(cast.damage)}</td>
              <td>
                {Array.from(
                  Array.from(cast.damageByEnemy.values())
                    .reduce((acc, { name, damage }) => {
                      const existing = acc.get(name);
                      if (existing) {
                        existing.count += 1;
                        existing.damage += damage;
                      } else {
                        acc.set(name, { count: 1, damage });
                      }
                      return acc;
                    }, new Map<string, { count: number; damage: number }>())
                    .entries(),
                )
                  .sort(([, a], [, b]) => b.damage - a.damage)
                  .map(([name, { count, damage }], i) => (
                    <div key={i}>
                      {name}
                      {count > 1 && `(${count})`} — {formatNumber(damage)}
                    </div>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

interface FeralFrenzyCast {
  timestamp: number;
  tfOnCast: boolean;
  cpsOnCast: number;
  energyOnCast: number;
  isFrantic: boolean; // Feral Frenzy can be upgraded to Frantic Frenzy now
  hitCount: number; // The ability becomes AoE. This greatly changes the effeciency values.
  /** Total damage (all hits + bleed ticks) attributed to this cast */
  damage: number;
  /** Damage broken down per enemy, keyed by `${targetID}.${targetInstance}` */
  damageByEnemy: Map<string, { name: string; damage: number }>;
}
