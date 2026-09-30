import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { getStrengthOfTheBlackOxConsumingCast } from '../../normalizers/CastLinkNormalizer';
import SpellLink from 'interface/SpellLink';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import {
  QualitativePerformance,
  evaluateQualitativePerformanceByThreshold,
} from 'parser/ui/QualitativePerformance';
import GuideSection from 'interface/guide/components/GuideSection';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import CastOverview from 'interface/guide/components/CastOverview';
import { CelestialHooks } from 'analysis/retail/monk/shared';
import { getCurrentCelestialTalent } from '../../constants';
import { addEnhancedCastReason } from 'parser/core/EventMetaLib';

class StrengthOfTheBlackOx extends Analyzer {
  static dependencies = {
    celestial: CelestialHooks,
  };
  refreshedBuffs = 0;
  expiredBuffs = 0;
  entries: PerCastData[] = [];
  protected celestial!: CelestialHooks;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT);

    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF),
      this.onRemoveBuff,
    );
  }

  private onRefreshBuff(event: RefreshBuffEvent) {
    this.refreshedBuffs += 1;
    this.entries.push({
      timestamp: this.owner.formatTimestamp(event.timestamp),
      performance: QualitativePerformance.Fail,
      stats: [],
      details: 'Buff refreshed before being consumed',
    });
  }

  private hasManaBuff(): boolean {
    return this.selectedCombatant.hasBuff(SPELLS.INNERVATE) || this.celestial.celestialActive;
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    const consumingCast = getStrengthOfTheBlackOxConsumingCast(event);
    const isConsumed = consumingCast !== undefined;
    if (!isConsumed) {
      this.expiredBuffs += 1;
    }
    const hasBuff = this.hasManaBuff();
    const performance =
      isConsumed && hasBuff
        ? QualitativePerformance.Perfect
        : isConsumed !== hasBuff
          ? QualitativePerformance.Good
          : QualitativePerformance.Fail;
    this.entries.push({
      timestamp: this.owner.formatTimestamp(event.timestamp),
      performance,
      stats: [],
      details: isConsumed ? (
        <>
          Consumed {hasBuff ? 'with' : 'without'}{' '}
          <SpellLink spell={getCurrentCelestialTalent(this.selectedCombatant)} /> active
        </>
      ) : (
        'Buff expired before being consumed'
      ),
    });

    if (consumingCast) {
      addEnhancedCastReason(
        consumingCast,
        <>
          This cast consumed <SpellLink spell={SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF} />.
        </>,
      );
    }
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT} />
        </b>{' '}
        is a buff that makes your next <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} />{' '}
        have a reduced cast time and apply a shield to 5 nearby allies. It is very important to
        never let this buff refresh or expire as it is a considerable amount of shielding. Try to
        have <SpellLink spell={getCurrentCelestialTalent(this.selectedCombatant)} /> active when
        casting <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> as it is very expensive.
      </p>
    );
    const stats = [
      {
        value: `${this.expiredBuffs + this.refreshedBuffs}`,
        label: 'Wasted Buffs',
        tooltip: (
          <>
            <div>{this.expiredBuffs} expired</div>
            <div>{this.refreshedBuffs} refreshed</div>
          </>
        ),
        performance: evaluateQualitativePerformanceByThreshold({
          actual: this.expiredBuffs + this.refreshedBuffs,
          isLessThanOrEqual: { perfect: 0, good: 0, ok: 2 },
        }),
      },
    ];
    return (
      <GuideSection explanation={explanation} explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}>
        <CastOverview
          spell={TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT}
          title={
            <>
              <SpellLink spell={TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT} /> Overview
            </>
          }
          stats={stats}
        />
        <CastDetail title="Buff Utilization" casts={this.entries} />
      </GuideSection>
    );
  }
}

export default StrengthOfTheBlackOx;
