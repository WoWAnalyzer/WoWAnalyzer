import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import HealingValue from 'parser/shared/modules/HealingValue';
import StatTracker from 'parser/shared/modules/StatTracker';
import PlayerBreakdown from 'parser/ui/PlayerBreakdown';
import { ABILITIES_AFFECTED_BY_MASTERY } from '../../constants';
import RestorationAbilityTracker from '../core/RestorationAbilityTracker';

import { Trans } from '@lingui/react/macro';
import { formatPercentage } from 'common/format';
import Panel from 'parser/ui/Panel';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';

class MasteryEffectiveness extends Analyzer {
  static dependencies = {
    abilityTracker: RestorationAbilityTracker,
    combatants: Combatants,
    statTracker: StatTracker,
  };

  totalMasteryHealing = 0;
  totalMaxPotentialMasteryHealing = 0;
  totalMasteryHealingFromGear = 0;
  totalMasteryHealingFromInnate = 0;

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
    const masteryPercent = this.statTracker.currentMasteryPercentage;
    const baseHealingDone = heal.raw / (1 + masteryPercent * masteryEffectiveness);
    const masteryHealingDone = heal.raw - baseHealingDone;

    // Proportional split: if 40% of the mastery percentage came from rating, 40% of this heal's
    // mastery healing is credited to gear. Read per event so trinket procs are attributed to gear.
    const gearShare =
      masteryPercent > 0
        ? Math.min(1, Math.max(0, this.statTracker.gearMasteryPercentage / masteryPercent))
        : 0;
    const effectiveMasteryHealing = Math.max(0, masteryHealingDone - (event.overheal || 0));

    this.totalMasteryHealing += effectiveMasteryHealing;
    this.totalMasteryHealingFromGear += effectiveMasteryHealing * gearShare;
    this.totalMasteryHealingFromInnate += effectiveMasteryHealing * (1 - gearShare);

    // The max potential mastery healing if we had a mastery effectiveness of 100% on this spell. This does NOT include the base healing
    // Example: a heal that did 1,324 healing with 32.4% mastery with 100% mastery effectiveness will have a max potential mastery healing of 324.
    const maxPotentialMasteryHealing = baseHealingDone * masteryPercent; // * 100% mastery effectiveness

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

  /** Share of your mastery healing that came from mastery rating on gear and consumables. */
  get gearMasteryHealingPercent() {
    return this.totalMasteryHealing > 0
      ? this.totalMasteryHealingFromGear / this.totalMasteryHealing
      : 0;
  }

  statistic() {
    const masteryPercent = this.statTracker.currentMasteryPercentage;
    const avgEffectiveMasteryPercent = this.masteryEffectivenessPercent * masteryPercent;

    return [
      <Statistic
        key="Statistic"
        position={STATISTIC_ORDER.CORE(2)}
        size="flexible"
        tooltip={
          <>
            <div>
              <strong>{formatPercentage(masteryPercent)}%</strong> — Your mastery stat. The bonus
              you'd get if every heal landed on someone at 1 HP.
            </div>
            <div>
              <strong>{formatPercentage(this.masteryEffectivenessPercent)}%</strong> — How much of
              that you actually collected by targeting low-health players.
            </div>
            <div>
              <strong>{formatPercentage(avgEffectiveMasteryPercent)}%</strong> — The real increase
              to your healing.
            </div>
            <div>
              <strong>{formatPercentage(this.gearMasteryHealingPercent)}%</strong> — Of that
              increase, the share coming from mastery rating on your gear and consumables. The rest
              comes from your base spellpoints, talents and Skyfury.
            </div>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.DEEP_HEALING}>
          <strong>{formatPercentage(this.masteryEffectivenessPercent)} %</strong>{' '}
          <small>Mastery effectiveness</small>
        </BoringSpellValueText>
      </Statistic>,

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
      if (!ABILITIES_AFFECTED_BY_MASTERY.some((s) => s.id === event.ability.guid)) {
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
