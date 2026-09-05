import type { JSX } from 'react';
import EventHistory from 'parser/shared/modules/EventHistory';
import ShadowDance, { ShadowDanceData } from '../modules/spells/ShadowDance';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { formatPercentage, formatNumber, formatDurationMillisMinSec } from 'common/format';
import GuideSection from 'interface/guide/components/GuideSection';
import { SpellLink } from 'interface';
import {
  SpellSequence,
  type CastSequenceEntry,
  type CastInSequence,
} from 'interface/guide/components/CastSequence';
import CastOverview from 'interface/guide/components/CastOverview';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import { EventType } from 'parser/core/Events';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import InformationIcon from 'interface/icons/Information';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { PerformanceMark } from 'interface/guide';
import { getHeroTree, getMaxComboPoints, HeroTree } from '../constants';

/** One graded aspect of a Shadow Dance window, rendered as its own row in the cast details. */
interface DanceCheck {
  label: string;
  performance: QualitativePerformance;
  detail: string;
}

/** Secret Technique should be spent as one of the first finishers of the window. */
const SECRET_TECHNIQUE_MAX_FINISHER_POSITION = 2;

/** The one Shadow Dance that is expected to happen without Secret Technique ready. */
const SECOND_DANCE_UNDER_SHADOW_BLADES = 2;

const EVISCERATE_ENERGY_COST = 35;
const SECRET_TECHNIQUE_ENERGY_COST = 30;

