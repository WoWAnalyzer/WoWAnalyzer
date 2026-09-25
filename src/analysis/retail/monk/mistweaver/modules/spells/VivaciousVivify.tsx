import type { JSX } from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink, Tooltip } from 'interface';
import { InsetContainer } from 'interface/guide/components/BuffUptimeBar';
import GuideDataWrapper, {
  HelperText,
  StatCard,
  StatCardDivider,
  StatCardLabel,
  StatCardValue,
  StatsRow,
} from 'interface/guide/components/GuideDataWrapper';
import GuideSection from 'interface/guide/components/GuideSection';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import UptimeBar, { Uptime } from 'parser/ui/UptimeBar';
import { getCurrentRSKTalent, SPELL_COLORS } from '../../constants';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import RenewingMist from './RenewingMist';
import Vivify from './Vivify';
import { CelestialHooks } from 'analysis/retail/monk/shared';
import { StackedBar } from 'interface/guide/components';
import { isVivaciousVivification } from '../../normalizers/CastLinkNormalizer';

/** matches the uncolored stat card default in CastOverview */
const NEUTRAL_STAT_COLOR = '#dadada';

class VivaciousVivification extends Analyzer {
  static dependencies = {
    vivify: Vivify,
    renewingMist: RenewingMist,
    celestialHooks: CelestialHooks,
  };
  protected celestialHooks!: CelestialHooks;
  protected renewingMist!: RenewingMist;
  protected vivify!: Vivify;
  currentRenewingMists = 0;
  totalCasts = 0;
  totalHealed = 0;
  wastedApplications = 0;
  instantVivifies = 0;
  hardCastVivifies = 0;
  unusableUptimes: Uptime[] = []; // a wasted window is when we have buff and good rem count and we aren't in celestial window

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.VIVIFICATION_BUFF),
      this.onRefresh,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.VIVIFICATION_BUFF),
      this.onBuffApply,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onRemRemove,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.VIVIFICATION_BUFF),
      this.onBuffRemove,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.onVivifyHeal);
    this.unusableUptimes.push({
      start: this.owner.fight.start_time,
      end: -1,
    });
  }

  get isUsable() {
    return (
      this.renewingMist.currentRenewingMists >= this.vivify.estimatedAverageReMs &&
      this.selectedCombatant.hasBuff(SPELLS.VIVIFICATION_BUFF.id) &&
      !this.celestialHooks.celestialActive
    );
  }

  // the utilization getters are only accurate once the trailing period is closed off at fight end
  get usedTime() {
    return this.unusableUptimes.reduce((total, up) => total + up.end - up.start, 0);
  }

  get utilizationPercentage() {
    return this.usedTime / (this.owner.fight.end_time - this.owner.fight.start_time);
  }

  get inUsablePeriod() {
    return this.unusableUptimes.at(-1)!.end > 0;
  }

  endUsablePeriod(timestamp: number) {
    this.unusableUptimes.push({
      start: timestamp,
      end: -1,
    });
  }

  startUsablePeriod(timestamp: number) {
    this.unusableUptimes.at(-1)!.end = timestamp;
  }

  // We waste a buff if the buff refreshes, not in celestial, and sufficient rems active
  onRefresh(_event: RefreshBuffEvent) {
    if (this.isUsable) {
      this.wastedApplications += 1;
    }
  }

  // when we gain buff, have sufficient rems, and not in celestial then we start usable period
  onBuffApply(event: ApplyBuffEvent) {
    if (!this.inUsablePeriod && this.isUsable) {
      this.startUsablePeriod(event.timestamp);
    }
  }

  // We enter unusable period if our ReM count becomes too low or if we consume the buff
  onRemRemove(event: RemoveBuffEvent) {
    if (this.inUsablePeriod && !this.isUsable) {
      this.endUsablePeriod(event.timestamp);
    }
  }

  // if we consume buff and we were in usable period, then end usable period
  onBuffRemove(event: RemoveBuffEvent) {
    if (this.inUsablePeriod) {
      this.endUsablePeriod(event.timestamp);
    }
  }

  // each Vivify cast produces a single main target heal, so we can classify casts from them
  onVivifyHeal(event: HealEvent) {
    if (isVivaciousVivification(event)) {
      this.instantVivifies += 1;
    } else {
      this.hardCastVivifies += 1;
    }
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT} />
        </b>{' '}
        is a buff granted when you cast{' '}
        <SpellLink spell={getCurrentRSKTalent(this.selectedCombatant)} /> making your next{' '}
        <SpellLink spell={SPELLS.VIVIFY} /> instant cast. Try to consume this buff without letting
        it refresh as healing and mana warrant.
      </p>
    );
    this.unusableUptimes.at(-1)!.end = this.owner.fight.end_time;
    return (
      <GuideSection explanation={explanation} explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}>
        <GuideDataWrapper
          bare
          title={
            <>
              <SpellLink spell={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT} /> Overview
            </>
          }
          subtitle="Buff Utilization"
          stats={
            <StatsRow>
              <Tooltip content="Portion of the fight where the buff was not sitting unconsumed.">
                <StatCard color={NEUTRAL_STAT_COLOR}>
                  <StatCardValue color={NEUTRAL_STAT_COLOR}>
                    {formatPercentage(this.utilizationPercentage, 0)}%
                  </StatCardValue>
                  <StatCardDivider color={NEUTRAL_STAT_COLOR} />
                  <StatCardLabel>Utilization</StatCardLabel>
                </StatCard>
              </Tooltip>
              <Tooltip content="Times the buff refreshed while you could have consumed it effectively, wasting the application.">
                <StatCard color={NEUTRAL_STAT_COLOR}>
                  <StatCardValue color={NEUTRAL_STAT_COLOR}>
                    {this.wastedApplications}
                  </StatCardValue>
                  <StatCardDivider color={NEUTRAL_STAT_COLOR} />
                  <StatCardLabel>Wasted Applications</StatCardLabel>
                </StatCard>
              </Tooltip>
            </StatsRow>
          }
        >
          <InsetContainer style={{ height: 32 }}>
            <UptimeBar
              timeTooltip
              uptimeHistory={this.unusableUptimes}
              start={this.owner.fight.start_time}
              end={this.owner.fight.end_time}
              barColor={SPELL_COLORS.VIVIFY}
            />
          </InsetContainer>
          <HelperText style={{ marginTop: 6 }}>
            Grey periods indicate times that you could have used your{' '}
            <SpellLink spell={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT} /> buff effectively, but
            did not.
          </HelperText>
        </GuideDataWrapper>
        <div style={{ marginTop: 18 }}>
          <GuideDataWrapper bare title="Cast Distribution">
            <StackedBar
              segments={[
                {
                  label: 'Instant',
                  value: this.instantVivifies,
                  color: SPELL_COLORS.VIVIFY,
                  tooltip: (
                    <>
                      {this.instantVivifies} <SpellLink spell={SPELLS.VIVIFY} /> casts made instant
                      by <SpellLink spell={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT} />
                    </>
                  ),
                },
                {
                  label: 'Hard Cast',
                  value: this.hardCastVivifies,
                  color: SPELL_COLORS.ALTERNATE_GUST_OF_MIST,
                  tooltip: (
                    <>
                      {this.hardCastVivifies} hard cast <SpellLink spell={SPELLS.VIVIFY} />s
                    </>
                  ),
                },
              ]}
            />
          </GuideDataWrapper>
        </div>
      </GuideSection>
    );
  }
}

export default VivaciousVivification;
