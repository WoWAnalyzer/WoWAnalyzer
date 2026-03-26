import type { JSX } from 'react';
import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { getPrayerOfHealingEvents } from '../../normalizers/CastLinkNormalizer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { BadColor, GoodColor, PerfectColor } from 'interface/guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class PrayerOfHealing extends Analyzer {
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
    const hasLightweaver = this.selectedCombatant.hasBuff(SPELLS.LIGHTWEAVER_TALENT_BUFF.id);
    const hasSurgeOfLightTalent = this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_LIGHT_TALENT);
    const hasSurgeOfLightBuff = hasSurgeOfLightTalent
      ? this.selectedCombatant.hasBuff(SPELLS.SURGE_OF_LIGHT_BUFF.id)
      : false;

    let value: QualitativePerformance;
    let pohCastText = '';

    // ignore casts that did not heal during fight, aka cast finished as boss dies
    // even on isolated target, will have at least 1 heal event
    if (healEvents.length > 0) {
      this.prayerOfHealingCasts += 1;

      if (hasLightweaver) {
        if (!hasSurgeOfLightTalent || hasSurgeOfLightBuff) {
          value = QualitativePerformance.Perfect;
          pohCastText = 'Both Lightweaver and Surge of Light are active';
        } else {
          value = QualitativePerformance.Good;
          pohCastText = 'Lightweaver buff active';
        }
      } else {
        value = QualitativePerformance.Fail;
        pohCastText = 'No Lightweaver stacks';
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
    if (this.prayerOfHealingCasts === 0) {
      return <></>;
    }

    const hasSurge = this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_LIGHT_TALENT);

    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} />
          </b>{' '}
          is your primary healing tool. It provides substantial burst healing on its own and is the
          most efficient way to reduce the cooldown of{' '}
          <SpellLink spell={TALENTS.HOLY_WORD_SANCTIFY_TALENT} />. Try to cast it when you have
          stacks of <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> to reduce cast time and mana
          cost.
        </p>
        {hasSurge && (
          <p>
            If talented into <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} />, you can cast{' '}
            <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} /> when you have stacks of{' '}
            <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} />.
          </p>
        )}
      </>
    );

    const data = (
      <div>
        <strong>
          <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} /> cast breakdown
        </strong>
        <small>
          <ul>
            {hasSurge ? (
              <>
                <li>
                  <span style={{ color: PerfectColor }}>Blue</span> is a perfect cast where both{' '}
                  <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> and{' '}
                  <SpellLink spell={TALENTS.SURGE_OF_LIGHT_TALENT} /> are active.
                </li>
                <li>
                  <span style={{ color: GoodColor }}>Green</span> is a good cast where{' '}
                  <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> is active.
                </li>
                <li>
                  <span style={{ color: BadColor }}>Red</span> is a bad cast with no Lightweaver
                  stacks.
                </li>
              </>
            ) : (
              <>
                <li>
                  <span style={{ color: PerfectColor }}>Blue</span> is a perfect cast where{' '}
                  <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> is active.
                </li>
                <li>
                  <span style={{ color: BadColor }}>Red</span> is a bad cast with no Lightweaver
                  stacks.
                </li>
              </>
            )}
          </ul>
        </small>
        <PerformanceBoxRow values={this.castEntries} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default PrayerOfHealing;