class ShadowDanceGuide extends Analyzer.withDependencies({
  damageDone: DamageDone,
  shadowDance: ShadowDance,
  eventHistory: EventHistory,
}) {
  protected damageDone!: DamageDone;
  protected shadowDance!: ShadowDance;
  protected eventHistory!: EventHistory;

  // Derived from the combatant rather than from `this.shadowDance`: injected dependencies are not
  // usable yet while class fields initialize, but `selectedCombatant` reads through `owner`, which
  // the Module constructor has already assigned by then.
  heroTree = getHeroTree(this.selectedCombatant);
  isTrickster = this.heroTree === HeroTree.Trickster;
  isDeathstalker = this.heroTree === HeroTree.Deathstalker;

  private evaluateShadowDanceUsage(dance: ShadowDanceData) {
    const checks = this.isDeathstalker
      ? this.deathstalkerChecks(dance)
      : this.tricksterChecks(dance);

    return {
      timestamp: dance.applied,
      performance: combineQualitativePerformances(checks.map((check) => check.performance)),
      checks,
    };
  }

  /** Renders each graded aspect as its own row, so a failing check is obvious at a glance. */
  private renderChecks(checks: DanceCheck[]) {
    return (
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {checks.map((check) => (
          <li key={check.label}>
            <PerformanceMark perf={check.performance} /> <strong>{check.label}:</strong>{' '}
            {check.detail}
          </li>
        ))}
      </ul>
    );
  }

  /**
   * Deathstalker windows are judged on filling every available GCD, pairing Darkest Night
   * Eviscerates with Ancient Arts, and spending Secret Technique early when it was ready. The
   * window is only as good as its weakest check.
   */
  private deathstalkerChecks(dance: ShadowDanceData): DanceCheck[] {
    // Secret Technique returns null for the one window where not having it is expected, so that
    // check drops out of the grade entirely rather than counting as a pass.
    return [
      this.evaluateAbilityCount(dance),
      this.evaluateAncientArtsPairing(dance),
      this.evaluateSecretTechniqueTiming(dance),
    ].filter((check) => check !== null);
  }

  /**
   * Shadow Dance and Secret Technique are meant to be used together: Secret Technique should be
   * one of the first two finishers of the window. Being a second or so from coming off cooldown
   * still counts as usable, since it lands early enough in the window.
   *
   * The exception is the second Shadow Dance of a Shadow Blades window, which is expected to be
   * cast without Secret Technique available.
   */
  private evaluateSecretTechniqueTiming(dance: ShadowDanceData): DanceCheck | null {
    const label = 'Secret Technique';
    const isSecondDanceUnderShadowBlades =
      dance.danceIndexInShadowBlades === SECOND_DANCE_UNDER_SHADOW_BLADES;

    if (!this.shadowDance.isSecretTechniqueUsable(dance)) {
      if (isSecondDanceUnderShadowBlades) {
        return null;
      }

      return {
        label,
        performance: QualitativePerformance.Fail,
        detail:
          'entered Shadow Dance without it available. The two should be used together, except ' +
          'on the second Shadow Dance of a Shadow Blades window.',
      };
    }

    const position = this.shadowDance.getSecretTechniqueFinisherPosition(dance);

    if (position === null) {
      return {
        label,
        performance: QualitativePerformance.Fail,
        detail: 'was usable in this window but never cast.',
      };
    }

    if (position <= SECRET_TECHNIQUE_MAX_FINISHER_POSITION) {
      return {
        label,
        performance: QualitativePerformance.Perfect,
        detail: `used as finisher #${position}.`,
      };
    }

    return {
      label,
      performance: QualitativePerformance.Fail,
      detail:
        `used as finisher #${position} - it should be one of the first ` +
        `${SECRET_TECHNIQUE_MAX_FINISHER_POSITION}.`,
    };
  }

  /**
   * As Deathstalker, an Eviscerate cast under Darkest Night should also be buffed by Ancient Arts.
   * The last cast of the window is exempt, since there is no room left to line the two up.
   */
  private evaluateAncientArtsPairing(dance: ShadowDanceData): DanceCheck {
    const label = 'Ancient Arts pairing';
    const missed = this.shadowDance.getMissedAncientArtsEviscerates(dance);

    if (missed.length === 0) {
      return {
        label,
        performance: QualitativePerformance.Perfect,
        detail: 'every Eviscerate under Darkest Night was also buffed by Ancient Arts.',
      };
    }

    const timestamps = missed.map((cast) => this.owner.formatTimestamp(cast.timestamp)).join(', ');
    const single = missed.length === 1;

    return {
      label,
      performance: single ? QualitativePerformance.Ok : QualitativePerformance.Fail,
      detail:
        `${missed.length} Eviscerate ${single ? 'cast' : 'casts'} under Darkest Night ` +
        `${single ? 'was' : 'were'} missing Ancient Arts (${timestamps}).`,
    };
  }

  /**
   * How well the window was filled with abilities. Shadow Dance grows with haste through Deepening
   * Shadows, so the number of GCDs that fit is derived from the window's actual duration.
   */
  private evaluateAbilityCount(dance: ShadowDanceData): DanceCheck {
    const label = 'GCDs used';
    const maxAbilities = Math.ceil(dance.duration / 1000);
    const abilitiesUsed = dance.numberAbilitiesUsed || 0;

    if (abilitiesUsed >= maxAbilities) {
      return {
        label,
        performance: QualitativePerformance.Perfect,
        detail: `used all ${maxAbilities} available GCDs.`,
      };
    }

    if (abilitiesUsed === maxAbilities - 1) {
      return {
        label,
        performance: QualitativePerformance.Good,
        detail: `${abilitiesUsed} of ${maxAbilities} - one more would fit.`,
      };
    }

    return {
      label,
      performance: QualitativePerformance.Fail,
      detail: `${abilitiesUsed} of ${maxAbilities} - missing ${
        maxAbilities - abilitiesUsed
      } abilities.`,
    };
  }

  /**
   * Trickster grades the entry conditions and then how well the window was filled. Every check is
   * always evaluated so the reader can see the whole picture, not just the first thing that broke.
   */
  private tricksterChecks(dance: ShadowDanceData): DanceCheck[] {
    return [
      this.evaluateCooldownAlignment(dance),
      this.evaluateEntryEnergy(dance),
      this.evaluateEntryComboPoints(dance),
      this.evaluateAbilityCount(dance),
    ].filter((check) => check !== null);
  }

  /** Shadow Dance wants either Secret Technique ready to pair with, or Shadow Blades running. */
  private evaluateCooldownAlignment(dance: ShadowDanceData): DanceCheck {
    const label = 'Cooldown alignment';

    if (this.shadowDance.isSecretTechniqueUsable(dance)) {
      return {
        label,
        performance: QualitativePerformance.Perfect,
        detail: 'paired with Secret Technique.',
      };
    }

    if (dance.shadowBladesActive) {
      return {
        label,
        performance: QualitativePerformance.Perfect,
        detail: 'used during Shadow Blades.',
      };
    }

    return {
      label,
      performance: QualitativePerformance.Fail,
      detail: 'neither Shadow Blades was active nor Secret Technique was available.',
    };
  }

  /**
   * Whether there was enough energy to fire the opening finisher immediately. Which finisher that
   * is depends on whether Secret Technique was ready.
   */
  private evaluateEntryEnergy(dance: ShadowDanceData): DanceCheck | null {
    const label = 'Energy on entry';
    const secretTechniqueUsable = this.shadowDance.isSecretTechniqueUsable(dance);
    const { spell, cost } = secretTechniqueUsable
      ? { spell: 'Secret Technique', cost: SECRET_TECHNIQUE_ENERGY_COST }
      : { spell: 'Eviscerate', cost: EVISCERATE_ENERGY_COST };

    // Without Secret Technique and without Shadow Blades there is no opener to fund; the cooldown
    // alignment check already covers that window.
    if (!secretTechniqueUsable && !dance.shadowBladesActive) {
      return null;
    }

    if (dance.energyAtCast >= cost) {
      return {
        label,
        performance: QualitativePerformance.Perfect,
        detail: `${dance.energyAtCast} energy, enough for ${spell} (${cost}).`,
      };
    }

    return {
      label,
      performance: QualitativePerformance.Fail,
      detail: `${dance.energyAtCast} energy, not enough for ${spell} (${cost}).`,
    };
  }

  /** Trickster wants to enter at maximum combo points, which Deeper Stratagem raises. */
  private evaluateEntryComboPoints(dance: ShadowDanceData): DanceCheck {
    const label = 'Combo points on entry';
    const max = getMaxComboPoints(this.selectedCombatant);

    if (dance.comboPointsAtCast >= max) {
      return {
        label,
        performance: QualitativePerformance.Perfect,
        detail: `entered at ${max}.`,
      };
    }

    return {
      label,
      performance: QualitativePerformance.Fail,
      detail: `entered with ${dance.comboPointsAtCast} of ${max}.`,
    };
  }

  get guideSubsection(): JSX.Element {
    const shadowDance = <SpellLink spell={SPELLS.SHADOW_DANCE} />;
    const secretTechniques = <SpellLink spell={SPELLS.SECRET_TECHNIQUE} />;
    const shadowBlades = <SpellLink spell={TALENTS.SHADOW_BLADES_TALENT} />;
    const deepeningShadows = <SpellLink spell={TALENTS.DEEPENING_SHADOWS_TALENT} />;

    const explanation = (
      <div>
        <p>
          {shadowDance} is our main short cooldown: increased damage plus enhanced combo point and
          energy generation.
        </p>
        In order to maximize damage you want to:
        <ul>
          {this.isTrickster && <li>Enter with maximum combo points.</li>}
          <li>
            Align it with {secretTechniques}, except on the second use during {shadowBlades}.
          </li>
          {this.isTrickster && <li>Have enough energy to throw your finisher instantly.</li>}
          <li>Fit as many abilities as you can.</li>
          {this.isDeathstalker && (
            <li>
              As Deathstalker, spend {secretTechniques} as one of your first two finishers, and buff
              every <SpellLink spell={SPELLS.EVISCERATE} /> under{' '}
              <SpellLink spell={TALENTS.DARKEST_NIGHT_TALENT} /> with{' '}
              <SpellLink spell={TALENTS.ANCIENT_ARTS_3_SUBTLETY_TALENT} />.
            </li>
          )}
        </ul>
        <h5>
          <InformationIcon />
          <i>Haste and GCDs notes</i>
        </h5>
        <p>
          {deepeningShadows} makes {shadowDance} last longer with haste, so how many GCDs fit
          changes with your gear: a 7.1s window fits 8 abilities, and that last one is tight.
          Macroing {shadowDance} with your first GCD sends both at once - see the macro sections on{' '}
          <a href="https://www.wowhead.com/guide/classes/rogue/subtlety/addons-macro-ui-imports#macros-macros-combining-abilities">
            wowhead
          </a>{' '}
          or{' '}
          <a href="https://www.icy-veins.com/wow/subtlety-rogue-pve-dps-macros-addons">icy-veins</a>
          .
        </p>
      </div>
    );

    const totalDamageTooltip = <>Total Damage done through all {shadowDance} Uses.</>;

    const percentageDuringShadowDanceTooltip = (
      <>Fraction of total damage done through all {shadowDance} Uses.</>
    );

    const activeTimeDuringShadowDanceTooltip = <>Average active time during {shadowDance} casts.</>;

    // Get cast sequences for each Shadow Dance window
    const danceSequenceEvents: CastSequenceEntry<ShadowDanceData>[] =
      this.shadowDance.danceData.map((dance) => {
        const castEvents = this.eventHistory
          .getEvents([EventType.Cast], {
            searchBackwards: false,
            startTimestamp: dance.applied,
            duration: dance.removed - dance.applied,
          })
          .filter(
            (event) =>
              event.ability.guid === SPELLS.SECRET_TECHNIQUE.id ||
              event.ability.guid === SPELLS.EVISCERATE.id ||
              event.ability.guid === SPELLS.COUP_DE_GRACE_CAST.id ||
              event.ability.guid === SPELLS.BLACK_POWDER.id ||
              event.ability.guid === SPELLS.SHADOWSTRIKE.id ||
              event.ability.guid === SPELLS.SHURIKEN_STORM.id,
          );

        // Keyed on timestamp + spell so two casts sharing a timestamp can't be confused for
        // each other. Empty for Trickster, where this rule does not apply.
        const missedAncientArts = new Set(
          this.shadowDance
            .getMissedAncientArtsEviscerates(dance)
            .map((cast) => `${cast.timestamp}-${cast.spellId}`),
        );

        const casts: CastInSequence[] = castEvents.map((event) => {
          const missedBuff = missedAncientArts.has(`${event.timestamp}-${event.ability.guid}`);

          return {
            timestamp: event.timestamp,
            spellId: event.ability.guid,
            spellName: event.ability.name,
            icon: event.ability.abilityIcon.replace('.jpg', ''),
            performance: missedBuff ? QualitativePerformance.Fail : undefined,
            // The shared default tooltip only shows the spell name. Timestamps have to be added
            // here because formatting them relative to the pull needs the parser, which the
            // sequence component has no access to.
            tooltip: (
              <div>
                <strong>{event.ability.name}</strong>
                <div>{this.owner.formatTimestamp(event.timestamp)}</div>
                {missedBuff && <div>Cast under Darkest Night without Ancient Arts</div>}
              </div>
            ),
          };
        });

        dance.numberAbilitiesUsed = castEvents.length;

        return {
          data: dance,
          start: dance.applied,
          end: dance.removed,
          casts: casts,
        };
      });

    const perCastData: PerCastData[] = this.shadowDance.danceData.map((dance, index) => {
      const evaluation = this.evaluateShadowDanceUsage(dance);
      const sequenceEntry = danceSequenceEvents[index];
      return {
        performance: evaluation.performance,
        timestamp: this.owner.formatTimestamp(dance.applied),
        stats: [
          {
            value: formatNumber(dance.totalDamage),
            label: 'Damage',
            tooltip: <>Total damage accumulated during this Shadow Dance</>,
          },
          {
            value: `${formatDurationMillisMinSec(dance.duration, 2)}`,
            label: 'Duration',
            tooltip: <>Duration of this Shadow Dance</>,
          },
          {
            value: formatNumber(dance.numberAbilitiesUsed || 0),
            label: 'Casts',
            tooltip: <>Total casts</>,
          },
        ],
        details: this.renderChecks(evaluation.checks),
        additionalContent: sequenceEntry
          ? {
              title: 'Cast Sequence',
              content: <SpellSequence casts={sequenceEntry.casts} iconSize={40} />,
            }
          : undefined,
      };
    });

    return (
      <GuideSection spell={SPELLS.SHADOW_DANCE} explanation={explanation}>
        <CastOverview
          spell={SPELLS.SHADOW_DANCE}
          stats={[
            {
              value: `${formatNumber(this.shadowDance.danceTotalDamage)}`,
              label: 'Damage during Shadow Dance',
              tooltip: totalDamageTooltip,
              performance: QualitativePerformance.Good,
            },
            {
              value: `${formatPercentage(this.shadowDance.danceTotalDamage / this.damageDone.total.effective)}%`,
              label: 'of Overall Damage',
              tooltip: percentageDuringShadowDanceTooltip,
              performance: QualitativePerformance.Good,
            },
            {
              value: `${formatPercentage(this.shadowDance.averageActiveTime)}%`,
              label: 'active time during Shadow Dance',
              tooltip: activeTimeDuringShadowDanceTooltip,
              performance: QualitativePerformance.Good,
            },
          ]}
        />
        <CastDetail title="Shadow Dance Details" casts={perCastData} />
      </GuideSection>
    );
  }
}

export default ShadowDanceGuide;
