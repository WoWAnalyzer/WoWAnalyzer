import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import KillShot from 'analysis/classic/hunter/shared/KillShot';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { BadColor, GoodColor, OkColor } from 'interface/guide';
import SpellLink from 'interface/SpellLink';

class KillShotSurvival extends KillShot {
  private useEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.KILL_SHOT_SURVIVAL_TALENT),
      this.onSVCast,
    );
  }

  private onSVCast = (event: CastEvent) => {
    let value: QualitativePerformance = QualitativePerformance.Good;
    let perfExplanation: React.ReactNode | undefined = undefined;
    const targetName = this.owner.getTargetName(event);

    const focus = event.classResources?.find((x) => x.type === RESOURCE_TYPES.FOCUS.id);
    const focusAmount = focus?.amount ?? null;

    if (this.selectedCombatant.hasTalent(TALENTS.SENTINEL_TALENT)) {
      if (
        this.selectedCombatant.hasOwnBuff(SPELLS.MONGOOSE_FURY.id) &&
        focusAmount !== null &&
        focusAmount > 30
      ) {
        value = QualitativePerformance.Fail;
        perfExplanation = (
          <div>
            <h5 style={{ color: BadColor }}>Good Tipped Cast</h5>
            <p>Don't cast Kill Shot during Mongoose Fury Unless Out of Focus!</p>
          </div>
        );
      } else if (!this.selectedCombatant.hasOwnBuff(SPELLS.MONGOOSE_FURY.id)) {
        value = QualitativePerformance.Good;
        perfExplanation = (
          <div>
            <h5 style={{ color: GoodColor }}>Good Cast</h5>
            <p>Cast Killshot outside of Mongoose Fury before starting another window.</p>
          </div>
        );
      } else {
        value = QualitativePerformance.Ok;
        perfExplanation = (
          <div>
            <h5 style={{ color: OkColor }}>Good Cast</h5>
            <p>
              Cast Killshot Inside Fury but at low focus. Try to avoid this situation with focus
              management.
            </p>
          </div>
        );
      }
    } else {
      if (focusAmount !== null && focusAmount < 30) {
        value = QualitativePerformance.Good;
        perfExplanation = (
          <div>
            <h5 style={{ color: GoodColor }}>Good Cast</h5>
            <p>Cast at {focusAmount} focus. Low focus cast or out of melee.</p>
          </div>
        );
      } else {
        value = QualitativePerformance.Fail;
        perfExplanation = (
          <h5 style={{ color: BadColor }}>
            Cast in single target above 30 focus.
            <br />
          </h5>
        );
      }
    }

    const tooltip = (
      <>
        {perfExplanation}@ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong> targetting{' '}
        <strong>{targetName || 'unknown'}</strong>
        <br />
      </>
    );

    this.useEntries.push({ value, tooltip });
  };

  get guideSubsectionSV(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.KILL_SHOT_SURVIVAL_TALENT} />
        </strong>{' '}
        should be only cast for lack of anything better to cast.
      </p>
    );

    const data = (
      <div>
        <CastSummaryAndBreakdown
          spell={TALENTS.KILL_SHOT_SURVIVAL_TALENT}
          castEntries={this.useEntries}
          badExtraExplanation={<>or an expired proc</>}
          usesInsteadOfCasts
        />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

export default KillShotSurvival;
