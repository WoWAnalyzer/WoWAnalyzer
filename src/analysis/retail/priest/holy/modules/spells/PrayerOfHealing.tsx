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
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';

type PrayerOfHealingInfo = {
  cast: CastEvent;
  prayerCircleBuffed: boolean;
  sanctifyOnCd: boolean;
  fullyOverhealedTargets: number;
};

class PrayerOfHealing extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  prayerOfHealingHealing = 0;
  prayerOfHealingOverhealing = 0;
  prayerOfHealingTargetsHit = 0;
  prayerOfHealingCasts: PrayerOfHealingInfo[] = [];

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
    return this.prayerOfHealingTargetsHit / this.prayerOfHealingCasts.length;
  }

  onPohCast(event: CastEvent) {
    // check if player is buffed by prayer circle when casting PoH
    const prayerCircleBuffed = this.selectedCombatant.hasBuff(SPELLS.PRAYER_CIRCLE_BUFF.id);
    // check if Holy Word: Sanctify is on cooldown when casting PoH to avoid wasted CDR.
    const sanctifyOnCd =
      this.spellUsable.chargesAvailable(TALENTS.HOLY_WORD_SANCTIFY_TALENT.id) === 0;
    // calculate healing numbers from heal events linked
    // count number of targets where 100% overheal occurred.
    let fullyOverhealedTargets = 0;
    const healEvents = getHeals(event);
    for (const healEvent of getHeals(event)) {
      const totalEffectiveHealing = (healEvent.amount || 0) + (healEvent.absorbed || 0);
      this.prayerOfHealingTargetsHit += 1;
      this.prayerOfHealingHealing += totalEffectiveHealing;
      this.prayerOfHealingOverhealing += healEvent.overheal || 0;
      if ((healEvent.overheal || 0) > 0 && totalEffectiveHealing === 0) {
        fullyOverhealedTargets += 1;
      }
    }
    const castInfo = {
      cast: event,
      prayerCircleBuffed: prayerCircleBuffed,
      sanctifyOnCd: sanctifyOnCd,
      fullyOverhealedTargets: fullyOverhealedTargets,
    };
    // ignore casts that did not heal during fight, aka cast finished as boss dies
    if (healEvents.length > 0) {
      this.prayerOfHealingCasts.push(castInfo);
    }
  }

  /** Guide subsection describing the proper usage of Prayer of Healing */
  get guideSubsection(): JSX.Element {
    // if player cast 0 prayer of healings, don't show guide section
    if (this.prayerOfHealingCasts.length === 0) {
      return <></>;
    }
    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT.id} />
        </b>{' '}
        is your primary filler spell. It will be the majority of healing casts in raid, but you
        should try to only cast it when your holy words and other short cooldowns like{' '}
        <SpellLink id={TALENTS_PRIEST.PRAYER_OF_MENDING_TALENT.id} /> are not available. Try to cast{' '}
        <SpellLink id={TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT.id} /> and{' '}
        <SpellLink id={TALENTS_PRIEST.CIRCLE_OF_HEALING_TALENT.id} /> first if running the{' '}
        <SpellLink id={TALENTS_PRIEST.SANCTIFIED_PRAYERS_TALENT.id} /> and{' '}
        <SpellLink id={TALENTS_PRIEST.PRAYER_CIRCLE_TALENT.id} /> talents. These are very powerful
        buffs to the cast time, mana cost, and healing power of the spell. Remember, this spell does
        not have any smart healing and only allies within 40 yards can be hit - don't cast this on
        an isolated player!
      </p>
    );

    const castPerfBoxes = this.prayerOfHealingCasts.map((prayerOfHealingCast) => {
      let value: QualitativePerformance;
      if (
        prayerOfHealingCast.prayerCircleBuffed === false &&
        prayerOfHealingCast.sanctifyOnCd === false &&
        prayerOfHealingCast.fullyOverhealedTargets > 0
      ) {
        value = QualitativePerformance.Fail;
      } else if (
        prayerOfHealingCast.prayerCircleBuffed === false ||
        prayerOfHealingCast.sanctifyOnCd === false ||
        prayerOfHealingCast.fullyOverhealedTargets > 0
      ) {
        value = QualitativePerformance.Ok;
      } else {
        value = QualitativePerformance.Good;
      }
      return {
        value,
        tooltip: `@ ${this.owner.formatTimestamp(prayerOfHealingCast.cast.timestamp)}.
        ${
          !prayerOfHealingCast.prayerCircleBuffed &&
          this.selectedCombatant.hasTalent(TALENTS_PRIEST.PRAYER_CIRCLE_TALENT)
            ? 'Prayer of Healing cast when not buffed by prayer circle.'
            : ''
        }
        ${
          !prayerOfHealingCast.sanctifyOnCd
            ? 'Prayer of Healing cast when Holy Word: Sanctify was off cooldown.'
            : ''
        }
        ${
          prayerOfHealingCast.fullyOverhealedTargets > 0
            ? `Prayer of Healing overhealed on ${prayerOfHealingCast.fullyOverhealedTargets} targets hit.`
            : ''
        }
        `,
      };
    });
    const data = (
      <div>
        <strong>Prayer of Healing cast breakdown</strong>
        <small>
          {' '}
          - Green means a good cast. Yellow means a cast failed one or more of the following
          criteria:
          <ul>
            <li>
              Casted when <SpellLink id={TALENTS.HOLY_WORD_SANCTIFY_TALENT} /> was off cooldown.
            </li>
            <li>
              Casted without the <SpellLink id={TALENTS_PRIEST.PRAYER_CIRCLE_TALENT} /> buff active.
            </li>
            <li>Fully overhealed one or more target.</li>
          </ul>
          Red means none of the above was met.
        </small>
        <PerformanceBoxRow values={castPerfBoxes} />
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
            {this.prayerOfHealingCasts.length}
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
