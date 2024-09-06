import MajorDefensive, {
  MajorDefensiveBuff,
  Mitigation,
  MitigationRow,
  MitigationRowContainer,
  buff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import Events, {
  ApplyBuffEvent,
  DamageEvent,
  GetRelatedEvents,
  HealEvent,
} from 'parser/core/Events';
import { SpellLink } from 'interface';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import {
  BreakdownByDamageSource,
  CooldownDetailsContainer,
  CooldownDetailsProps,
  NoData,
  NumericColumn,
  SmallPassFailBar,
  TableSegmentContainer,
} from 'interface/guide/components/MajorDefensives/AllCooldownUsagesList';
import {
  MitigationSegment,
  MitigationTooltipSegment,
} from 'interface/guide/components/MajorDefensives/MitigationSegments';
import { formatNumber } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import BoringValue from 'parser/ui/BoringValueText';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ReactNode } from 'react';
import { RENEWING_BLAZE_HEAL } from '../normalizers/DefensiveCastLinkNormalizer';

type RenewingBlazeHealBuff = {
  start: ApplyBuffEvent;
  amount: number;
  overheal: number;
  partnerAmount: number;
};

class RenewingBlaze extends MajorDefensiveBuff {
  renewingBlazeHealBuffs: RenewingBlazeHealBuff[] = [];
  normalizedMitigations: Mitigation[] = [];
  hasCinders = false;

