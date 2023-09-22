import { formatPercentage, formatThousands } from 'common/format';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { getPrayerOfHealingEvents } from '../../normalizers/CastLinkNormalizer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { BadColor, OkColor, GoodColor, PerfectColor } from 'interface/guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const POH_MAX_TARGETS_HIT = 5;

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
    // count number of targets where 100% overheal occurred.
    let fullyOverhealedTargets = 0;
    let targetsHit = 0;
    const healEvents = getPrayerOfHealingEvents(event);
    for (const healEvent of healEvents) {
      const totalEffectiveHealing = (healEvent.amount || 0) + (healEvent.absorbed || 0);
      this.prayerOfHealingTargetsHit += 1;
      targetsHit += 1;
      this.prayerOfHealingHealing += totalEffectiveHealing;
      this.prayerOfHealingOverhealing += healEvent.overheal || 0;
      if ((healEvent.overheal || 0) > 0 && totalEffectiveHealing === 0) {
        fullyOverhealedTargets += 1;
      }
    }

    // Analyze cast for guide section:

    // prayer circle buff is available and player is not currently buffed
    const prayerCircleAvailable =
      !this.selectedCombatant.hasBuff(SPELLS.PRAYER_CIRCLE_BUFF.id) &&
      this.selectedCombatant.hasTalent(TALENTS.PRAYER_CIRCLE_TALENT) &&
      this.spellUsable.isAvailable(TALENTS.CIRCLE_OF_HEALING_TALENT.id);
    // player is buffed by prayer circle or they don't have the talent
    const prayerCirclePerfect =
      this.selectedCombatant.hasBuff(SPELLS.PRAYER_CIRCLE_BUFF.id) ||
      !this.selectedCombatant.hasTalent(TALENTS.PRAYER_CIRCLE_TALENT);
    // player is either buffed by prayer circle, does not have the talent, or circle of healing is on CD
    const prayerCircleGood = prayerCirclePerfect || !prayerCircleAvailable;
    // sanctified prayers buff is available and player is not currently buffed
    const sanctifiedPrayersAvailable =
      !this.selectedCombatant.hasBuff(SPELLS.SANCTIFIED_PRAYERS_BUFF.id) &&
      this.selectedCombatant.hasTalent(TALENTS.SANCTIFIED_PRAYERS_TALENT) &&
      this.spellUsable.isAvailable(TALENTS.HOLY_WORD_SANCTIFY_TALENT.id);
    // player is buffed by sanctified prayers or they don't have the talent
    const sanctifiedPrayersPerfect =
      this.selectedCombatant.hasBuff(SPELLS.SANCTIFIED_PRAYERS_BUFF.id) ||
      !this.selectedCombatant.hasTalent(TALENTS.SANCTIFIED_PRAYERS_TALENT);
    // player is either buffed by sanctified prayers, does not have the talent, or holy word sanctify is on CD
    const sanctifiedPrayersGood = sanctifiedPrayersPerfect || !sanctifiedPrayersAvailable;

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
      if (targetsHit < POH_MAX_TARGETS_HIT) {
        pohCastText = `Only hit ${targetsHit} target${targetsHit > 1 ? 's' : ''}. `;
      }
      if (fullyOverhealedTargets > 0) {
        pohCastText += `Fully overhealed ${fullyOverhealedTargets} target${
          fullyOverhealedTargets > 1 ? 's' : ''
        }. `;
      }
      if (prayerCircleAvailable) {
        pohCastText += `Prayer Circle buff available, try casting Circle of Healing first. `;
      }
      if (sanctifyOffCd) {
        pohCastText += `Holy Word: Sanctify is not on cooldown, try casting it first to avoid wasting CDR. `;
      }

      if (
        prayerCirclePerfect &&
        sanctifiedPrayersPerfect &&
        !sanctifyOffCd &&
        fullyOverhealedTargets === 0 &&
        targetsHit === POH_MAX_TARGETS_HIT
      ) {
        // all talented buffs are active, holy word sanctify is on cooldown
        // no overhealed targets, max targets hit
        value = QualitativePerformance.Perfect;
      } else if (
        prayerCircleGood &&
        sanctifiedPrayersGood &&
        !sanctifyOffCd &&
        fullyOverhealedTargets < 2 &&
        targetsHit === POH_MAX_TARGETS_HIT
      ) {
        // all available buffs are active, holy word sanctify is on cooldown
        // no overhealed targets, max targets hit
        value = QualitativePerformance.Good;
      } else if (
        (prayerCircleGood || sanctifiedPrayersGood) &&
        fullyOverhealedTargets < 2 &&
        targetsHit === POH_MAX_TARGETS_HIT
      ) {
        // one available buff is active or sanctify is on cd or one target overhealed
        value = QualitativePerformance.Ok;
      } else {
        // fully overhealed more than one target or didnt hit max targets
        // or all buffs available
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
          is your primary raid healing spell. It will be the majority of your healing casts in raid,
          but you should try to only cast it when your holy words and other short cooldowns like{' '}
          <SpellLink spell={TALENTS_PRIEST.PRAYER_OF_MENDING_TALENT} /> and{' '}
          <SpellLink spell={TALENTS_PRIEST.CIRCLE_OF_HEALING_TALENT} /> are not available.
        </p>
        <p>
          If you are running the <SpellLink spell={TALENTS_PRIEST.SANCTIFIED_PRAYERS_TALENT} />{' '}
          and/or <SpellLink spell={TALENTS_PRIEST.PRAYER_CIRCLE_TALENT} /> talents, make sure to
          apply these buffs before casting{' '}
          <SpellLink spell={TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT} />. Remember, this spell does
          not have any smart healing and only allies within 40 yards can be hit - don't cast this on
          an isolated player!
        </p>
      </>
    );

    const data = (
      <div>
        <strong>Prayer of Healing cast breakdown</strong>
        <small>
          <ul>
            <li>
              <span style={{ color: PerfectColor }}>Blue</span> is a perfect cast, where all
              talented Prayer of Healing buffs are applied,{' '}
              <SpellLink spell={TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT} /> is on cooldown,{' '}
              {POH_MAX_TARGETS_HIT} targets are hit, and no targets are fully overhealed.
            </li>
            <li>
              <span style={{ color: GoodColor }}>Green</span> is a good cast, where all Prayer of
              Healing buffs are either applied or not available to be applied, and{' '}
              <SpellLink spell={TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT} /> is on cooldown.
            </li>
            <li>
              <span style={{ color: OkColor }}>Yellow</span> is an ok cast, where one or more Prayer
              of Healing buffs is available to be applied.
            </li>
            <li>
              <span style={{ color: BadColor }}>Red</span> is a bad cast, where all buffs are
              available to be applied. Any cast where two or more targets is fully overhealed, or
              any cast where less than 5 targets are hit, is automatically considered a bad cast.
            </li>
          </ul>
          Mouse over for more details!
        </small>
        <PerformanceBoxRow values={this.castEntries} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} /> Casts:{' '}
            {this.prayerOfHealingCasts}
            <br />
            Total Healing: {formatThousands(this.prayerOfHealingHealing)} (
            {formatPercentage(this.overHealPercent)}% OH)
            <br />
            Average Targets Hit: {this.averageTargetsHit.toFixed(2)}
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        position={STATISTIC_ORDER.OPTIONAL(5)}
      >
        <BoringSpellValueText spell={TALENTS.PRAYER_OF_HEALING_TALENT}>
          <ItemHealingDone amount={this.prayerOfHealingHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PrayerOfHealing;
