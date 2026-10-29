import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  AnyEvent,
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  FightEndEvent,
  GetRelatedEvents,
  RefreshBuffEvent,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { SpellLink } from 'interface';
import {
  binomialCDF,
  binomialPMF,
  plotOneVariableBinomChart,
} from 'parser/shared/modules/helpers/Probability';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import {
  GRAND_CRUSADER_AVOIDANCE_HIT_TYPES,
  GRAND_CRUSADER_FROM_AVOIDANCE,
  GRAND_CRUSADER_FROM_HAMMER,
  GRAND_CRUSADER_FROM_HOLY_BULWARK,
  GRAND_CRUSADER_FROM_SACRED_WEAPON,
  GRAND_CRUSADER_HAMMERS,
} from '../../normalizers/GrandCrusaderLinkNormalizer';

const BASE_PROC_CHANCE = 0.15;
const CRUSADERS_JUDGMENT_CDR = 3000;

export type GrandCrusaderSource = 'hammer' | 'avoidance' | 'holyBulwark' | 'sacredWeapon' | 'other';

export interface GrandCrusaderReset {
  timestamp: number;
  source: GrandCrusaderSource;
}

class GrandCrusader extends Analyzer.withDependencies({
  abilities: Abilities,
  spellUsable: SpellUsable,
}) {
  resetChances = 0;
  hammerChances = 0;
  avoidanceChances = 0;
  resets: GrandCrusaderReset[] = [];
  procChance = BASE_PROC_CHANCE;
  cooldownReduction = 0;

  private processedTriggers = new WeakSet<AnyEvent>();
  private pendingResets = new Map<AnyEvent, GrandCrusaderReset[]>();

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.GRAND_CRUSADER_TALENT);
    if (this.selectedCombatant.hasTalent(TALENTS.CRUSADERS_JUDGMENT_TALENT)) {
      this.cooldownReduction = CRUSADERS_JUDGMENT_CDR;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(GRAND_CRUSADER_HAMMERS),
      this.onHammerCast,
    );
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.HOLY_BULWARK_ABSORB),
      this.onHolyBulwark,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GRAND_CRUSADER_BUFF),
      this.onProc,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.GRAND_CRUSADER_BUFF),
      this.onProc,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  get gcProcs() {
    return this.resets.length;
  }

  get hammerProcs() {
    return this.resets.filter((reset) => reset.source === 'hammer').length;
  }

  get avoidanceProcs() {
    return this.resets.filter((reset) => reset.source === 'avoidance').length;
  }

  get holyBulwarkProcs() {
    return this.resets.filter((reset) => reset.source === 'holyBulwark').length;
  }

  get sacredWeaponProcs() {
    return this.resets.filter((reset) => reset.source === 'sacredWeapon').length;
  }

  get otherProcs() {
    return this.resets.filter((reset) => reset.source === 'other').length;
  }

  resetsBetween(start: number, end: number) {
    return this.resets.filter((reset) => reset.timestamp >= start && reset.timestamp <= end);
  }

  private onHammerCast(event: CastEvent) {
    this.resetChances += 1;
    this.hammerChances += 1;
    this.onTrigger(event);
  }

  private onDamageTaken(event: DamageEvent) {
    if (!GRAND_CRUSADER_AVOIDANCE_HIT_TYPES.includes(event.hitType)) {
      return;
    }
    this.resetChances += 1;
    this.avoidanceChances += 1;
    this.onTrigger(event);
  }

  private onHolyBulwark(event: AbsorbedEvent) {
    this.onTrigger(event);
  }

  private onTrigger(event: AnyEvent) {
    this.processedTriggers.add(event);
    this.pendingResets.get(event)?.forEach((reset) => this.applyReset(reset, event.timestamp));
    this.pendingResets.delete(event);
  }

  private onProc(event: ApplyBuffEvent | RefreshBuffEvent) {
    const [trigger] = (
      [
        ['hammer', GRAND_CRUSADER_FROM_HAMMER],
        ['avoidance', GRAND_CRUSADER_FROM_AVOIDANCE],
        ['holyBulwark', GRAND_CRUSADER_FROM_HOLY_BULWARK],
      ] as [GrandCrusaderSource, string][]
    )
      .flatMap(([source, relation]) =>
        GetRelatedEvents(event, relation).map((triggerEvent) => ({ source, event: triggerEvent })),
      )
      .sort(
        (a, b) =>
          Math.abs(a.event.timestamp - event.timestamp) -
          Math.abs(b.event.timestamp - event.timestamp),
      );
    if (!trigger) {
      const source =
        GetRelatedEvents(event, GRAND_CRUSADER_FROM_SACRED_WEAPON).length > 0
          ? 'sacredWeapon'
          : 'other';
      this.applyReset({ timestamp: event.timestamp, source }, event.timestamp);
      return;
    }
    const reset: GrandCrusaderReset = { timestamp: event.timestamp, source: trigger.source };
    if (this.processedTriggers.has(trigger.event)) {
      this.applyReset(reset, event.timestamp);
    } else {
      this.pendingResets.set(trigger.event, [
        ...(this.pendingResets.get(trigger.event) ?? []),
        reset,
      ]);
    }
  }

  private onFightEnd(event: FightEndEvent) {
    this.pendingResets.forEach((resets) =>
      resets.forEach((reset) => this.applyReset(reset, event.timestamp)),
    );
    this.pendingResets.clear();
  }

  private applyReset(reset: GrandCrusaderReset, timestamp: number) {
    this.resets.push(reset);
    this.deps.spellUsable.endCooldown(TALENTS.AVENGERS_SHIELD_TALENT.id, timestamp);
    if (this.cooldownReduction > 0) {
      this.deps.spellUsable.reduceCooldown(
        SPELLS.JUDGMENT_CAST_PROTECTION.id,
        this.cooldownReduction,
        timestamp,
      );
      this.deps.spellUsable.reduceCooldown(
        SPELLS.HAMMER_OF_WRATH_PROTECTION.id,
        this.cooldownReduction,
        timestamp,
      );
    }
  }

  statistic() {
    const chanceProcs = this.hammerProcs + this.avoidanceProcs;
    const procRate = (procs: number, chances: number) =>
      chances === 0 ? '-' : `${formatPercentage(procs / chances, 1)}%`;
    const expected = (chances: number) => (chances * this.procChance).toFixed(1);
    const expectedProcs = this.resetChances * this.procChance;
    const luck = expectedProcs === 0 ? 0 : chanceProcs / expectedProcs - 1;
    const luckPercentile =
      luck >= 0
        ? binomialCDF(chanceProcs - 1, this.resetChances, this.procChance)
        : 1 - binomialCDF(chanceProcs, this.resetChances, this.procChance);
    const hammerLink = (
      <SpellLink
        spell={
          this.selectedCombatant.hasTalent(TALENTS.BLESSED_HAMMER_TALENT)
            ? TALENTS.BLESSED_HAMMER_TALENT
            : TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT
        }
      />
    );
    //As we use a different formula than the standard one for XAxis, we send it along as a parameter
    const binomChartXAxis = {
      title: 'Reset %',
      tickFormat: (value: number) => `${formatPercentage(value / this.resetChances, 0)}%`,
      style: {
        fill: 'white',
      },
    };
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        wide
        tooltip={
          <>
            <div>Grand Crusader reset the cooldown of Avenger's Shield {this.gcProcs} times.</div>
            <div>
              You had {this.resetChances} chances for Grand Crusader to trigger with a{' '}
              {formatPercentage(this.procChance, 0)}% chance to trigger.
            </div>
          </>
        }
        dropdown={
          <div style={{ padding: '8px' }}>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Chances</th>
                  <th>Resets</th>
                  <th>Proc rate</th>
                  <th>Expected</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <SpellLink
                      spell={
                        this.selectedCombatant.hasTalent(TALENTS.BLESSED_HAMMER_TALENT)
                          ? TALENTS.BLESSED_HAMMER_TALENT
                          : TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT
                      }
                    />
                  </td>
                  <td>{this.hammerChances}</td>
                  <td>{this.hammerProcs}</td>
                  <td>{procRate(this.hammerProcs, this.hammerChances)}</td>
                  <td>{expected(this.hammerChances)}</td>
                </tr>
                <tr>
                  <td>Dodges and parries</td>
                  <td>{this.avoidanceChances}</td>
                  <td>{this.avoidanceProcs}</td>
                  <td>{procRate(this.avoidanceProcs, this.avoidanceChances)}</td>
                  <td>{expected(this.avoidanceChances)}</td>
                </tr>
                {this.selectedCombatant.hasTalent(TALENTS.REFLECTION_OF_RADIANCE_TALENT) && (
                  <>
                    <tr>
                      <td>
                        <SpellLink spell={SPELLS.HOLY_BULWARK_ABSORB}>Holy Bulwark</SpellLink>
                      </td>
                      <td>-</td>
                      <td>{this.holyBulwarkProcs}</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <td>
                        <SpellLink spell={SPELLS.SACRED_WEAPON_DAMAGE}>Sacred Weapon</SpellLink>
                      </td>
                      <td>-</td>
                      <td>{this.sacredWeaponProcs}</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                  </>
                )}
                <tr>
                  <td>Other sources</td>
                  <td>-</td>
                  <td>{this.otherProcs}</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <p>
                  The chart shows how likely it was to get <em>exactly</em> each number of resets
                  from {hammerLink} and dodges and parries, given your {this.resetChances} chances
                  at {formatPercentage(this.procChance, 0)}% each. Resets from{' '}
                  {this.selectedCombatant.hasTalent(TALENTS.REFLECTION_OF_RADIANCE_TALENT) &&
                    'Holy Bulwark, Sacred Weapon and '}
                  other sources are left out, since their chance is unknown.
                </p>
                {this.resetChances > 0 && (
                  <p>
                    You got <strong>{chanceProcs}</strong> resets where{' '}
                    {expected(this.resetChances)} were expected, a{' '}
                    {formatPercentage(chanceProcs / this.resetChances, 1)}% reset rate. That's{' '}
                    <strong>
                      {formatPercentage(Math.abs(luck), 0)}% {luck >= 0 ? 'more' : 'fewer'}
                    </strong>{' '}
                    resets than expected, {luck >= 0 ? 'luckier' : 'unluckier'} than{' '}
                    <strong>{formatPercentage(luckPercentile, 0)}%</strong> of fights. The chance of
                    getting exactly {chanceProcs} resets was{' '}
                    <strong>
                      {formatPercentage(
                        binomialPMF(chanceProcs, this.resetChances, this.procChance),
                        1,
                      )}
                      %
                    </strong>
                    .
                  </p>
                )}
              </div>
              <div style={{ flex: 1 }}>
                {plotOneVariableBinomChart(
                  chanceProcs,
                  this.resetChances,
                  this.procChance,
                  'Reset %',
                  'Actual Resets',
                  [0, 0.2],
                  binomChartXAxis,
                )}
              </div>
            </div>
          </div>
        }
      >
        <BoringSpellValue
          spell={TALENTS.GRAND_CRUSADER_TALENT.id}
          value={`${this.gcProcs} Resets`}
          label="Grand Crusader"
        />
      </Statistic>
    );
  }
}

export default GrandCrusader;
