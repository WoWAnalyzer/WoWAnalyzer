import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { SpellLink, Tooltip } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { cdSpell } from 'analysis/retail/druid/feral/constants';
import { TALENTS_DRUID } from 'common/TALENTS';
import { formatPercentage } from 'common/format';
import EnergyTracker from 'analysis/retail/druid/feral/modules/core/energy/EnergyTracker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PassFailCheckmark, PerformanceMark } from 'interface/guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import InformationIcon from 'interface/icons/Information';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import TalentSpellText from 'parser/ui/TalentSpellText';

const BERSERK_HARDCAST_DURATION = 15_000;
const INCARN_HARDCAST_DURATION = 20_000;

/**
 * This tracks Berserk and its 'upgrade' talents, and produces guide / statistic output.
 *
 * **Berserk**
 * Spec Talent
 *
 * Go Berserk for 15 seconds. While Berserk: Generate 1 combo point every 1.5 seconds.
 * Finishing moves restore up to 3 combo points generated over the cap.
 * Shred and Rake damage increased by 50%.
 * Combo point generating abilities generate one additional combo point.
 *
 * **Berserk: Heart of the Lion**
 * Spec Talent
 *
 * Reduce the cooldown of Berserk (or Incarnation) by 60 seconds.
 *
 * **Berserk: Frenzy**
 * Spec Talent
 *
 * During Berserk (or Incarnation) your combo-point generating abilites bleed the target for
 * an additional 135% of their damage over 8 seconds.
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
  /** If player has Convoke the Spirits talent */
  hasConvoke: boolean;
  /** If player has Incarnation talent */
  hasIncarn: boolean;
  /** Either Berserk or Incarnation depending on talent */
  cdSpell: Spell;

  /** The timestamp the CD became available */
  timestampAvailable?: number;

  constructor(options: Options) {
    super(options);

    this.hasHeartOfTheLion = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.BERSERK_HEART_OF_THE_LION_TALENT,
    );
    this.hasFrenzy = this.selectedCombatant.hasTalent(TALENTS_DRUID.BERSERK_FRENZY_TALENT);
    this.hasConvoke = this.selectedCombatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT);
    this.hasIncarn = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT,
    );
    this.hardcastDuration = this.hasIncarn ? INCARN_HARDCAST_DURATION : BERSERK_HARDCAST_DURATION;
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.BERSERK_TALENT);

    this.cdSpell = cdSpell(this.selectedCombatant);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.cdSpell), this.onCdUse);
    this.hasConvoke &&
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CONVOKE_SPIRITS),
        this.onConvoke,
      );
  }

  onCdUse(event: CastEvent) {
    this.berserkTrackers.push({
      timestamp: event.timestamp,
      energyOnCast: this.energyTracker.current,
      usedConvoke: false, // changed to true later if a Convoke happens while its active
    });
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
    return this.abilityTracker.getAbilityDamage(SPELLS.FRENZIED_ASSAULT.id);
  }

  private getPercentAtCapPerf(percentAtCap: number): QualitativePerformance {
    if (percentAtCap < 0.1) {
      return QualitativePerformance.Good;
    } else if (percentAtCap < 0.3) {
      return QualitativePerformance.Ok;
    } else {
      return QualitativePerformance.Fail;
    }
  }

  /** Guide fragment showing a breakdown of each Berserk cast */
  get guideCastBreakdown(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={this.cdSpell} />
        </strong>{' '}
        is our primary damage cooldown. It's best used as soon as it's available, but can be held to
        ensure you'll have full target uptime during its duration (don't use it when it will be
        interrupted by a fight mechanic).{' '}
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
          const percentAtCapPerf = this.getPercentAtCapPerf(percentAtCap);

          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink spell={this.cdSpell} />
            </>
          );

          const checklistItems: CooldownExpandableItem[] = [];
          checklistItems.push({
            label: <>Don't cap on energy</>,
            result: <PerformanceMark perf={percentAtCapPerf} />,
            details: <>({formatPercentage(percentAtCap, 0)}% capped)</>,
          });
          this.hasConvoke &&
            this.hasHeartOfTheLion &&
            checklistItems.push({
              label: (
                <>
                  <SpellLink spell={SPELLS.CONVOKE_SPIRITS} /> during Berserk{' '}
                  <Tooltip
                    hoverable
                    content={
                      <>
                        With <SpellLink spell={TALENTS_DRUID.BERSERK_HEART_OF_THE_LION_TALENT} />,
                        Convoke and Berserk have the same CD and should always be used together.
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
              perf={percentAtCapPerf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    if (!this.hasFrenzy) {
      return undefined;
    }
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_DRUID.BERSERK_FRENZY_TALENT}>
          <ItemPercentDamageDone amount={this.totalDotDamage} />
        </TalentSpellText>
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
