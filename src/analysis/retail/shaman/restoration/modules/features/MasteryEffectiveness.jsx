import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { TooltipElement } from 'interface';
import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import HealingValue from 'parser/shared/modules/HealingValue';
import StatTracker from 'parser/shared/modules/StatTracker';
import Panel from 'parser/ui/Panel';
import PlayerBreakdown from 'parser/ui/PlayerBreakdown';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import { ABILITIES_AFFECTED_BY_MASTERY, BASE_ABILITIES_AFFECTED_BY_MASTERY } from '../../constants';
import RestorationAbilityTracker from '../core/RestorationAbilityTracker';

class MasteryEffectiveness extends Analyzer {
  static dependencies = {
    abilityTracker: RestorationAbilityTracker,
    combatants: Combatants,
    statTracker: StatTracker,
  };

  totalMasteryHealing = 0;
  totalMaxPotentialMasteryHealing = 0;

  masteryHealEvents = [];

  constructor(options) {
    super(options);
    // Totems count as pets, but are still affected by mastery.
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(ABILITIES_AFFECTED_BY_MASTERY),
      this.onHeal,
    );
  }

  onHeal(event) {
    const heal = HealingValue.fromEvent(event);
    const healthBeforeHeal = event.hitPoints - event.amount;
    const masteryEffectiveness = Math.max(0, 1 - healthBeforeHeal / event.maxHitPoints);

    // The base healing of the spell (excluding any healing added by mastery)
    const masteryPercent = this.statTracker.currentMasteryPercentage;
    const baseHealingDone = heal.raw / (1 + masteryPercent * masteryEffectiveness);
    const masteryHealingDone = heal.raw - baseHealingDone;
    // The max potential mastery healing if we had a mastery effectiveness of 100% on this spell. This does NOT include the base healing
    // Example: a heal that did 1,324 healing with 32.4% mastery with 100% mastery effectiveness will have a max potential mastery healing of 324.
    const maxPotentialMasteryHealing = baseHealingDone * masteryPercent; // * 100% mastery effectiveness

    this.totalMasteryHealing += Math.max(0, masteryHealingDone - (event.overheal || 0));
    this.totalMaxPotentialMasteryHealing += Math.max(
      0,
      maxPotentialMasteryHealing - (event.overheal || 0),
    );

    this.masteryHealEvents.push({
      ...event,
      effectiveHealing: heal.effective,
      healthBeforeHeal,
      masteryEffectiveness,
      baseHealingDone,
      masteryHealingDone,
      maxPotentialMasteryHealing,
    });

    event.masteryEffectiveness = masteryEffectiveness;
  }

  get masteryEffectivenessPercent() {
    return this.totalMasteryHealing / this.totalMaxPotentialMasteryHealing;
  }

  statistic() {
    const masteryPercent = this.statTracker.currentMasteryPercentage;
    const avgEffectiveMasteryPercent = this.masteryEffectivenessPercent * masteryPercent;

    return [
      <StatisticBox
        key="StatisticBox"
        icon={<SpellIcon spell={SPELLS.DEEP_HEALING} />}
        value={`${formatPercentage(this.masteryEffectivenessPercent)} %`}
        position={STATISTIC_ORDER.CORE(2)}
        label={
          <TooltipElement
            content={
              <Trans id="shaman.restoration.masteryEffectiveness.statistic.tooltip">
                The percent of your mastery that you benefited from on average (so always between 0%
                and 100%). Since you have {formatPercentage(masteryPercent)}% mastery, this means
                that on average your heals were increased by{' '}
                {formatPercentage(avgEffectiveMasteryPercent)}% by your mastery.
              </Trans>
            }
          >
            <Trans id="shaman.restoration.masteryEffectiveness.statistic.label">
              Mastery benefit
            </Trans>
          </TooltipElement>
        }
      />,
      <Panel
        key="Panel"
        title={
          <Trans id="shaman.restoration.masteryEffectiveness.statistic.panel">
            Mastery effectiveness breakdown
          </Trans>
        }
        position={200}
        pad={false}
      >
        <PlayerBreakdown
          report={this.report}
          spellreport={this.spellReport}
          players={this.owner.players}
        />
      </Panel>,
    ];
  }

  get report() {
    const statsByTargetId = this.masteryHealEvents.reduce((obj, event) => {
      // Update the player-totals
      if (!obj[event.targetID]) {
        const combatant = this.combatants.players[event.targetID];
        obj[event.targetID] = {
          combatant,
          effectiveHealing: 0,
          healingReceived: 0,
          healingFromMastery: 0,
          maxPotentialHealingFromMastery: 0,
        };
      }
      const playerStats = obj[event.targetID];
      playerStats.effectiveHealing += event.effectiveHealing;
      playerStats.healingReceived += event.amount;
      playerStats.healingFromMastery += event.masteryHealingDone;
      playerStats.maxPotentialHealingFromMastery += event.maxPotentialMasteryHealing;

      return obj;
    }, {});

    return statsByTargetId;
  }

  get spellReport() {
    const statsBySpellId = this.masteryHealEvents.reduce((obj, event) => {
      if (!BASE_ABILITIES_AFFECTED_BY_MASTERY.some((s) => s.id === event.ability.guid)) {
        return obj;
      }
      // Update the spell-totals
      if (!obj[event.ability.guid]) {
        obj[event.ability.guid] = {
          spellId: event.ability.guid,
          effectiveHealing: 0,
          healingReceived: 0,
          healingFromMastery: 0,
          maxPotentialHealingFromMastery: 0,
        };
      }
      const spellStats = obj[event.ability.guid];
      spellStats.effectiveHealing += event.effectiveHealing;
      spellStats.healingReceived += event.amount;
      spellStats.healingFromMastery += event.masteryHealingDone;
      spellStats.maxPotentialHealingFromMastery += event.maxPotentialMasteryHealing;

      return obj;
    }, {});

    return statsBySpellId;
  }
}

export default MasteryEffectiveness;
