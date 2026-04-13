import type { JSX } from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import { Options } from 'parser/core/Module';
import SPELLS from 'common/SPELLS';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SUDDEN_ABUSH_DAMAGE_BONUS } from 'analysis/retail/druid/feral/constants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { SpellIcon, SpellLink } from 'interface';
import CrossIcon from 'interface/icons/Cross';
import UptimeIcon from 'interface/icons/Uptime';
import { formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { BadColor } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { getDamageHits } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';

const SA_BUFF_BUFFER = 50;

/**
 * **Sudden Ambush**
 * Spec Talent
 *
 * Finishing moves have a 6% chance per combo point spent to make your next Rake or Shred
 * deal damage as though you were stealthed.
 *
 * Detects SA usage by checking if the buff is active at the time of Shred/Swipe/Rake casts,
 * which is more reliable than depending on RemoveBuff event linking.
 */
class SuddenAmbush extends Analyzer {
  /** Number of shreds boosted by SA */
  boostedShreds = 0;
  /** Number of rakes boosted by SA */
  boostedRakes = 0;
  /** Number of swipes boosted by SA */
  boostedSwipes = 0;
  /** Total damage added to Shred by SA boost */
  boostedShredDamage = 0;
  /** Total damage added to Rake by SA boost */
  boostedRakeDamage = 0;
  /** Total damage added to Swipe by SA boost */
  boostedSwipeDamage = 0;

  /** SA buffs gained */
  saGained = 0;
  /** SA buffs used */
  saUsed = 0;
  /** SA buffs expired */
  saExpired = 0;
  /** SA buffs overwritten */
  saOverwritten = 0;

  /** Per use entries for the Guide */
  useEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.SUDDEN_AMBUSH_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_AMBUSH_BUFF),
      this.onGainSa,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_AMBUSH_BUFF),
      this.onOverwriteSa,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_AMBUSH_BUFF),
      this.onRemoveSa,
    );

    // Detect SA consumption by checking buff at cast time
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.SHRED, SPELLS.SWIPE_CAT, SPELLS.RAKE]),
      this.onSaConsumerCast,
    );
  }

  onGainSa(_event: ApplyBuffEvent) {
    this.saGained += 1;
  }

  onOverwriteSa(_event: RefreshBuffEvent) {
    this.saGained += 1;
    this.saOverwritten += 1;
  }

  onRemoveSa(event: RemoveBuffEvent) {
    // If the buff expired without being consumed by a cast, mark it as expired.
    // Used procs are already tracked in onSaConsumerCast, so we only need to handle expirations.
    // Since onSaConsumerCast fires on cast events (which happen before removebuff),
    // if this removebuff wasn't preceded by a cast, it's an expiration.
    const totalAccountedFor = this.saUsed + this.saExpired + this.saOverwritten;
    if (totalAccountedFor < this.saGained) {
      // This removal wasn't from a cast - it expired
      this.saExpired += 1;
      this.useEntries.push({
        value: QualitativePerformance.Fail,
        tooltip: (
          <>
            <h5 style={{ color: BadColor }}>
              Bad because you let a proc expire
              {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
              <br />
            </h5>
            @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong>
          </>
        ),
      });
    }
  }

  onSaConsumerCast(event: CastEvent) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.SUDDEN_AMBUSH_BUFF.id, event.timestamp, SA_BUFF_BUFFER)
    ) {
      return;
    }

    this.saUsed += 1;

    const spellId = event.ability.guid;
    const isRake = spellId === SPELLS.RAKE.id;
    const spell =
      spellId === SPELLS.SHRED.id
        ? SPELLS.SHRED
        : spellId === SPELLS.SWIPE_CAT.id
          ? SPELLS.SWIPE_CAT
          : SPELLS.RAKE;
    const targetName = this.owner.getTargetName(event);

    this.useEntries.push({
      value: isRake ? QualitativePerformance.Fail : QualitativePerformance.Good,
      tooltip: (
        <>
          <strong>
            Consumed with <SpellLink spell={spell} />
          </strong>
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
          {isRake && (
            <h5 style={{ color: BadColor }}>
              Sudden Ambush only buffs Rake's initial damage now, not the bleed. Prefer using it on{' '}
              <SpellLink spell={SPELLS.SHRED} /> or <SpellLink spell={SPELLS.SWIPE_CAT} /> instead.
              {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
              <br />
            </h5>
          )}
          @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong> targetting{' '}
          <strong>{targetName || 'unknown'}</strong>
        </>
      ),
    });

    // Track damage from linked hits
    const damageHits = getDamageHits(event);
    damageHits.forEach((d) => {
      switch (d.ability.guid) {
        case SPELLS.SHRED.id:
          this.boostedShreds += 1;
          this.boostedShredDamage += calculateEffectiveDamage(d, SUDDEN_ABUSH_DAMAGE_BONUS);
          break;
        case SPELLS.RAKE.id:
          this.boostedRakes += 1;
          this.boostedRakeDamage += calculateEffectiveDamage(d, SUDDEN_ABUSH_DAMAGE_BONUS);
          break;
        case SPELLS.SWIPE_CAT.id:
          this.boostedSwipes += 1;
          this.boostedSwipeDamage += calculateEffectiveDamage(d, SUDDEN_ABUSH_DAMAGE_BONUS);
          break;
      }
    });
  }

  get saEnding() {
    return this.saGained - this.saUsed - this.saExpired - this.saOverwritten;
  }

  get saUtil() {
    return this.saGained === 0 ? 0 : this.saUsed / (this.saGained - this.saEnding);
  }

  get totalDamage() {
    return this.boostedRakeDamage + this.boostedShredDamage + this.boostedSwipeDamage;
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS_DRUID.SUDDEN_AMBUSH_TALENT} />
        </strong>{' '}
        buffs your next <SpellLink spell={SPELLS.SHRED} />, <SpellLink spell={SPELLS.SWIPE_CAT} />,
        or <SpellLink spell={SPELLS.RAKE} />. You should spend the proc on{' '}
        <SpellLink spell={SPELLS.SHRED} /> (single target) or <SpellLink spell={SPELLS.SWIPE_CAT} />{' '}
        (AoE). Avoid using it on <SpellLink spell={SPELLS.RAKE} /> as it only buffs the initial
        damage, not the bleed.
      </p>
    );

    const data = (
      <div>
        <CastSummaryAndBreakdown
          spell={TALENTS_DRUID.SUDDEN_AMBUSH_TALENT}
          castEntries={this.useEntries}
          badExtraExplanation={<>or an expired proc</>}
          usesInsteadOfCasts
        />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(6)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the damage from the increase to Shred, Swipe, and Rake initial damage caused by
            Sudden Ambush procs. This underrates the total benefit of Sudden Ambush because it does
            not count the increased crit chance and additional combo point from Shred.
            {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
            <br />
            {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
            <br />
            Buff Utilization: <strong>{formatPercentage(this.saUtil, 1)}%</strong>
            <ul>
              <li>
                <SpellIcon spell={TALENTS_DRUID.SUDDEN_AMBUSH_TALENT} /> Used:{' '}
                <strong>{this.saUsed}</strong>
              </li>
              <li>
                <CrossIcon /> Overwritten: <strong>{this.saOverwritten}</strong>
              </li>
              <li>
                <UptimeIcon /> Expired: <strong>{this.saExpired}</strong>
              </li>
              {this.saEnding > 0 && (
                <li>
                  Still active at fight end: <strong>{this.saEnding}</strong>
                </li>
              )}
            </ul>
            {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
            <br />
            Breakdown by spell:
            <ul>
              <li>
                <SpellLink spell={SPELLS.SHRED} />: Boosted <strong>{this.boostedShreds}</strong>{' '}
                hits for{' '}
                <strong>&gt;{this.owner.formatItemDamageDone(this.boostedShredDamage)}</strong>
              </li>
              <li>
                <SpellLink spell={SPELLS.SWIPE_CAT} />: Boosted{' '}
                <strong>{this.boostedSwipes}</strong> hits for{' '}
                <strong>&gt;{this.owner.formatItemDamageDone(this.boostedSwipeDamage)}</strong>
              </li>
              <li>
                <SpellLink spell={SPELLS.RAKE} />: Boosted <strong>{this.boostedRakes}</strong> hits
                for <strong>&gt;{this.owner.formatItemDamageDone(this.boostedRakeDamage)}</strong>
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DRUID.SUDDEN_AMBUSH_TALENT}>
          <ItemPercentDamageDone greaterThan amount={this.totalDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SuddenAmbush;
