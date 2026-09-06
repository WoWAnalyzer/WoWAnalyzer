import { formatPercentage } from 'common/format';
import DK_SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  SummonEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
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

class Putrefy extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  private chargesSpentDuringDarkTransformation = 0;
  private chargesSpentOutsideDarkTransformation = 0;
  private readonly entries: PutrefyCastEntry[] = [];

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
    const explanation = (
      <>
        <p>
          Prioritize <SpellLink spell={TALENTS.PUTREFY_TALENT} /> during{' '}
          <SpellLink spell={DK_SPELLS.DARK_TRANSFORMATION_BUFF} />. Plan your charge spending around
          these windows so you have Putrefy available when Dark Transformation is active.
        </p>
        <p>
          Review outside-window casts in the timeline below. The details show Dark Transformation's
          estimated cooldown, your Putrefy charges before the cast, and the time until the next
          charge. Use this context to consider whether waiting would have left you at maximum
          charges with recharge time going unused. Also consider whether the target was about to
          become unavailable or the fight was ending.
        </p>
        <p>
          If you could have waited without losing a use or wasting recharge time, aim to move that
          cast into Dark Transformation next time. If waiting would have cost an opportunity,
          spending outside the window may have been reasonable. Use the breakdown to find casts to
          review; 100% alignment is not a goal at the expense of useful casts.
        </p>
      </>
    );
    const data = (
      <div>
        <p>
          <strong>{this.alignmentLabel}</strong> of charges spent during Dark Transformation
        </p>
        {this.totalChargesSpent === 0 && <p>No observed charges spent.</p>}
        {this.totalChargesSpent > 0 && (
          <PutrefyTimeline
            entries={this.entries.filter((entry) => !entry.duringDarkTransformation)}
            fightStart={this.owner.fight.start_time}
            fightEnd={this.owner.fight.end_time}
            formatTimestamp={(timestamp) => this.owner.formatTimestamp(timestamp)}
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