  constructor(options: Options) {
    // Custom trigger since we only want to track mitigation during our
    // personal buffs, not any external ones
    const trigger = buff(TALENTS.RENEWING_BLAZE_TALENT);
    trigger.applyTrigger = Events.applybuff
      .spell(TALENTS.RENEWING_BLAZE_TALENT)
      .by(SELECTED_PLAYER)
      .to(SELECTED_PLAYER);
    trigger.removeTrigger = Events.removebuff
      .spell(TALENTS.RENEWING_BLAZE_TALENT)
      .by(SELECTED_PLAYER)
      .to(SELECTED_PLAYER);

    super(TALENTS.RENEWING_BLAZE_TALENT, trigger, options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RENEWING_BLAZE_TALENT);

    this.hasCinders = this.selectedCombatant.hasTalent(TALENTS.LIFECINDERS_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).to(SELECTED_PLAYER).spell(TALENTS.RENEWING_BLAZE_TALENT),
      this.applyBuff,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive) {
      return;
    }
    this.recordMitigation({
      event,
      // Renewing Blaze includes absorbed damage for its accumulation
      mitigatedAmount: event.amount + (event.absorbed ?? 0),
    });
  }

  private applyBuff(event: ApplyBuffEvent) {
    const heal = {
      start: event,
      amount: 0,
      overheal: 0,
      partnerAmount: -1,
    };
    if (this.hasCinders) {
      heal.partnerAmount = 0;
    }

    const healEvents = GetRelatedEvents<HealEvent>(event, RENEWING_BLAZE_HEAL);
    for (const healEvent of healEvents) {
      if (healEvent.targetID !== this.selectedCombatant.id) {
        heal.partnerAmount += healEvent.amount;
        continue;
      }

      heal.amount += healEvent.amount;
      heal.overheal += healEvent.overheal ?? 0;
    }
    this.renewingBlazeHealBuffs.push(heal);
  }

  /** Returns the related Renewing Healing buff, for our Acc buff. */
  private healBuff(mit: Mitigation | undefined): RenewingBlazeHealBuff | undefined {
    return this.renewingBlazeHealBuffs.find((buff) => buff.start === mit?.start);
  }

  // For some reason healing numbers and damage taken doesn't always
  // line up properly, so bar widths will end up being wonky and look weird
  // So we build our own version with the healing numbers instead
  private onFightEnd() {
    this.normalizedMitigations = super.mitigations.map((mit) => {
      const heal = this.healBuff(mit);
      return { ...mit, amount: heal ? heal.amount + heal.overheal : mit.amount };
    });
  }

  // Override to return normalized mitigation
  get mitigations(): Mitigation[] {
    return this.normalizedMitigations;
  }

  mitigationSegments(mit: Mitigation): MitigationSegment[] {
    const heal = this.healBuff(mit);

    return [
      {
        amount: heal?.amount ?? 0,
        color: color(MAGIC_SCHOOLS.ids.NATURE),
        description: <>Healing</>,
      },
      {
        amount: heal?.overheal ?? 0,
        color: color(MAGIC_SCHOOLS.ids.FIRE),
        description: <>Overhealing</>,
      },
    ];
  }

  /**
   * Rating RB is kinda weirdge
   * should most likely be rating based on a rolling window around
   * current use to see if there was a better timing but ¯\_(ツ)_/¯
   *
   * Xeph has requested ERT note generation for ideal RB timings, this would in itself
   * require rolling windows, so that kind of performance analysis could potentially be
   * implemented alongside that.
   *
   * For now we'll base it on a mixture of damage intake and heal/overhealing ratio.
   * This will still provide a good enough reference point to work from,
   * since low damage intake would most likely indicate low value use or a panic press after taking a damage spike.
   * And if the use had an excessive amount of overhealing this would usually indicate it being used too late.
   *
   * Both of above points could also indicate an overlap with other defensives, which in most cases also would be a poor use.
   */
  explainPerformance(mit: Mitigation): {
    perf: QualitativePerformance;
    explanation?: ReactNode;
  } {
    const heal = this.healBuff(mit);
    const effHealing = heal?.amount ?? 0;
    const overHealing = heal?.overheal ?? 0;

    // Ratio between overhealing and effective healing
    // 1 = no overheal
    // 0 = full overheal
    const ratio = effHealing / (effHealing + overHealing);
    const perfectRatioCutoff = 0.75;
    const goodRatioCutoff = 0.6;

    // No matter the amount of overhealing this is a strong usage.
    if (effHealing >= this.firstSeenMaxHp) {
      return {
        perf: QualitativePerformance.Perfect,
        explanation: 'Usage healed more than 100% of your HP',
      };
    }

    // High healing throughput
    if (effHealing >= this.firstSeenMaxHp * 0.5) {
      // High eff healing
      if (ratio >= perfectRatioCutoff) {
        return {
          perf: QualitativePerformance.Perfect,
          explanation:
            'Usage healed more than 50% of your HP and had high amounts of effective healing',
        };
      }
      // High overhealing
      if (ratio < goodRatioCutoff) {
        return {
          perf: QualitativePerformance.Ok,
          explanation: 'Usage healed more than 50% of your HP but had high amounts of overhealing',
        };
      }
      return {
        perf: QualitativePerformance.Good,
        explanation: 'Usage healed more than 50% of your HP',
      };
    }

    // High accumulation
    if (mit.amount >= this.firstSeenMaxHp * 0.5) {
      // High eff healing
      if (ratio >= perfectRatioCutoff) {
        return {
          perf: QualitativePerformance.Perfect,
          explanation:
            'Usage accumulated more than 50% of your HP and had high amounts of effective healing',
        };
      }
      // High overhealing
      if (ratio < goodRatioCutoff) {
        return {
          perf: QualitativePerformance.Ok,
          explanation:
            'Usage accumulated more than 50% of your HP but had high amounts of overhealing',
        };
      }
      return {
        perf: QualitativePerformance.Good,
        explanation: 'Usage Accumulated more than 50% of your HP',
      };
    }

    // Low accumulation
    if (mit.amount < this.firstSeenMaxHp * 0.5) {
      // Very low accumulation
      if (mit.amount <= this.firstSeenMaxHp * 0.3) {
        return {
          perf: QualitativePerformance.Ok,
          explanation: 'Usage accumulated less than 30% of your HP',
        };
      }
      // High eff healing
      if (ratio >= perfectRatioCutoff) {
        return {
          perf: QualitativePerformance.Good,
          explanation:
            'Usage accumulated less than 50% of your HP but had high amounts of effective healing',
        };
      }
      // High overhealing
      return {
        perf: QualitativePerformance.Ok,
        explanation:
          'Usage accumulated less than 50% of your HP and had high amounts of overhealing',
      };
    }

    return { perf: QualitativePerformance.Good };
  }

  description() {
    return (
      <p>
        <SpellLink spell={TALENTS.RENEWING_BLAZE_TALENT} /> heals you for the damage you take over{' '}
        {this.selectedCombatant.hasTalent(TALENTS.FOCI_OF_LIFE_TALENT) ? (
          <>
            4 seconds with <SpellLink spell={TALENTS.FOCI_OF_LIFE_TALENT} /> talented.
          </>
        ) : (
          <>8 seconds.</>
        )}
        <br />
        High amounts of overhealing for <SpellLink spell={TALENTS.RENEWING_BLAZE_TALENT} /> uses,
        will usually indicate it was used too late.
      </p>
    );
  }

  statistic() {
    const tooltip = (
      <div>
        <MitigationRowContainer>
          <strong>Time</strong>
          <strong>Mit.</strong>
        </MitigationRowContainer>
        {this.mitigations.map((mit) => {
          return (
            <MitigationRow
              mitigation={mit}
              segments={this.mitigationSegments(mit)}
              fightStart={this.owner.fight.start_time}
              maxValue={mit.amount}
              key={mit.start.timestamp}
            />
          );
        })}
      </div>
    );
    return (
      <Statistic
        size="flexible"
        tooltip={this.mitigations.length > 0 ? tooltip : undefined}
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringValue
          label={
            <>
              <SpellLink spell={TALENTS.RENEWING_BLAZE_TALENT} /> Healing Provided
            </>
          }
        >
          <div>
            <img src="/img/healing.png" alt="Healing" className="icon" />{' '}
            {formatNumber(this.renewingBlazeHealBuffs.reduce((acc, heal) => heal.amount + acc, 0))}{' '}
            <small>Healing</small>
          </div>
          <div>
            <img src="/img/overhealing.png" alt="Overhealing" className="icon" />{' '}
            {formatNumber(
              this.renewingBlazeHealBuffs.reduce((acc, heal) => heal.overheal + acc, 0),
            )}{' '}
            <small>Overhealing</small>
          </div>
        </BoringValue>
      </Statistic>
    );
  }

  get cooldownDetailsComponent() {
    return ({ analyzer, mit }: CooldownDetailsProps) => {
      const heal = this.healBuff(mit);
      return <CooldownDetails analyzer={analyzer} mit={mit} heal={heal} />;
    };
  }
}

