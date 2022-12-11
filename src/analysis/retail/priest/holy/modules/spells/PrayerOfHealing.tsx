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
import { getHeals } from '../../normalizers/CastLinkNormalizer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';

const POH_MAX_TARGETS_HIT = 0;

class PrayerOfHealing extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  prayerOfHealingCasts = 0;
  prayerOfHealingHealing = 0;
  prayerOfHealingOverhealing = 0;
  prayerOfHealingTargetsHit = 0;

  // A perfect cast is when the following is true:
  // - player has all PoH buffs available(prayer circle, sanctified prayers)
  // - Sanctify is on CD
  // - no targets fully overhealed
  perfectCasts = 0;
  // A good cast is when no targets get overhealed,
  // but one of the buffs is missing or sanctify is on CD
  goodCasts = 0;
  // ok cast is when
  okCasts = 0;
  badCasts = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PRAYER_OF_HEALING_TALENT.id);

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
    // player is buffed by prayer circle or they don't have the talent
    const prayerCirclePerfect =
      this.selectedCombatant.hasBuff(SPELLS.PRAYER_CIRCLE_BUFF.id) ||
      !this.selectedCombatant.hasTalent(TALENTS.PRAYER_CIRCLE_TALENT);
    // player is either buffed by prayer circle, does not have the talent, or circle of healing is on CD
    const prayerCircleGood =
      prayerCirclePerfect || !this.spellUsable.isAvailable(TALENTS.CIRCLE_OF_HEALING_TALENT.id);
    // check if Holy Word: Sanctify is on cooldown when casting PoH to avoid wasted CDR.
    const sanctifyOnCd =
      this.spellUsable.chargesAvailable(TALENTS.HOLY_WORD_SANCTIFY_TALENT.id) === 0;
    // player is buffed by sanctified prayers or they don't have the talent
    const sanctifiedPrayersPerfect =
      this.selectedCombatant.hasBuff(SPELLS.SANCTIFIED_PRAYERS_BUFF.id) ||
      !this.selectedCombatant.hasTalent(TALENTS.SANCTIFIED_PRAYERS_TALENT);
    // player is either buffed by prayer circle, does not have the talent, or holy word sanctify is on CD
    const sanctifiedPrayersGood = sanctifiedPrayersPerfect || sanctifyOnCd;
    // calculate healing numbers from heal events linked
    // count number of targets where 100% overheal occurred.
    let fullyOverhealedTargets = 0;
    let targetsHit = 0;
    const healEvents = getHeals(event);
    for (const healEvent of getHeals(event)) {
      const totalEffectiveHealing = (healEvent.amount || 0) + (healEvent.absorbed || 0);
      this.prayerOfHealingTargetsHit += 1;
      this.prayerOfHealingHealing += totalEffectiveHealing;
      this.prayerOfHealingOverhealing += healEvent.overheal || 0;
      if ((healEvent.overheal || 0) > 0 && totalEffectiveHealing === 0) {
        fullyOverhealedTargets += 1;
        targetsHit += 1;
      }
    }

    // ignore casts that did not heal during fight, aka cast finished as boss dies
    // even on isolated target, will have at least 1 heal event
    if (healEvents.length > 0) {
      // analyze cast for guide section
      this.prayerOfHealingCasts += 1;
      if (
        prayerCirclePerfect &&
        sanctifiedPrayersPerfect &&
        sanctifyOnCd &&
        fullyOverhealedTargets === 0 &&
        targetsHit === POH_MAX_TARGETS_HIT
      ) {
        this.perfectCasts += 1;
      } else if (
        prayerCircleGood &&
        sanctifiedPrayersGood &&
        fullyOverhealedTargets === 0 &&
        targetsHit === POH_MAX_TARGETS_HIT
      ) {
        this.goodCasts += 1;
      } else if (
        (prayerCircleGood || sanctifiedPrayersGood) &&
        fullyOverhealedTargets === 0 &&
        targetsHit === POH_MAX_TARGETS_HIT
      ) {
        this.okCasts += 1;
      } else {
        this.badCasts += 1;
      }
    }
  }

  /** Guide subsection describing the proper usage of Prayer of Healing */
  get guideSubsection(): JSX.Element {
    // if player cast 0 prayer of healings, don't show guide section
    if (this.prayerOfHealingCasts === 0) {
      return <></>;
    }
    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT.id} />
        </b>{' '}
        is your primary filler spell. It will be the majority of healing casts in raid, but you
        should try to only cast it when your holy words and other short cooldowns like{' '}
        <SpellLink id={TALENTS_PRIEST.PRAYER_OF_MENDING_TALENT.id} /> and{' '}
        <SpellLink id={TALENTS_PRIEST.CIRCLE_OF_HEALING_TALENT.id} /> are not available. If you are
        running the <SpellLink id={TALENTS_PRIEST.SANCTIFIED_PRAYERS_TALENT.id} /> and/or{' '}
        <SpellLink id={TALENTS_PRIEST.PRAYER_CIRCLE_TALENT.id} /> talents, make sure to apply these
        buffs before casting <SpellLink id={TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT.id} />.
        Remember, this spell does not have any smart healing and only allies within 40 yards can be
        hit - don't cast this on an isolated player!
      </p>
    );

    const perfectCasts = {
      count: this.perfectCasts,
      label: 'All talented buffs active and Holy Word: Sanctify on cooldown',
    };

    const goodCasts = {
      count: this.goodCasts,
      label: 'All available buffs applied and Holy Word: Sanctify on cooldown',
    };

    const okCasts = {
      count: this.okCasts,
      label: 'One or more available buffs are missing',
    };

    const badCasts = {
      count: this.badCasts,
      label: 'All available buffs are missing or cast had high overheal/did not hit 5 targets',
    };

    const data = (
      <div>
        <strong>Prayer of Healing cast breakdown</strong>
        <small>
          <ul>
            <li>
              Blue is a perfect cast, where all talented Prayer of Healing buffs are applied and{' '}
              <SpellLink id={TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT.id} /> is on cooldown.{' '}
            </li>
            <li>
              Green is a good cast, where all Prayer of Healing buffs are either applied or not
              available to be applied, and{' '}
              <SpellLink id={TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT.id} /> is on cooldown.
            </li>
            <li>
              Yellow is an ok cast, where one or more Prayer of Healing buffs is available to be
              applied.
            </li>
            <li>
              Red is a bad cast, where all buffs are available to be applied. Any cast where one or
              more targets is fully overhealed, or any cast where less than 5 targets are hit, is
              also considered a bad cast.
            </li>
          </ul>
        </small>
        <GradiatedPerformanceBar
          perfect={perfectCasts}
          good={goodCasts}
          ok={okCasts}
          bad={badCasts}
        />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            <SpellLink id={TALENTS.PRAYER_OF_HEALING_TALENT.id} /> Casts:{' '}
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
        <BoringSpellValueText spellId={TALENTS.PRAYER_OF_HEALING_TALENT.id}>
          <ItemHealingDone amount={this.prayerOfHealingHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PrayerOfHealing;
