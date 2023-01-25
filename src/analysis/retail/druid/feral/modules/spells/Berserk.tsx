import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { SpellIcon, SpellLink, Tooltip } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventFilter from 'parser/core/EventFilter';
import Events, {
  CastEvent,
  DamageEvent,
  EventType,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { cdSpell, CONVOKE_FB_CPS, FINISHERS } from 'analysis/retail/druid/feral/constants';
import { TALENTS_DRUID } from 'common/TALENTS';
import { formatNumber, formatPercentage } from 'common/format';
import getResourceSpent from 'parser/core/getResourceSpent';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { isConvoking } from 'analysis/retail/druid/shared/spells/ConvokeSpirits';
import EnergyTracker from 'analysis/retail/druid/feral/modules/core/energy/EnergyTracker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PassFailCheckmark, PerformanceMark } from 'interface/guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import InformationIcon from 'interface/icons/Information';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';

const BERSERK_CDR_MS = 700;
const BERSERK_HARDCAST_DURATION = 20_000;
const INCARN_HARDCAST_DURATION = 30_000;

/**
 * This tracks Berserk and its 'upgrade' talents, and produces guide / statistic output.
 *
 * **Berserk**
 * Spec Talent Tier 5
 *
 * Go Berserk for 20 sec. While Berserk:
 * Finishing moves have a 20% chance per combo point spent to refund 2 combo point.
 * Swipe generates 1 additional combo point.
 * Rake and Shred deal damage as though you were stealthed.
 *
 * **Berserk: Heart of the Lion**
 * Spec Talent Tier 7
 *
 * Each combo point spent reduces the cooldown of Berserk (or Incarnation) by 0.5 seconds.
 *
 * **Berserk: Frenzy**
 * Spec Talent Tier 7
 *
 * During Berserk (or Incarnation) your combo-point generating abilites bleed the target for
 * an additional 150% of their damage over 8 seconds.
 */
class Berserk extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
    energyTracker: EnergyTracker,
  };

  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;
  protected energyTracker!: EnergyTracker;

  /** Tracker for each Berserk cast */
  berserkTrackers: BerserkCast[] = [];
  /** The duration of Berserk (or Incarn) when hardcast (as opposed to applied by Ashamane's Guidance) */
  hardcastDuration: number;

  /** If player has the Berserk: Heart of the Lion talent */
  hasHeartOfTheLion: boolean;
  /** If player has the Berserk: Frenzy talent */
  hasFrenzy: boolean;
  /** If player has both the above talents */
  hasBoth: boolean;
  /** If player has Convoke the Spirits talent */
  hasConvoke: boolean;
  /** Either Berserk or Incarnation depending on talent */
  cdSpell: Spell;
  /** The total raw amount the CD was reduced */
  totalRawCdReduced: number = 0;
  /** The total effective amount the CD was reduced - penalized by delaying cast or being unable due to fight end */
  totalEffectiveCdReduced: number = 0;
  /** The amount the current CD has been reduced */
  currCastCdReduced: number = 0;

  /** The timestamp the CD became available */
  timestampAvailable?: number;

  constructor(options: Options) {
    super(options);

    this.hasHeartOfTheLion = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.BERSERK_HEART_OF_THE_LION_TALENT,
    );
    this.hasFrenzy = this.selectedCombatant.hasTalent(TALENTS_DRUID.BERSERK_FRENZY_TALENT);
    this.hasBoth = this.hasHeartOfTheLion && this.hasFrenzy;
    this.hasConvoke = this.selectedCombatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT);
    this.hardcastDuration = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT,
    )
      ? INCARN_HARDCAST_DURATION
      : BERSERK_HARDCAST_DURATION;
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.BERSERK_TALENT);

    this.cdSpell = cdSpell(this.selectedCombatant);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FINISHERS), this.onFinisher);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE),
      this.onBiteDamage,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.cdSpell), this.onCdUse);
    this.addEventListener(
      new EventFilter(EventType.UpdateSpellUsable).by(SELECTED_PLAYER).spell(this.cdSpell),
      this.onCdAvailable,
    );
    this.hasConvoke &&
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CONVOKE_SPIRITS),
        this.onConvoke,
      );
  }

  onFinisher(event: CastEvent) {
    if (this.hasHeartOfTheLion && this.spellUsable.isOnCooldown(this.cdSpell.id)) {
      this._tallyReduction(getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS));
    }
  }

  onBiteDamage(_: DamageEvent) {
    if (this.hasHeartOfTheLion && isConvoking(this.selectedCombatant)) {
      this._tallyReduction(CONVOKE_FB_CPS);
    }
  }

  _tallyReduction(cpsUsed: number) {
    if (this.spellUsable.isOnCooldown(this.cdSpell.id)) {
      const reduction = cpsUsed * BERSERK_CDR_MS;
      const reduced = this.spellUsable.reduceCooldown(this.cdSpell.id, reduction);
      this.totalRawCdReduced += reduced;
      this.currCastCdReduced += reduced;
    }
  }

  onCdUse(event: CastEvent) {
    this.berserkTrackers.push({
      timestamp: event.timestamp,
      energyOnCast: this.energyTracker.current,
      usedConvoke: false, // changed to true later if a Convoke happens while its active
    });

    if (this.hasHeartOfTheLion) {
      const timeAvailableBeforeCast =
        this.timestampAvailable === undefined ? 0 : event.timestamp - this.timestampAvailable;
      this.totalEffectiveCdReduced += Math.max(0, this.currCastCdReduced - timeAvailableBeforeCast);
      this.currCastCdReduced = 0;
    }
  }

  onCdAvailable(event: UpdateSpellUsableEvent) {
    if (event.updateType === UpdateSpellUsableType.EndCooldown) {
      this.timestampAvailable = event.timestamp;
    }
  }

  onConvoke(event: CastEvent) {
    const lastBerserkTracker = this.berserkTrackers.at(-1);
    if (
      lastBerserkTracker &&
      lastBerserkTracker.timestamp + this.hardcastDuration > event.timestamp
    ) {
      lastBerserkTracker.usedConvoke = true;
    }
  }

  get totalDotDamage() {
    return this.abilityTracker.getAbility(SPELLS.FRENZIED_ASSAULT.id).damageEffective;
  }

  /** Guide fragment showing a breakdown of each Berserk cast */
  get guideCastBreakdown(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink id={this.cdSpell.id} />
        </strong>{' '}
        is our primary damage cooldown. It's best used as soon as it's available, but can be held to
        ensure you'll have full target uptime during its duration (don't use it when it will be
        interrupted by a fight mechanic). Aim to cast at high energy, but spend fast enough to never
        cap.
      </p>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.berserkTrackers.map((cast, ix) => {
          // get energy cap stats now that it's end of fight...
          const cdEnd = Math.min(this.owner.fight.end_time, cast.timestamp + this.hardcastDuration);
          const segmentEnergy = this.energyTracker.generateSegmentData(cast.timestamp, cdEnd);
          const percentAtCap = segmentEnergy.percentAtCap;
          const energyPercentOnCast = cast.energyOnCast / this.energyTracker.maxResource;

          const percentAtCapPerf =
            percentAtCap > 0.1
              ? QualitativePerformance.Fail
              : percentAtCap > 0
              ? QualitativePerformance.Ok
              : QualitativePerformance.Good;
          const energyPercentOnCastPerf =
            energyPercentOnCast > 0.5
              ? QualitativePerformance.Good
              : energyPercentOnCast > 0.25
              ? QualitativePerformance.Ok
              : QualitativePerformance.Fail;

          const overallPerf =
            percentAtCapPerf === QualitativePerformance.Fail ||
            energyPercentOnCastPerf === QualitativePerformance.Fail
              ? QualitativePerformance.Fail
              : QualitativePerformance.Good;

          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink id={this.cdSpell.id} />
            </>
          );

          const checklistItems: CooldownExpandableItem[] = [];
          checklistItems.push({
            label: <>Pool Energy for cast</>,
            result: <PerformanceMark perf={energyPercentOnCastPerf} />,
            details: <>({cast.energyOnCast} Energy)</>,
          });
          checklistItems.push({
            label: <>Don't cap on energy</>,
            result: <PerformanceMark perf={percentAtCapPerf} />,
            details: <>({formatPercentage(percentAtCap, 0)}% capped)</>,
          });
          this.hasConvoke &&
            checklistItems.push({
              label: (
                <>
                  <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} /> during Berserk{' '}
                  <Tooltip
                    hoverable
                    content={
                      <>
                        Berserking without Convoke is fine, but it's optimal to wait a few seconds
                        if it will mean you can line them up. Awaiting sims to determine exactly how
                        long.
                      </>
                    }
                  >
                    <span>
                      <InformationIcon />
                    </span>
                  </Tooltip>
                </>
              ),
              result: <PassFailCheckmark pass={cast.usedConvoke} />,
            });

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={overallPerf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  // TODO probably want to update this display, but talents might change more in DF beta so gonna wait
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={SPELLS.BERSERK.id}>
          <>
            {this.hasHeartOfTheLion && (
              <>
                <SpellIcon id={TALENTS_DRUID.BERSERK_HEART_OF_THE_LION_TALENT.id} />{' '}
                {(this.totalEffectiveCdReduced / 1000).toFixed(1)}s <small>eff. CD reduction</small>
              </>
            )}
            {this.hasBoth && <br />}
            {this.hasFrenzy && (
              <>
                <SpellIcon id={SPELLS.FRENZIED_ASSAULT.id} />{' '}
                <img src="/img/sword.png" alt="Damage" className="icon" />{' '}
                {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.totalDotDamage))} %{' '}
                <small>
                  {formatNumber((this.totalDotDamage / this.owner.fightDuration) * 1000)} DPS
                </small>
              </>
            )}
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

interface BerserkCast {
  timestamp: number;
  energyOnCast: number;
  usedConvoke: boolean;
}

export default Berserk;
