import type { JSX } from 'react';
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
    const prayerCirclePerfect = this.selectedCombatant.hasBuff(SPELLS.PRAYER_CIRCLE_BUFF.id);

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
{/* oxlint-disable-next-line @wowanalyzer/no-br */}
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
            <SpellLink spell={TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT} />{' '}
          </b>
          is your primary healing tool. It provides substantial burst healing on its own and is the
          most efficient way to reduce the cooldown of{' '}
          <SpellLink spell={TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT} />. Try to cast it when you
          have stacks of <SpellLink spell={TALENTS_PRIEST.LIGHTWEAVER_TALENT} /> to reduce cast time
          and mana cost.
        </p>
        <p>
          If talented into <SpellLink spell={TALENTS_PRIEST.SPIRITWELL_TALENT} />, you can cast{' '}
          <SpellLink spell={TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT} /> when you have procs of{' '}
          <SpellLink spell={TALENTS_PRIEST.SURGE_OF_LIGHT_TALENT} />.
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
              <span style={{ color: PerfectColor }}>Blue</span> is a perfect cast, where
              <SpellLink spell={TALENTS_PRIEST.LIGHTWEAVER_TALENT} /> and{' '}
              <SpellLink spell={TALENTS_PRIEST.SURGE_OF_LIGHT_TALENT} /> is applied if talented into
              it.
            </li>
            <li>
              <span style={{ color: GoodColor }}>Green</span> is a good cast, where
              <SpellLink spell={TALENTS_PRIEST.LIGHTWEAVER_TALENT} /> is applied.
            </li>
            <li>
              <span style={{ color: BadColor }}>Red</span> is a bad cast, where no buffs is applied.
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
