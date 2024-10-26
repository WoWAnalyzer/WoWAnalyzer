import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { getPrayerOfHealingEvents } from '../../normalizers/CastLinkNormalizer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { BadColor, GoodColor, PerfectColor } from 'interface/guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class PrayerOfHealing extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  prayerOfHealingCasts = 0;
  prayerOfHealingHealing = 0;
  prayerOfHealingOverhealing = 0;
  prayerOfHealingTargetsHit = 0;

  /** Box row entry for each PoH cast */
  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PRAYER_OF_HEALING_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.PRAYER_OF_HEALING_TALENT),
      this.onPohCast,
    );
  }

  get overHealPercent() {
    return this.prayerOfHealingOverhealing / this.rawHealing;
  }

  get rawHealing() {
    return this.prayerOfHealingHealing + this.prayerOfHealingOverhealing;
  }

  get averageTargetsHit() {
    return this.prayerOfHealingTargetsHit / this.prayerOfHealingCasts;
  }

  onPohCast(event: CastEvent) {
    // calculate healing numbers from heal events linked
    const healEvents = getPrayerOfHealingEvents(event);

    // Analyze cast for guide section:
    // player is buffed by prayer circle or they don't have the talent
    const prayerCirclePerfect =
      this.selectedCombatant.hasBuff(SPELLS.PRAYER_CIRCLE_BUFF.id) ||
      !this.selectedCombatant.hasTalent(TALENTS.PRAYER_CIRCLE_TALENT);

    // check if Holy Word: Sanctify is not on cooldown when casting PoH to avoid wasted CDR.
    const sanctifyOffCd = this.selectedCombatant.hasTalent(TALENTS.MIRACLE_WORKER_TALENT)
      ? this.spellUsable.chargesAvailable(TALENTS.HOLY_WORD_SANCTIFY_TALENT.id) === 2
      : this.spellUsable.chargesAvailable(TALENTS.HOLY_WORD_SANCTIFY_TALENT.id) === 1;

    let value: QualitativePerformance;
    let pohCastText = '';

    // ignore casts that did not heal during fight, aka cast finished as boss dies
    // even on isolated target, will have at least 1 heal event
    if (healEvents.length > 0) {
      this.prayerOfHealingCasts += 1;
      if (sanctifyOffCd) {
        pohCastText += `Holy Word: Sanctify is not on cooldown, try casting it first to avoid wasting CDR. `;
      }

      if (prayerCirclePerfect && !sanctifyOffCd) {
        value = QualitativePerformance.Perfect;
      } else if (!sanctifyOffCd) {
        value = QualitativePerformance.Good;
      } else {
        value = QualitativePerformance.Fail;
      }
      const tooltip = (
        <>
          @<strong>{this.owner.formatTimestamp(event.timestamp)}</strong>
          <br />
          {pohCastText}
        </>
      );

      this.castEntries.push({ value, tooltip });
    }
  }

  /** Guide subsection describing the proper usage of Prayer of Healing */
  get guideSubsection(): JSX.Element {
    // if player cast 0 prayer of healings, don't show guide section
    if (this.prayerOfHealingCasts === 0) {
      return <></>;
    }
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT} />
          </b>{' '}
          is a filler you can use to reduce the CD of{' '}
          <SpellLink spell={TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT} /> which is good some tiers.
          Currently in Nerub'ar Palace it is generally better to fill with{' '}
          <SpellLink spell={SPELLS.FLASH_HEAL} /> or <SpellLink spell={SPELLS.GREATER_HEAL} /> with{' '}
          <SpellLink spell={TALENTS_PRIEST.LIGHTWEAVER_TALENT} /> since{' '}
          <SpellLink spell={TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT} /> does very little healing of
          its own.
        </p>
        <p>
          If you are running <SpellLink spell={TALENTS_PRIEST.PRAYER_CIRCLE_TALENT} />, make sure to
          apply it before casting <SpellLink spell={TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT} />.
          This spell does not smart heal and only hits the closest targets, even if they are full
          hp.
        </p>
        <p>
          Only ever cast this spell when{' '}
          <SpellLink spell={TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT} /> is on cooldown.
        </p>
      </>
    );

    const data = (
      <div>
        <strong>
          <SpellLink spell={TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT} /> cast breakdown
        </strong>
        <small>
          <ul>
            <li>
              <span style={{ color: PerfectColor }}>Blue</span> is a perfect cast, where{' '}
              <SpellLink spell={TALENTS_PRIEST.PRAYER_CIRCLE_TALENT} /> is applied if talented into
              it, and <SpellLink spell={TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT} /> is on cooldown.
            </li>
            <li>
              <span style={{ color: GoodColor }}>Green</span> is a good cast, where{' '}
              <SpellLink spell={TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT} /> is on cooldown.
            </li>
            <li>
              <span style={{ color: BadColor }}>Red</span> is a bad cast, where{' '}
              <SpellLink spell={TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT} /> is off cooldown.
            </li>
          </ul>
        </small>
        <PerformanceBoxRow values={this.castEntries} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default PrayerOfHealing;