const CooldownDetails = ({
  analyzer,
  mit,
  heal,
}: {
  analyzer: MajorDefensive<any, any>;
  mit?: Mitigation;
  heal?: RenewingBlazeHealBuff;
}) => {
  if (!mit) {
    return (
      <CooldownDetailsContainer>
        <NoData>Click on a box in the cast breakdown to view details.</NoData>
      </CooldownDetailsContainer>
    );
  }

  return (
    <CooldownDetailsContainer>
      <table>
        <tbody>
          <tr>
            <td>Total Damage taken</td>
            <NumericColumn>{formatNumber(mit.amount)}</NumericColumn>
            <td>
              <SmallPassFailBar
                pass={mit.amount}
                total={analyzer.firstSeenMaxHp}
                passTooltip="Amount of damage taken, relative to your maximum health"
              />
            </td>
          </tr>
          {heal ? (
            <>
              <tr>
                <td colSpan={3}>
                  <strong>Healing Breakdown</strong>
                </td>
              </tr>
              <tr>
                <td>Healing</td>
                <NumericColumn>{formatNumber(heal.amount)}</NumericColumn>
                <TableSegmentContainer>
                  <MitigationTooltipSegment
                    color="#4ec04e"
                    maxWidth={100}
                    width={heal.amount / mit.amount}
                  />
                  <MitigationTooltipSegment
                    color="rgba(255, 255, 255, 0.05)"
                    maxWidth={100}
                    width={heal.overheal / mit.amount}
                  />
                </TableSegmentContainer>
              </tr>

              <tr>
                <td>Overhealing</td>
                <NumericColumn>{formatNumber(heal.overheal)}</NumericColumn>

                <TableSegmentContainer>
                  <MitigationTooltipSegment
                    color="rgba(255, 255, 255, 0.05)"
                    maxWidth={100}
                    width={heal.amount / mit.amount}
                  />
                  <MitigationTooltipSegment
                    color="#ac1f39"
                    maxWidth={100}
                    width={heal.overheal / mit.amount}
                  />
                </TableSegmentContainer>
              </tr>

              {heal.partnerAmount >= 0 && (
                <tr>
                  <td>Partner healing</td>
                  <NumericColumn>{formatNumber(heal.partnerAmount)}</NumericColumn>

                  <TableSegmentContainer>
                    <MitigationTooltipSegment
                      color="#4ec04e"
                      maxWidth={100}
                      width={Math.min(1, heal.partnerAmount / mit.amount)}
                    />
                    <MitigationTooltipSegment
                      color="rgba(255, 255, 255, 0.05)"
                      maxWidth={100}
                      width={Math.max(0, 1 - heal.partnerAmount / mit.amount)}
                    />
                  </TableSegmentContainer>
                </tr>
              )}
            </>
          ) : (
            <>
              <tr>
                <td colSpan={3}>
                  <strong>No healing data found</strong>
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
      <BreakdownByDamageSource mit={mit} />
    </CooldownDetailsContainer>
  );
};

export default RenewingBlaze;
