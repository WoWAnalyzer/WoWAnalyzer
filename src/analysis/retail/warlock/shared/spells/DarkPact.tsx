import TALENTS from 'common/TALENTS/warlock';
import { formatNumber, formatPercentage } from 'common/format';
import SpellLink from 'interface/SpellLink';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbilityEvent,
  AbsorbedEvent,
  ApplyBuffEvent,
  CastEvent,
  FightEndEvent,
  HasAbility,
  HasSource,
  RemoveBuffEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import MajorDefensive, {
  MajorDefensiveBuff,
  MitigatedEvent,
  Mitigation,
  buff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { ReactNode } from 'react';
import { color } from 'game/MAGIC_SCHOOLS';
import { MitigationTooltipSegment } from 'interface/guide/components/MajorDefensives/MitigationSegments';
import {
  CooldownDetailsContainer,
  CooldownDetailsProps,
  NoData,
  NumericColumn,
  TableSegmentContainer,
} from 'interface/guide/components/MajorDefensives/AllCooldownUsagesList';
import {
  DamageSourceLink,
  damageBreakdown,
} from 'interface/guide/components/DamageTakenPointChart';
import { encodeTargetString } from 'parser/shared/modules/Enemies';

const debug = false;

interface DarkPactCast {
  applyEvent: ApplyBuffEvent;
  removeEvent?: RemoveBuffEvent;
  castEvent?: CastEvent;
  hpPostCast?: number;
  hpPercentPreCast?: number;
  maxHpPostCast?: number;
  totalAbsorb?: number;
  amountAbsorbed: number;
  unusedAbsorb?: number;
}

// TODO: needs guide, defensives section, this can and should be used as often as possible to help healers out
// Expected event order is ApplyBuff > CastEvent > Absorbs > RemoveBuff
class DarkPact extends MajorDefensiveBuff {
  casts: DarkPactCast[] = [];
  darkPactActive = false;
  hasIchor: boolean;
  hasFrequentDonor: boolean;
  possibleCasts = 0;

  constructor(options: Options) {
    super(TALENTS.DARK_PACT_TALENT, buff(TALENTS.DARK_PACT_TALENT), options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DARK_PACT_TALENT);
    this.hasIchor = this.selectedCombatant.hasTalent(TALENTS.ICHOR_OF_DEVILS_TALENT);
    this.hasFrequentDonor = this.selectedCombatant.hasTalent(TALENTS.FREQUENT_DONOR_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DARK_PACT_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(TALENTS.DARK_PACT_TALENT),
      this.onApplyShield,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(TALENTS.DARK_PACT_TALENT),
      this.onRemoveShield,
    );
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(TALENTS.DARK_PACT_TALENT),
      this.onAbsorb,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private onCast(event: CastEvent) {
    if (!this.darkPactActive) {
      this.warn('Unexpected Dark Pact CastEvent, no ApplyBuffEvent before?');
      return;
    }
    debug &&
      (!event.hitPoints || !event.maxHitPoints) &&
      this.debug('Dark Pact CastEvent has no HP data');

    this.casts[this.casts.length - 1].castEvent = event;
    this.casts[this.casts.length - 1].hpPostCast = event.hitPoints;
    this.casts[this.casts.length - 1].maxHpPostCast = event.maxHitPoints;
    this.casts[this.casts.length - 1].hpPercentPreCast =
      (event.hitPoints || 0) / (this.hasIchor ? 0.95 : 0.8) / (event.maxHitPoints || 1);
  }

  // this is still sent by wowa at 00 if the buff is active on pull
  private onApplyShield(event: ApplyBuffEvent) {
    this.darkPactActive = true;
    this.casts.push({
      applyEvent: event,
      totalAbsorb: event.absorb,
      amountAbsorbed: 0,
    });

    debug &&
      !event.absorb &&
      this.debug("Dark Pact ApplyBuffEvent doesn't have shield value", event);
  }

  private onRemoveShield(event: RemoveBuffEvent) {
    if (!this.darkPactActive) {
      this.warn('Unexpected Dark Pact RemoveBuffEvent, no ApplyBuffEvent before?');
      return;
    }
    this.casts[this.casts.length - 1].removeEvent = event;
    this.casts[this.casts.length - 1].unusedAbsorb = event.absorb;
    this.darkPactActive = false;
    debug && this.debug('shield down, last cast: ', this.casts[this.casts.length - 1]);
  }

  private onAbsorb(event: AbsorbedEvent) {
    if (!this.darkPactActive) {
      this.warn('Unexpected Dark Pact AbsorbedEvent, no ApplyBuffEvent before?');
      return;
    }
    this.casts[this.casts.length - 1].amountAbsorbed += event.amount;

    // recordMitigation expects a damage event but we can hack it
    event.ability = event.extraAbility;
    this.recordMitigation({ event, mitigatedAmount: event.amount });
  }

  private onFightEnd(event: FightEndEvent) {
    this.possibleCasts = this.owner.fightDuration / (this.hasFrequentDonor ? 45000 : 60000);
  }

  get darkPactNumCasts() {
    return this.casts.length;
  }

  get darkPactAvgHpWhenCast() {
    let total = 0;
    this.casts.forEach((cast) => (total += cast.hpPercentPreCast || 0));
    return total / this.darkPactNumCasts;
  }

  get darkPactAvgAbsorbed() {
    let total = 0;
    this.casts.forEach((cast) => (total += cast.amountAbsorbed));
    return total / this.darkPactNumCasts;
  }

  get darkPactTotalUnused() {
    let total = 0;
    this.casts.forEach((cast) => (total += cast.unusedAbsorb || 0));
    return total;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        tooltip={<p>{formatNumber(this.darkPactAvgAbsorbed)} Avg. absorbed</p>}
      >
        <BoringSpellValueText spell={TALENTS.DARK_PACT_TALENT}>
          <p>
            {formatNumber(this.darkPactNumCasts)}{' '}
            <small> Dark Pact{this.darkPactNumCasts === 1 ? '' : 's'} cast </small>
          </p>
          <p>
            {formatPercentage(this.darkPactAvgHpWhenCast, 0)}
            {'% '}
            <small> Avg. hp when cast</small>
          </p>
          {this.darkPactTotalUnused > 0 && (
            <p>
              {formatNumber(this.darkPactTotalUnused)} <small> Total Amount unused</small>
            </p>
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }

  description(): ReactNode {
    return (
      <>
        <SpellLink spell={TALENTS.DARK_PACT_TALENT} /> shields you for 40% of your current hp while
        sacrificing half of that amount. This is increased by versatiliy and should be at used as
        often as possible before you start taking damage.
      </>
    );
  }

  get cooldownDetailsComponent() {
    return ({ analyzer, mit }: CooldownDetailsProps) => {
      return (
        <CooldownDetails
          analyzer={analyzer}
          mit={mit}
          dpCast={
            mit
              ? this.casts.find((cast) => cast.applyEvent.timestamp === mit.start.timestamp)
              : undefined
          }
        />
      );
    };
  }
}

const CooldownDetails = ({
  analyzer,
  mit,
  dpCast,
}: {
  analyzer: MajorDefensive<any, any>;
  mit?: Mitigation;
  dpCast?: DarkPactCast;
}) => {
  if (
    !mit ||
    !dpCast ||
    !dpCast.totalAbsorb ||
    !dpCast.hpPercentPreCast ||
    dpCast.unusedAbsorb === undefined
  ) {
    return (
      <CooldownDetailsContainer>
        <NoData>Click on a box in the cast breakdown to view details.</NoData>
      </CooldownDetailsContainer>
    );
  }

  const damageTakenBreakdown = damageBreakdown(
    mit.mitigated,
    (event) => (HasAbility(event.event) ? event.event.ability.guid : 0),
    (event) => (HasSource(event.event) ? encodeTargetString(event.event.sourceID) : '0'),
  );

  const splitMelees = (damageTakenBreakdown.get(1)?.size ?? 0) > 1;
  const damageTakenRows = Array.from(damageTakenBreakdown.entries())
    .flatMap(([id, bySource]): [number, MitigatedEvent[]][] => {
      if (id === 1 && splitMelees) {
        // make each melee source its own row
        return Array.from(bySource.values()).map((events) => [id, events]);
      } else {
        // put all the events into a single list.
        return [[id, Array.from(bySource.values()).flat()]];
      }
    })
    .sort(([, eventsA], [, eventsB]) => {
      const totalA = eventsA.reduce((a, b) => a + b.mitigatedAmount, 0);
      const totalB = eventsB.reduce((a, b) => a + b.mitigatedAmount, 0);

      return totalB - totalA;
    })
    // limit to top 5 damage sources
    .slice(0, 5);

  const maxDamageTaken = Math.max.apply(
    null,
    damageTakenRows.map(([, events]) => events.reduce((a, b) => a + b.mitigatedAmount, 0)),
  );

  const maxValue = Math.max(analyzer.firstSeenMaxHp, mit.amount, mit.maxAmount ?? 0);

  return (
    <CooldownDetailsContainer>
      <table>
        <tbody>
          <tr>
            <td colSpan={3}>
              <strong>Usage info</strong>
            </td>
          </tr>
          <tr>
            <td>HP %</td>
            <NumericColumn>{formatPercentage(dpCast.hpPercentPreCast, 0)}%</NumericColumn>
            <TableSegmentContainer>
              <MitigationTooltipSegment
                color="rgb(80,196,76)"
                maxWidth={100}
                width={dpCast.hpPercentPreCast}
              />
              <MitigationTooltipSegment
                color="rgb(176,28,60)"
                maxWidth={100}
                width={1 - dpCast.hpPercentPreCast}
              />
            </TableSegmentContainer>
          </tr>
          <tr>
            <td>Shield</td>
            <NumericColumn>{formatNumber(mit.amount)}</NumericColumn>
            <TableSegmentContainer>
              <MitigationTooltipSegment
                color="rgba(255, 255, 255, 0.25)"
                maxWidth={100}
                width={mit.amount / maxValue}
              />
            </TableSegmentContainer>
          </tr>
          {dpCast.unusedAbsorb > 0 && (
            <tr>
              <td>Unused</td>
              <NumericColumn>{formatNumber(dpCast.unusedAbsorb)}</NumericColumn>
              <TableSegmentContainer>
                <MitigationTooltipSegment
                  color="rgb(176,28,60)"
                  maxWidth={100}
                  width={dpCast.unusedAbsorb / dpCast.totalAbsorb}
                />
              </TableSegmentContainer>
            </tr>
          )}
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>
            <td colSpan={3}>
              <strong>Mitigation by Damage Source</strong>
            </td>
          </tr>
          {damageTakenRows.map(([spellId, events], ix) => {
            const keyEvent = events.find(({ event }) => HasAbility(event))?.event as
              | AbilityEvent<any>
              | undefined;

            if (!keyEvent) {
              return null;
            }

            const rowColor = color(keyEvent.ability.type);

            const mitigatedAmount = events.reduce((a, b) => a + b.mitigatedAmount, 0);

            return (
              <tr key={ix}>
                <td style={{ width: '1%' }}>
                  <DamageSourceLink
                    showSourceName={spellId === 1 && splitMelees}
                    event={keyEvent}
                  />
                </td>
                <NumericColumn>{formatNumber(mitigatedAmount)}</NumericColumn>
                <TableSegmentContainer>
                  <MitigationTooltipSegment
                    color={rowColor}
                    width={mitigatedAmount / maxDamageTaken}
                  />
                </TableSegmentContainer>
              </tr>
            );
          })}
        </tbody>
      </table>
    </CooldownDetailsContainer>
  );
};

export default DarkPact;
