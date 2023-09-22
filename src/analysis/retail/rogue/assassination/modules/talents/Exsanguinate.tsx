import MajorCooldown, {
  createChecklistItem,
  SpellCast,
} from 'parser/core/MajorCooldowns/MajorCooldown';
import { SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import { ReactNode } from 'react';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import Events, { CastEvent, HasTarget } from 'parser/core/Events';
import { Trans } from '@lingui/macro';
import SpellLink from 'interface/SpellLink';
import Enemies from 'parser/shared/modules/Enemies';
import { isDefined } from 'common/typeGuards';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import GarroteUptimeAndSnapshots from '../spells/GarroteUptimeAndSnapshots';
import RuptureUptimeAndSnapshots from '../spells/RuptureUptimeAndSnapshots';
import { isInOpener } from 'analysis/retail/rogue/assassination/constants';
import { formatDurationMillisMinSec } from 'common/format';

const OK_DURATION_ON_GARROTE = 18000;
const FAIL_DURATION_ON_GARROTE = 6000;
const OK_DURATION_ON_RUPTURE = 32000;
const FAIL_DURATION_ON_RUPTURE = 10666;

interface ExsanguinateCast extends SpellCast {
  targetHadDeathmarkActiveOnCast: boolean;
  targetHadRuptureOnCast: boolean;
  targetHadGarroteOnCast: boolean;
  targetTimeLeftOnGarrote: number;
  targetTimeLeftOnRupture: number;
}

export default class Exsanguinate extends MajorCooldown<ExsanguinateCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    enemies: Enemies,
    garroteUptimeAndSnapshots: GarroteUptimeAndSnapshots,
    ruptureUptimeAndSnapshots: RuptureUptimeAndSnapshots,
  };

  protected enemies!: Enemies;
  protected garroteUptimeAndSnapshots!: GarroteUptimeAndSnapshots;
  protected ruptureUptimeAndSnapshots!: RuptureUptimeAndSnapshots;

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
          <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} />
        </strong>{' '}
        is a powerful cooldown that improves the damage of any existing bleeds on the target. Always
        use it when you have existing bleeds on the target.
        {this.selectedCombatant.hasTalent(TALENTS.DEATHMARK_TALENT) && (
          <>
            <br />
            Never use <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} /> while the target is affected
            by <SpellLink spell={TALENTS.DEATHMARK_TALENT} />, as it will reduce the duration of{' '}
            <SpellLink spell={TALENTS.DEATHMARK_TALENT} /> empowered bleeds.
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

    const checklistItems = [
      deathmarkChecklistItem,
      ruptureChecklistItem,
      garroteChecklistItem,
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
            Cast while target does not have <SpellLink spell={TALENTS.DEATHMARK_TALENT} />
          </div>
        ),
        details: (
          <div>
            You cast <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} /> while the target had{' '}
            <SpellLink spell={TALENTS.DEATHMARK_TALENT} />. Try not doing that.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Good,
      summary: (
        <div>
          Cast while target does not have <SpellLink spell={TALENTS.DEATHMARK_TALENT} />
        </div>
      ),
      details: (
        <div>
          You cast <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} /> while the target did not have{' '}
          <SpellLink spell={TALENTS.DEATHMARK_TALENT} />.
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
            Cast while target has {formatDurationMillisMinSec(OK_DURATION_ON_RUPTURE)}+ left on{' '}
            <SpellLink spell={SPELLS.RUPTURE} />
          </div>
        ),
        details: (
          <div>
            You cast <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} /> while the target did not have{' '}
            <SpellLink spell={SPELLS.RUPTURE} /> applied.
          </div>
        ),
      };
    }
    if (cast.targetTimeLeftOnRupture < FAIL_DURATION_ON_RUPTURE) {
      if (isInOpener(cast.event, this.owner.fight)) {
        return {
          performance: QualitativePerformance.Ok,
          summary: (
            <div>
              Cast while target has {formatDurationMillisMinSec(OK_DURATION_ON_RUPTURE)}+ left on{' '}
              <SpellLink spell={SPELLS.RUPTURE} />
            </div>
          ),
          details: (
            <div>
              You cast <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} /> while the target had{' '}
              {formatDurationMillisMinSec(cast.targetTimeLeftOnRupture)} left on{' '}
              <SpellLink spell={SPELLS.RUPTURE} />. You were in your opener, so this is okay.
            </div>
          ),
        };
      }
      return {
        performance: QualitativePerformance.Fail,
        summary: (
          <div>
            Cast while target has {formatDurationMillisMinSec(OK_DURATION_ON_RUPTURE)}+ left on{' '}
            <SpellLink spell={SPELLS.RUPTURE} />
          </div>
        ),
        details: (
          <div>
            You cast <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} /> while the target had{' '}
            {formatDurationMillisMinSec(cast.targetTimeLeftOnRupture)} left on{' '}
            <SpellLink spell={SPELLS.RUPTURE} />. Try to have{' '}
            {formatDurationMillisMinSec(OK_DURATION_ON_RUPTURE)}+ left on{' '}
            <SpellLink spell={SPELLS.RUPTURE} /> when casting{' '}
            <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} />.
          </div>
        ),
      };
    }
    if (cast.targetTimeLeftOnRupture < OK_DURATION_ON_RUPTURE) {
      if (isInOpener(cast.event, this.owner.fight)) {
        return {
          performance: QualitativePerformance.Ok,
          summary: (
            <div>
              Cast while target has {formatDurationMillisMinSec(OK_DURATION_ON_RUPTURE)}+ left on{' '}
              <SpellLink spell={SPELLS.RUPTURE} />
            </div>
          ),
          details: (
            <div>
              You cast <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} /> while the target had{' '}
              {formatDurationMillisMinSec(cast.targetTimeLeftOnRupture)} left on{' '}
              <SpellLink spell={SPELLS.RUPTURE} />. You were in your opener, so this is okay.
            </div>
          ),
        };
      }
      return {
        performance: QualitativePerformance.Ok,
        summary: (
          <div>
            Cast while target has {formatDurationMillisMinSec(OK_DURATION_ON_RUPTURE)}+ left on{' '}
            <SpellLink spell={SPELLS.RUPTURE} />
          </div>
        ),
        details: (
          <div>
            You cast <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} /> while the target had{' '}
            {formatDurationMillisMinSec(cast.targetTimeLeftOnRupture)} left on{' '}
            <SpellLink spell={SPELLS.RUPTURE} />. Try to have{' '}
            {formatDurationMillisMinSec(OK_DURATION_ON_RUPTURE)}+ left on{' '}
            <SpellLink spell={SPELLS.RUPTURE} /> when casting{' '}
            <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} />.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Good,
      summary: (
        <div>
          Cast while target has {formatDurationMillisMinSec(OK_DURATION_ON_RUPTURE)}+ left on{' '}
          <SpellLink spell={SPELLS.RUPTURE} />
        </div>
      ),
      details: (
        <div>
          You cast <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} /> while the target had{' '}
          {formatDurationMillisMinSec(cast.targetTimeLeftOnRupture)} left on{' '}
          <SpellLink spell={SPELLS.RUPTURE} />.
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
            Cast while target has {formatDurationMillisMinSec(OK_DURATION_ON_GARROTE)}+ left on{' '}
            <SpellLink spell={SPELLS.GARROTE} />
          </div>
        ),
        details: (
          <div>
            You cast <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} /> while the target did not have{' '}
            <SpellLink spell={SPELLS.GARROTE} /> applied.
          </div>
        ),
      };
    }
    if (cast.targetTimeLeftOnGarrote < FAIL_DURATION_ON_GARROTE) {
      if (isInOpener(cast.event, this.owner.fight)) {
        return {
          performance: QualitativePerformance.Ok,
          summary: (
            <div>
              Cast while target has {formatDurationMillisMinSec(OK_DURATION_ON_GARROTE)}+ left on{' '}
              <SpellLink spell={SPELLS.GARROTE} />
            </div>
          ),
          details: (
            <div>
              You cast <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} /> while the target had{' '}
              {formatDurationMillisMinSec(cast.targetTimeLeftOnGarrote)} left on{' '}
              <SpellLink spell={SPELLS.GARROTE} />. You were in your opener, so this is okay.
            </div>
          ),
        };
      }
      return {
        performance: QualitativePerformance.Fail,
        summary: (
          <div>
            Cast while target has {formatDurationMillisMinSec(OK_DURATION_ON_GARROTE)}+ left on{' '}
            <SpellLink spell={SPELLS.GARROTE} />
          </div>
        ),
        details: (
          <div>
            You cast <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} /> while the target had{' '}
            {formatDurationMillisMinSec(cast.targetTimeLeftOnGarrote)} left on{' '}
            <SpellLink spell={SPELLS.GARROTE} />. Try to have{' '}
            {formatDurationMillisMinSec(OK_DURATION_ON_GARROTE)}+ left on{' '}
            <SpellLink spell={SPELLS.GARROTE} /> when casting{' '}
            <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} />.
          </div>
        ),
      };
    }
    if (cast.targetTimeLeftOnGarrote < OK_DURATION_ON_GARROTE) {
      if (isInOpener(cast.event, this.owner.fight)) {
        return {
          performance: QualitativePerformance.Ok,
          summary: (
            <div>
              Cast while target has {formatDurationMillisMinSec(OK_DURATION_ON_GARROTE)}+ left on{' '}
              <SpellLink spell={SPELLS.GARROTE} />
            </div>
          ),
          details: (
            <div>
              You cast <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} /> while the target had{' '}
              {formatDurationMillisMinSec(cast.targetTimeLeftOnGarrote)} left on{' '}
              <SpellLink spell={SPELLS.GARROTE} />. You were in your opener, so this is okay.
            </div>
          ),
        };
      }
      return {
        performance: QualitativePerformance.Ok,
        summary: (
          <div>
            Cast while target has {formatDurationMillisMinSec(OK_DURATION_ON_GARROTE)}+ left on{' '}
            <SpellLink spell={SPELLS.GARROTE} />
          </div>
        ),
        details: (
          <div>
            You cast <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} /> while the target had{' '}
            {formatDurationMillisMinSec(cast.targetTimeLeftOnGarrote)} left on{' '}
            <SpellLink spell={SPELLS.GARROTE} />. Try to have{' '}
            {formatDurationMillisMinSec(OK_DURATION_ON_GARROTE)}+ left on{' '}
            <SpellLink spell={SPELLS.GARROTE} /> when casting{' '}
            <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} />.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Good,
      summary: (
        <div>
          Cast while target has {formatDurationMillisMinSec(OK_DURATION_ON_GARROTE)}+ left on{' '}
          <SpellLink spell={SPELLS.GARROTE} />
        </div>
      ),
      details: (
        <div>
          You cast <SpellLink spell={TALENTS.EXSANGUINATE_TALENT} /> while the target had{' '}
          {formatDurationMillisMinSec(cast.targetTimeLeftOnGarrote)} left on{' '}
          <SpellLink spell={SPELLS.GARROTE} />.
        </div>
      ),
    };
  }

  private onCast(event: CastEvent) {
    const enemy = this.enemies.getEntity(event);
    const targetHadDeathmarkActiveOnCast =
      enemy?.hasBuff(TALENTS.DEATHMARK_TALENT.id, event.timestamp) ?? false;
    const targetHadGarroteOnCast = enemy?.hasBuff(SPELLS.GARROTE.id, event.timestamp) ?? false;
    const targetHadRuptureOnCast = enemy?.hasBuff(SPELLS.RUPTURE.id, event.timestamp) ?? false;
    const targetTimeLeftOnGarrote = HasTarget(event)
      ? this.garroteUptimeAndSnapshots.getTimeRemaining(event)
      : 0;
    const targetTimeLeftOnRupture = HasTarget(event)
      ? this.ruptureUptimeAndSnapshots.getTimeRemaining(event)
      : 0;
    this.recordCooldown({
      event,
      targetHadDeathmarkActiveOnCast,
      targetHadRuptureOnCast,
      targetHadGarroteOnCast,
      targetTimeLeftOnGarrote,
      targetTimeLeftOnRupture,
    });
  }
}
