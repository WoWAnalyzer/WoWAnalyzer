import type { JSX } from 'react';
import EventHistory from 'parser/shared/modules/EventHistory';
import ShadowDance, { ShadowDanceData } from '../modules/spells/ShadowDance';
import EnergyTracker from 'analysis/retail/rogue/shared/EnergyTracker';
import ComboPointTracker from 'analysis/retail/rogue/shared/ComboPointTracker';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { formatPercentage, formatNumber } from 'common/format';
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

class ShadowDanceGuide extends Analyzer {
  static dependencies = {
    damageDone: DamageDone,
    energyTracker: EnergyTracker,
    comboPointTracker: ComboPointTracker,
    shadowDance: ShadowDance,
    eventHistory: EventHistory,
    spellUsable: SpellUsable,
  };

  protected damageDone!: DamageDone;
  protected energyTracker!: EnergyTracker;
  protected comboPointTracker!: ComboPointTracker;
  protected shadowDance!: ShadowDance;
  protected eventHistory!: EventHistory;
  protected spellUsable!: SpellUsable;

  isTrickster: boolean = this.selectedCombatant.hasTalent(TALENTS.UNSEEN_BLADE_TALENT);
  isDeathstalker: boolean = this.selectedCombatant.hasTalent(TALENTS.DEATHSTALKERS_MARK_TALENT);

  private evaluateShadowDanceUsage(dance: ShadowDanceData) {
    const energyAtCast = this.energyTracker.current;
    const comboPointsAtCast = this.comboPointTracker.current;
    const hasShadowBladesActive =
      this.shadowDance.hasShadowBlades &&
      this.selectedCombatant.hasBuff(TALENTS.SHADOW_BLADES_TALENT, dance.applied);
    const secTecOnCooldown = this.spellUsable.isOnCooldown(SPELLS.SECRET_TECHNIQUE.id);
    const cooldownsReady = secTecOnCooldown && !hasShadowBladesActive;
    const enoughEnergyForEviscerate =
      hasShadowBladesActive && secTecOnCooldown && energyAtCast < 35;
    const enoughEnergyForSecTec = !secTecOnCooldown && energyAtCast < 30;
    const maxAbilities = Math.ceil(dance.duration / 1000);
    const abilitiesUsed = dance.numberAbilitiesUsed || 0;

    // Cooldown Availability
    if (cooldownsReady) {
      return {
        timestamp: dance.applied,
        performance: QualitativePerformance.Fail,
        reason:
          'Shadow Dance was used when neither Shadow Blades was active nor Secret Technique was available.',
      };
    }

    // Energy check for second SD cast during Shadow Blades
    if (enoughEnergyForEviscerate) {
      return {
        timestamp: dance.applied,
        performance: QualitativePerformance.Fail,
        reason: `Enter Shadow Dance without enough energy for Eviscerate(35). Had ${energyAtCast} energy.`,
      };
    }

    // Energy check for SD and SecTec (with our without Shadow Blades)
    if (enoughEnergyForSecTec) {
      return {
        timestamp: dance.applied,
        performance: QualitativePerformance.Fail,
        reason: `Enter Shadow Dance without enough energy for Secret Technique(30). Had ${energyAtCast} energy.`,
      };
    }

    // Combo Point check
    if (comboPointsAtCast < 6) {
      return {
        timestamp: dance.applied,
        performance: QualitativePerformance.Fail,
        reason: `Enter Shadow Dance with suboptimal combo points. Had ${comboPointsAtCast} combo points.`,
      };
    }

    if (abilitiesUsed === maxAbilities) {
      return {
        timestamp: dance.applied,
        performance: QualitativePerformance.Perfect,
        reason: `Excellent Shadow Dance usage! You spend all possible gcds using abilities.`,
      };
    }

    if (abilitiesUsed === maxAbilities - 1) {
      return {
        timestamp: dance.applied,
        performance: QualitativePerformance.Good,
        reason: `Good Shadow Dance usage! You could have been casted one more ability during this Shadow Dance.`,
      };
    }

    return {
      timestamp: dance.applied,
      performance: QualitativePerformance.Fail,
      reason: `Shadow Dance uptime was suboptimal. You missed ${maxAbilities - abilitiesUsed} abilities.`,
    };
  }

  get guideSubsection(): JSX.Element {
    const shadowDance = <SpellLink spell={SPELLS.SHADOW_DANCE} />;
    const secretTechniques = <SpellLink spell={SPELLS.SECRET_TECHNIQUE} />;
    const shadowBlades = <SpellLink spell={TALENTS.SHADOW_BLADES_TALENT} />;
    const deepeningShadows = <SpellLink spell={TALENTS.DEEPENING_SHADOWS_TALENT} />;

    const explanation = (
      <>
        <p>
          {shadowDance} is our main short time cooldown. It interacts with several talents in our
          tree. During {shadowDance} we have increased damage and enhanced combo point and energy
          generation.
        </p>
        <p>
          In order to maximize damage you want to:
          <ul>
            {this.isTrickster && <li>Enter with 6+ combo points.</li>}
            {this.isDeathstalker && <li>Enter with low combo points.</li>}
            <li>
              Aling this cooldown with {secretTechniques}, except in the second use during{' '}
              {shadowBlades}.
            </li>
            <li>
              Make sure you have enough energy to instantly throw your finisher, this is a common
              mistake.
            </li>
            <li>Cast as many abilities as you can.</li>
          </ul>
        </p>

        <p>
          <h4>
            <i>Haste notes</i>
          </h4>
          {shadowDance} duration increases with flat haste stat due to {deepeningShadows}.<br />
          i.e. if your {shadowDance} lasts 7.1s, you will want to squeeze 8 abilities within it.
          Sometimes that .1s window is very tight.
          <br />
          If youre struggling to squeeze that last ability, you might want to increase your haste a
          bit. Macros are of particular interest here They will allow you to throw the first ability
          at the same time than {shadowDance}.<br />
          Check
          <a href="https://www.wowhead.com/guide/classes/rogue/subtlety/addons-macro-ui-imports#macros-macros-combining-abilities">
            {' '}
            wowhead{' '}
          </a>
          or
          <a href="https://www.icy-veins.com/wow/subtlety-rogue-pve-dps-macros-addons">
            {' '}
            icy-veins{' '}
          </a>
          macros section for more information.
        </p>
      </>
    );

    const totalDamageTooltip = <>Total Damage done through all {shadowDance} Uses.</>;

    const percentageDuringShadowDanceTooltip = (
      <>Fraction of total damage done through all {shadowDance} Uses.</>
    );

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

        const casts: CastInSequence[] = castEvents.map((event) => ({
          timestamp: event.timestamp,
          spellId: event.ability.guid,
          spellName: event.ability.name,
          icon: event.ability.abilityIcon.replace('.jpg', ''),
          performance: undefined,
        }));

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
            value: `${formatNumber(dance.duration)}s`,
            label: 'Duration',
            tooltip: <>Duration of this Shadow Dance</>,
          },
          {
            value: formatNumber(dance.numberAbilitiesUsed || 0),
            label: 'Casts',
            tooltip: <>Total casts</>,
          },
        ],
        details: evaluation.reason,
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
          ]}
        />
        <CastDetail title="Shadow Dance Details" casts={perCastData} />
      </GuideSection>
    );
  }
}

export default ShadowDanceGuide;
