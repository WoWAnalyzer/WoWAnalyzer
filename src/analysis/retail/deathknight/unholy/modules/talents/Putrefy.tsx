import { formatPercentage } from 'common/format';
import DK_SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  SummonEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import type { JSX } from 'react';
import SpellUsable from '../core/SpellUsable';
import PutrefyTimeline, { PutrefyCastEntry } from '../guide/PutrefyTimeline';

// Cooldown reduction (in milliseconds) applied to Putrefy when Harbinger of Doom summons a Lesser Ghoul
const HARBINGER_OF_DOOM_PUTREFY_CDR_MS = 2500;
// A prompt follow-up, allowing several GCDs for the logged disease restoration.
const BLIGHTFALL_FOLLOWUP_MS = 5000;

class Putrefy extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
  enemies: Enemies,
}) {
  private chargesSpentDuringDarkTransformation = 0;
  private chargesSpentOutsideDarkTransformation = 0;
  private readonly entries: Omit<PutrefyCastEntry, 'performance' | 'reason'>[] = [];
  private pendingBlightfall: CastEvent | null = null;
  private readonly blightfallFollowups = new Set<number>();
  private readonly darkTransformationCasts: number[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PUTREFY_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(TALENTS.PUTREFY_TALENT),
      this.onPutrefyCooldownUpdate,
    );

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          TALENTS.BLIGHTFALL_TALENT,
          TALENTS.PUTREFY_TALENT,
          TALENTS.DARK_TRANSFORMATION_TALENT,
          DK_SPELLS.OUTBREAK,
        ]),
      this.onCast,
    );

    if (this.selectedCombatant.hasTalent(TALENTS.HARBINGER_OF_DOOM_TALENT)) {
      this.addEventListener(
        Events.summon.by(SELECTED_PLAYER).spell(DK_SPELLS.LESSER_GHOUL),
        this.onHarbingerOfDoomLesserGhoulSummon,
      );
    }
  }

  private onPutrefyCooldownUpdate(event: UpdateSpellUsableEvent) {
    if (
      event.updateType !== UpdateSpellUsableType.BeginCooldown &&
      event.updateType !== UpdateSpellUsableType.UseCharge
    ) {
      return;
    }

    const duringDarkTransformation = this.selectedCombatant.hasBuff(
      DK_SPELLS.DARK_TRANSFORMATION_BUFF,
    );
    if (duringDarkTransformation) {
      this.chargesSpentDuringDarkTransformation += 1;
    } else {
      this.chargesSpentOutsideDarkTransformation += 1;
    }
    // Putrid Echoes emits one update per charge spent. Keep the state before the
    // first charge was spent and display a single entry for the cast.
    const previousEntry = this.entries.at(-1);
    if (previousEntry?.timestamp === event.timestamp) {
      previousEntry.chargesSpent += 1;
      return;
    }

    const chargesBeforeCast = event.chargesAvailable + 1;
    this.entries.push({
      timestamp: event.timestamp,
      duringDarkTransformation,
      duringForbiddenKnowledge:
        this.selectedCombatant.hasTalent(TALENTS.FORBIDDEN_KNOWLEDGE_1_UNHOLY_TALENT) &&
        this.selectedCombatant.hasBuff(DK_SPELLS.FORBIDDEN_KNOWLEDGE_BUFF),
      chargesSpent: 1,
      chargesBeforeCast,
      maxCharges: event.maxCharges,
      darkTransformationCooldownRemaining: Math.max(
        0,
        this.deps.spellUsable.cooldownRemaining(
          TALENTS.DARK_TRANSFORMATION_TALENT.id,
          event.timestamp,
        ),
      ),
      // Beginning a cooldown means the player was capped before this cast;
      // its new recharge timer does not describe the pre-cast state.
      nextChargeRemaining:
        chargesBeforeCast === event.maxCharges
          ? null
          : Math.max(0, event.expectedRechargeTimestamp - event.timestamp),
    });
  }

  private onCast(event: CastEvent) {
    if (event.ability.guid === TALENTS.DARK_TRANSFORMATION_TALENT.id) {
      this.darkTransformationCasts.push(event.timestamp);
      this.pendingBlightfall = null;
      return;
    }
    if (event.ability.guid === TALENTS.BLIGHTFALL_TALENT.id) {
      if (
        this.selectedCombatant.hasTalent(TALENTS.BLIGHTFALL_TALENT) &&
        this.selectedCombatant.hasTalent(TALENTS.BLIGHTBURST_TALENT)
      ) {
        this.pendingBlightfall = event;
      }
      return;
    }
    if (event.ability.guid === DK_SPELLS.OUTBREAK.id) {
      if (event.targetID === this.pendingBlightfall?.targetID) {
        this.pendingBlightfall = null;
      }
      return;
    }

    const blightfall = this.pendingBlightfall;
    this.pendingBlightfall = null; // Only the first Putrefy can restore these plagues.
    const target = this.deps.enemies.getEntity(event);
    if (
      blightfall &&
      event.timestamp - blightfall.timestamp <= BLIGHTFALL_FOLLOWUP_MS &&
      event.targetID === blightfall.targetID &&
      target &&
      (!target.hasBuff(DK_SPELLS.DREAD_PLAGUE.id) || !target.hasBuff(DK_SPELLS.VIRULENT_PLAGUE.id))
    ) {
      this.blightfallFollowups.add(event.timestamp);
    }
  }

  private get gradedEntries(): PutrefyCastEntry[] {
    // Rotation sources (12.1): Wowhead's Forbidden Knowledge priority and
    // Icy Veins' Putrefy/Blightfall sections. Charge capping alone is not an exception.
    // https://www.wowhead.com/guide/classes/death-knight/unholy/rotation-cooldowns-pve-dps
    // https://www.icy-veins.com/wow/unholy-death-knight-pve-dps-rotation-cooldowns-abilities
    return this.entries.map((entry) => {
      let performance = QualitativePerformance.Fail;
      let reason =
        entry.darkTransformationCooldownRemaining === 0
          ? 'Dark Transformation was available. Activate it before spending Putrefy to include this cast in your damage window.'
          : 'Save this charge for Dark Transformation. Being at maximum charges alone is not a reason to spend between windows.';
      if (entry.duringDarkTransformation) {
        performance = QualitativePerformance.Perfect;
        reason =
          'You spent Putrefy during Dark Transformation. Keep concentrating your charges in this window.';
      } else if (!this.selectedCombatant.hasTalent(TALENTS.DARK_TRANSFORMATION_TALENT)) {
        performance = QualitativePerformance.Good;
        reason =
          'Dark Transformation is not talented, so this cast has no DT alignment requirement.';
      } else if (this.blightfallFollowups.has(entry.timestamp)) {
        performance = QualitativePerformance.Good;
        reason =
          'You used Putrefy promptly after Blightfall on the same target while plagues were missing. Blightburst restores those plagues.';
      } else if (entry.duringForbiddenKnowledge) {
        performance = QualitativePerformance.Good;
        reason =
          'Forbidden Knowledge was active, so spending Putrefy follows its cooldown-window priority. Army/DT alignment is assessed separately when Commander of the Dead is talented.';
      } else if (
        entry.darkTransformationCooldownRemaining > this.owner.fight.end_time - entry.timestamp &&
        !this.darkTransformationCasts.some((timestamp) => timestamp > entry.timestamp)
      ) {
        performance = QualitativePerformance.Good;
        reason =
          'Dark Transformation was not expected to recharge before the fight ended, and no later DT cast was recorded. Spending this charge avoided leaving it unused.';
      }
      return { ...entry, performance, reason };
    });
  }

  private onHarbingerOfDoomLesserGhoulSummon(_event: SummonEvent) {
    this.deps.spellUsable.reduceCooldown(
      TALENTS.PUTREFY_TALENT.id,
      HARBINGER_OF_DOOM_PUTREFY_CDR_MS,
    );
  }

  get totalChargesSpent(): number {
    return this.chargesSpentDuringDarkTransformation + this.chargesSpentOutsideDarkTransformation;
  }

  get efficiency(): number | null {
    return this.totalChargesSpent > 0
      ? 1 - this.chargesSpentOutsideDarkTransformation / this.totalChargesSpent
      : null;
  }

  private get breakdownItems() {
    return [
      {
        color: '#60a5fa',
        label: (
          <SpellLink spell={DK_SPELLS.DARK_TRANSFORMATION_BUFF}>
            During Dark Transformation
          </SpellLink>
        ),
        value: this.chargesSpentDuringDarkTransformation,
        valuePercent: false,
        valueTooltip: (
          <>
            {this.chargesSpentDuringDarkTransformation} <SpellLink spell={TALENTS.PUTREFY_TALENT} />{' '}
            charges spent during <SpellLink spell={DK_SPELLS.DARK_TRANSFORMATION_BUFF} />
          </>
        ),
      },
      {
        color: '#94a3b8',
        label: (
          <SpellLink spell={DK_SPELLS.DARK_TRANSFORMATION_BUFF}>
            Outside Dark Transformation
          </SpellLink>
        ),
        value: this.chargesSpentOutsideDarkTransformation,
        valuePercent: false,
        valueTooltip: (
          <>
            {this.chargesSpentOutsideDarkTransformation}{' '}
            <SpellLink spell={TALENTS.PUTREFY_TALENT} /> charges spent outside{' '}
            <SpellLink spell={DK_SPELLS.DARK_TRANSFORMATION_BUFF} />
          </>
        ),
      },
    ];
  }

  private get alignmentLabel(): string {
    return this.efficiency === null ? 'N/A' : `${formatPercentage(this.efficiency, 0)}%`;
  }

  get guideSubsection(): JSX.Element {
    const hasDarkTransformation = this.selectedCombatant.hasTalent(
      TALENTS.DARK_TRANSFORMATION_TALENT,
    );
    const explanation = (
      <>
        <p>
          {hasDarkTransformation ? (
            <>
              Concentrate <SpellLink spell={TALENTS.PUTREFY_TALENT} /> charges during{' '}
              <SpellLink spell={DK_SPELLS.DARK_TRANSFORMATION_BUFF} />. Save charges between
              windows, even at maximum charges, so you can spend them during your next damage
              window.
            </>
          ) : (
            <>
              Use <SpellLink spell={TALENTS.PUTREFY_TALENT} /> regularly. Your build has no Dark
              Transformation window to hold charges for.
            </>
          )}
        </p>
        {this.selectedCombatant.hasTalent(TALENTS.FORBIDDEN_KNOWLEDGE_1_UNHOLY_TALENT) && (
          <p>
            During <SpellLink spell={TALENTS.FORBIDDEN_KNOWLEDGE_1_UNHOLY_TALENT} />, use Putrefy as
            it becomes available, including if Dark Transformation has ended.
          </p>
        )}
        {this.selectedCombatant.hasTalent(TALENTS.BLIGHTFALL_TALENT) &&
          this.selectedCombatant.hasTalent(TALENTS.BLIGHTBURST_TALENT) && (
            <p>
              After <SpellLink spell={TALENTS.BLIGHTFALL_TALENT} /> consumes your plagues, follow up
              with Putrefy to restore them through <SpellLink spell={TALENTS.BLIGHTBURST_TALENT} />.
            </p>
          )}
        <p>
          The cast review explains each timing grade. It also recognizes charges spent when DT could
          not recharge before the fight ended. Target downtime can still affect whether a flagged
          cast was avoidable.
        </p>
      </>
    );
    const data = (
      <div>
        {hasDarkTransformation && (
          <p>
            <strong>{this.alignmentLabel}</strong> of charges spent during Dark Transformation
          </p>
        )}
        {this.totalChargesSpent === 0 && <p>No observed charges spent.</p>}
        {this.totalChargesSpent > 0 && (
          <PutrefyTimeline
            entries={this.gradedEntries}
            fightStart={this.owner.fight.start_time}
            fightEnd={this.owner.fight.end_time}
            formatTimestamp={(timestamp) => this.owner.formatTimestamp(timestamp)}
            hasDarkTransformation={hasDarkTransformation}
          />
        )}
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 40);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.PUTREFY_TALENT}>
          <div>
            {this.alignmentLabel} <small>of charges spent during Dark Transformation</small>
          </div>
        </BoringSpellValueText>
        <div style={{ padding: '8px' }}>
          <DonutChart items={this.breakdownItems} />
        </div>
      </Statistic>
    );
  }
}

export default Putrefy;
