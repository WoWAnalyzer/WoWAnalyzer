import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
  RefreshDebuffEvent,
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import { SpellLink } from 'interface';
import { SpellUse, ChecklistUsageInfo } from 'parser/core/SpellUsage/core';
import { createChecklistItem, createSpellUse } from 'parser/core/MajorCooldowns/MajorCooldown';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { HideGoodCastsSpellUsageSubSection } from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { logSpellUseEvent } from 'parser/core/SpellUsage/SpellUsageSubSection';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Enemies from 'parser/shared/modules/Enemies';
import { TrackedBuffEvent } from 'parser/core/Entity';
import { getRuptureDuration } from 'analysis/retail/rogue/subtlety/constants';

export default class RuptureUptime extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    enemies: Enemies,
  };

  private cooldownUses: SpellUse[] = [];
  private spellUsable!: SpellUsable;
  private enemies!: Enemies;
  private ruptureEnd: number = 0;
  private firstRupture: boolean = true;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RUPTURE), this.onCast);
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.RUPTURE} />
        </strong>{' '}
        should be maintained on the target at all times for optimal energy regeneration. Ensure you
        are refreshing it at the right time and not letting it drop.
      </p>
    );

    const goodCasts = this.cooldownUses.filter(
      (it) => it.performance === QualitativePerformance.Good,
    ).length;
    const totalCasts = this.cooldownUses.length;

    return (
      <HideGoodCastsSpellUsageSubSection
        hideGoodCasts={false}
        explanation={explanation}
        uses={this.cooldownUses}
        castBreakdownSmallText={<> - Red indicates bad Rupture usage.</>}
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={
          <div style={{ marginBottom: 10 }}>
            <CastPerformanceSummary
              spell={SPELLS.RUPTURE}
              casts={goodCasts}
              performance={
                this.cooldownUses.length > 0
                  ? this.cooldownUses[0].performance
                  : QualitativePerformance.Fail
              }
              totalCasts={totalCasts}
            />
          </div>
        }
        noCastsTexts={{
          noCastsOverride: 'No Rupture casts detected! This is a major mistake.',
        }}
      />
    );
  }

  private onCast(event: CastEvent) {
    const comboPointsAtCast = event.classResources ? event.classResources[1].amount : 0;
    const targetedEnemy =
      event.targetID !== undefined ? this.enemies.getById(event.targetID) : null;
    const buffHistory = targetedEnemy?.getBuffHistory(SPELLS.RUPTURE.id, event.sourceID);

    this.cooldownUses.push(
      createSpellUse({ event }, [
        this.comboPointPerformance(event, comboPointsAtCast),
        buffHistory ? this.rupturePerformance(event, buffHistory) : undefined,
      ]),
    );
  }

  private comboPointPerformance(
    event: CastEvent,
    comboPointsAtCast: number,
  ): ChecklistUsageInfo | undefined {
    const isGoodCP = comboPointsAtCast > 5;

    return createChecklistItem(
      'rupture_cp',
      { event },
      {
        performance: isGoodCP ? QualitativePerformance.Good : QualitativePerformance.Fail,
        summary: <div>Combo Point Management</div>,
        details: isGoodCP ? (
          <div>
            You used <SpellLink spell={SPELLS.RUPTURE} /> optimally with {comboPointsAtCast} combo
            points.
          </div>
        ) : (
          <div>
            You used <SpellLink spell={SPELLS.RUPTURE} /> at {comboPointsAtCast} combo points. Try
            to use it at 6 or more CP for a finisher**.
          </div>
        ),
      },
    );
  }

  private rupturePerformance(
    event: CastEvent,
    buffHistory: TrackedBuffEvent[],
  ): ChecklistUsageInfo | undefined {
    let performance: QualitativePerformance;
    const fightStartTime = this.owner.fight.start_time;
    let refresh = false;
    let refreshTime = 0;
    let timeToFirstRupture = 0;
    let gap = false;
    const beginningRupture = this.firstRupture;

    if (this.firstRupture) {
      timeToFirstRupture = (event.timestamp - fightStartTime) / 1000;
    }

    if (buffHistory.length === 0) {
      this.ruptureEnd = event.timestamp + getRuptureDuration(this.selectedCombatant, event);
    } else {
      refreshTime = (-1 * (event.timestamp - this.ruptureEnd)) / 1000;
      this.ruptureEnd = event.timestamp + getRuptureDuration(this.selectedCombatant, event);
      refresh = true;
    }

    if (refreshTime < 9 && refreshTime > 0 && refresh) {
      // Rupture was refreshed with less than 9 seconds remaining
      performance = QualitativePerformance.Perfect;
    } else if (this.firstRupture && timeToFirstRupture < 10) {
      // First Rupture was cast within 10 seconds of the fight starting
      performance = QualitativePerformance.Perfect;
      this.firstRupture = false;
    } else if (refreshTime < 16 && refreshTime > 0 && refresh) {
      // Rupture was refreshed with less than 16 seconds remaining
      performance = QualitativePerformance.Good;
    } else if (this.firstRupture && timeToFirstRupture < 15) {
      // First Rupture was cast within 15 seconds of the fight starting
      performance = QualitativePerformance.Good;
      this.firstRupture = false;
    } else if (refreshTime < 0 && refreshTime > -10) {
      // Rupture was missing for less than 10 seconds
      performance = QualitativePerformance.Good;
      gap = true;
    } else if (refreshTime < 20 && refreshTime > 0 && refresh) {
      // Rupture was refreshed with less than 20 seconds remaining
      performance = QualitativePerformance.Ok;
    } else if (this.firstRupture && timeToFirstRupture < 20) {
      // First Rupture was cast within 20 seconds of the fight starting
      performance = QualitativePerformance.Ok;
      this.firstRupture = false;
    } else if (refreshTime < 0 && refreshTime > -15) {
      // Rupture was missing for less than 15 seconds
      performance = QualitativePerformance.Ok;
      gap = true;
    } else {
      performance = QualitativePerformance.Fail;
    }

    return createChecklistItem(
      'rupture_performance',
      { event },
      {
        performance,
        summary: <div>Rupture Usage</div>,
        details: (
          <div>
            {performance === QualitativePerformance.Perfect && beginningRupture ? (
              <>
                ✔ The first cast of <SpellLink spell={SPELLS.RUPTURE} /> was within 10 seconds of
                the fight starting.
              </>
            ) : performance === QualitativePerformance.Perfect ? (
              <>
                <SpellLink spell={SPELLS.RUPTURE} /> uptime was perfect with no significant gaps or
                premature refreshes.
              </>
            ) : performance === QualitativePerformance.Good && beginningRupture ? (
              <>
                The first cast of <SpellLink spell={SPELLS.RUPTURE} /> took more than 10 seconds
                into the fight. It should be cast within 10 seconds of the fight starting.
              </>
            ) : performance === QualitativePerformance.Good && gap ? (
              <>
                <SpellLink spell={SPELLS.RUPTURE} /> was missing for less than 10 seconds. Try to
                minimize gaps in uptime.
              </>
            ) : performance === QualitativePerformance.Good ? (
              <>
                <SpellLink spell={SPELLS.RUPTURE} /> was refreshed with less than 16 seconds
                remaining. It should be refreshed with less than 9 seconds remaining.
              </>
            ) : performance === QualitativePerformance.Ok && beginningRupture ? (
              <>
                The first cast of <SpellLink spell={SPELLS.RUPTURE} /> took more than 15 seconds
                into the fight. It should be cast within 10 seconds of the fight starting.
              </>
            ) : performance === QualitativePerformance.Ok && gap ? (
              <>
                <SpellLink spell={SPELLS.RUPTURE} /> was missing for less than 15 seconds. Try to
                minimize gaps in uptime.
              </>
            ) : performance === QualitativePerformance.Ok ? (
              <>
                <SpellLink spell={SPELLS.RUPTURE} /> was refreshed with less than 20 seconds
                remaining. It should be refreshed with less than 9 seconds remaining.
              </>
            ) : (
              <>
                <SpellLink spell={SPELLS.RUPTURE} /> usage was poor. Try to maintain better uptime.
              </>
            )}
          </div>
        ),
      },
    );
  }
}
