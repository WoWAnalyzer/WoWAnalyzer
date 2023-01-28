import MajorCooldown, {
  createChecklistItem,
  SpellCast,
} from 'parser/core/MajorCooldowns/MajorCooldown';
import { SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import { ReactNode } from 'react';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import Events, { CastEvent } from 'parser/core/Events';
import { Trans } from '@lingui/macro';
import SpellLink from 'interface/SpellLink';
import Enemies from 'parser/shared/modules/Enemies';
import { isDefined } from 'common/typeGuards';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

interface ExsanguinateCast extends SpellCast {
  targetHadDeathmarkActiveOnCast: boolean;
  targetHadRuptureOnCast: boolean;
  targetHadGarroteOnCast: boolean;
  targetHadCrimsonTempestOnCast: boolean;
}

export default class Exsanguinate extends MajorCooldown<ExsanguinateCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  constructor(options: Options) {
    super({ spell: TALENTS.EXSANGUINATE_TALENT }, options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.EXSANGUINATE_TALENT),
      this.onCast,
    );
  }

  description(): ReactNode {
    return (
      <Trans id="guide.rogue.assassination.sections.cooldowns.exsanguinate.explanation">
        <strong>
          <SpellLink id={TALENTS.EXSANGUINATE_TALENT} />
        </strong>{' '}
        is a powerful cooldown that improves the damage of any existing bleeds on the target. Always
        use it when you have existing bleeds on the target.
        {this.selectedCombatant.hasTalent(TALENTS.DEATHMARK_TALENT) && (
          <>
            <br />
            Never use <SpellLink id={TALENTS.EXSANGUINATE_TALENT} /> while the target is affected by{' '}
            <SpellLink id={TALENTS.DEATHMARK_TALENT} />, as it will reduce the duration of{' '}
            <SpellLink id={TALENTS.DEATHMARK_TALENT} /> empowered bleeds.
          </>
        )}
      </Trans>
    );
  }

  explainPerformance(cast: ExsanguinateCast): SpellUse {
    const deathmarkChecklistItem = createChecklistItem(
      'deathmark',
      cast,
      this.deathmarkPerformance(cast),
    );
    const ruptureChecklistItem = createChecklistItem(
      'rupture',
      cast,
      this.rupturePerformance(cast),
    );
    const garroteChecklistItem = createChecklistItem(
      'garrote',
      cast,
      this.garrotePerformance(cast),
    );
    const crimsonTempestChecklistItem = createChecklistItem(
      'crimsonTempest',
      cast,
      this.crimsonTempestPerformance(cast),
    );

    const checklistItems = [
      deathmarkChecklistItem,
      ruptureChecklistItem,
      garroteChecklistItem,
      crimsonTempestChecklistItem,
    ].filter(isDefined);
    const performance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );

    // TODO also highlight 'bad' Exsanguinates in the timeline

    return {
      event: cast.event,
      checklistItems: checklistItems,
      performance: performance,
      performanceExplanation:
        performance !== QualitativePerformance.Fail ? `${performance} Usage` : 'Bad Usage',
    };
  }

  private deathmarkPerformance(cast: ExsanguinateCast): UsageInfo | undefined {
    if (!this.selectedCombatant.hasTalent(TALENTS.DEATHMARK_TALENT)) {
      return undefined;
    }

    if (cast.targetHadDeathmarkActiveOnCast) {
      return {
        performance: QualitativePerformance.Fail,
        summary: (
          <div>
            Cast while target does not have <SpellLink id={TALENTS.DEATHMARK_TALENT} />
          </div>
        ),
        details: (
          <div>
            You cast <SpellLink id={TALENTS.EXSANGUINATE_TALENT} /> while the target had{' '}
            <SpellLink id={TALENTS.DEATHMARK_TALENT} />. Try not doing that.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Good,
      summary: (
        <div>
          Cast while target does not have <SpellLink id={TALENTS.DEATHMARK_TALENT} />
        </div>
      ),
      details: (
        <div>
          You cast <SpellLink id={TALENTS.EXSANGUINATE_TALENT} /> while the target did not have{' '}
          <SpellLink id={TALENTS.DEATHMARK_TALENT} />.
        </div>
      ),
    };
  }

  private rupturePerformance(cast: ExsanguinateCast): UsageInfo | undefined {
    if (!cast.targetHadRuptureOnCast) {
      return {
        performance: QualitativePerformance.Fail,
        summary: (
          <div>
            Cast while target has <SpellLink id={SPELLS.RUPTURE} /> applied
          </div>
        ),
        details: (
          <div>
            You cast <SpellLink id={TALENTS.EXSANGUINATE_TALENT} /> while the target did not have{' '}
            <SpellLink id={SPELLS.RUPTURE} /> applied.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Good,
      summary: (
        <div>
          Cast while target has <SpellLink id={SPELLS.RUPTURE} /> applied
        </div>
      ),
      details: (
        <div>
          You cast <SpellLink id={TALENTS.EXSANGUINATE_TALENT} /> while the target had{' '}
          <SpellLink id={SPELLS.RUPTURE} /> applied.
        </div>
      ),
    };
  }

  private garrotePerformance(cast: ExsanguinateCast): UsageInfo | undefined {
    if (!cast.targetHadGarroteOnCast) {
      return {
        performance: QualitativePerformance.Fail,
        summary: (
          <div>
            Cast while target has <SpellLink id={SPELLS.GARROTE} /> applied
          </div>
        ),
        details: (
          <div>
            You cast <SpellLink id={TALENTS.EXSANGUINATE_TALENT} /> while the target did not have{' '}
            <SpellLink id={SPELLS.GARROTE} /> applied.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Good,
      summary: (
        <div>
          Cast while target has <SpellLink id={SPELLS.GARROTE} /> applied
        </div>
      ),
      details: (
        <div>
          You cast <SpellLink id={TALENTS.EXSANGUINATE_TALENT} /> while the target had{' '}
          <SpellLink id={SPELLS.GARROTE} /> applied.
        </div>
      ),
    };
  }

  private crimsonTempestPerformance(cast: ExsanguinateCast): UsageInfo | undefined {
    if (!this.selectedCombatant.hasTalent(TALENTS.CRIMSON_TEMPEST_TALENT)) {
      return undefined;
    }
    if (!cast.targetHadCrimsonTempestOnCast) {
      return {
        performance: QualitativePerformance.Ok,
        summary: (
          <div>
            Cast while target has <SpellLink id={TALENTS.CRIMSON_TEMPEST_TALENT} /> applied
          </div>
        ),
        details: (
          <div>
            You cast <SpellLink id={TALENTS.EXSANGUINATE_TALENT} /> while the target did not have{' '}
            <SpellLink id={TALENTS.CRIMSON_TEMPEST_TALENT} /> applied.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Good,
      summary: (
        <div>
          Cast while target has <SpellLink id={TALENTS.CRIMSON_TEMPEST_TALENT} /> applied
        </div>
      ),
      details: (
        <div>
          You cast <SpellLink id={TALENTS.EXSANGUINATE_TALENT} /> while the target had{' '}
          <SpellLink id={TALENTS.CRIMSON_TEMPEST_TALENT} /> applied.
        </div>
      ),
    };
  }

  private onCast(event: CastEvent) {
    const enemy = this.enemies.getEntity(event);
    const targetHadDeathmarkActiveOnCast =
      enemy?.hasBuff(TALENTS.DEATHMARK_TALENT.id, event.timestamp) ?? false;
    const targetHadRuptureOnCast = enemy?.hasBuff(SPELLS.RUPTURE.id, event.timestamp) ?? false;
    const targetHadGarroteOnCast = enemy?.hasBuff(SPELLS.GARROTE.id, event.timestamp) ?? false;
    const targetHadCrimsonTempestOnCast =
      enemy?.hasBuff(TALENTS.CRIMSON_TEMPEST_TALENT.id, event.timestamp) ?? false;

    this.recordCooldown({
      event,
      targetHadDeathmarkActiveOnCast,
      targetHadRuptureOnCast,
      targetHadGarroteOnCast,
      targetHadCrimsonTempestOnCast,
    });
  }
}
