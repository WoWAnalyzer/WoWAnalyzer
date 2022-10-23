import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellIcon } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HotTracker from 'parser/shared/modules/HotTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import HotTrackerMW from '../core/HotTrackerMW';

const debug = false;

const ENVELOPING_MIST_HARDCAST = 'Enveloping Mist Hardcast';
const RISING_MIST_EXTENSION = 4000;
const RENEWING_MIST_HARDCAST = 'Renewing Mist Hardcast';

const UNAFFECTED_SPELLS = [TALENTS_MONK.ENVELOPING_MIST_TALENT.id];

class RisingMist extends Analyzer {
  get averageExtension() {
    return this.risingMistCount === 0
      ? 0
      : this.risingMists.reduce((acc, risingMist) => acc + risingMist.totalExtension, 0) /
          this.risingMistCount /
          1000;
  }

  get hotHealing() {
    let value = 0;
    this.hotTracker.hotHistory.forEach(
      function (hot) {
        if (this.hotTracker.fromHardcast(hot)) {
          value += hot.healingAfterOriginalEnd || 0;
        }
      }.bind(this),
    );
    return value;
  }

  get directHealing() {
    return this.abilityTracker.getAbility(SPELLS.RISING_MIST_HEAL.id).healingEffective;
  }

  get totalHealing() {
    return (
      this.hotHealing +
      this.directHealing +
      this.extraMasteryhealing +
      this.extraVivHealing +
      this.extraEnvBonusHealing
    );
  }

  get averageHealing() {
    return this.risingMistCount === 0 ? 0 : this.totalHealing / this.risingMistCount;
  }

  get averageTargetsPerRM() {
    return this.targetCount / this.risingMistCount || 0;
  }

  get calculateVivOverHealing() {
    return formatPercentage(
      this.extraVivOverhealing / (this.extraVivHealing + this.extraVivOverhealing),
    );
  }

  get calculateMasteryOverHealing() {
    return formatPercentage(
      this.extraMasteryOverhealing / (this.extraMasteryhealing + this.extraMasteryOverhealing),
    );
  }

  get calculateEFOverHealing() {
    return formatPercentage(
      this.extraEFOverhealing / (this.extraEFhealing + this.extraEFOverhealing),
    );
  }

  static dependencies = {
    hotTracker: HotTrackerMW,
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };
  risingMistCount = 0;
  risingMists = [];
  remCount = 0;
  efCount = 0;
  flsEfCount = 0;
  evmCount = 0;
  targetCount = 0;
  trackUplift = false;
  extraVivCleaves = 0;
  extraVivHealing = 0;
  extraVivOverhealing = 0;
  extraVivAbsorbed = 0;
  extraEnvHits = 0;
  extraEnvBonusHealing = 0;
  extraMasteryHits = 0;
  extraMasteryhealing = 0;
  extraMasteryOverhealing = 0;
  extraMasteryAbsorbed = 0;
  masteryTickTock = false;
  extraEFhealing = 0;
  extraEFOverhealing = 0;
  extraEFAbsorbed = 0;

  constructor(...options) {
    super(...options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT.id);
    this.evmHealingIncrease = this.selectedCombatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT.id)
      ? 0.4
      : 0.3;
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.RISING_SUN_KICK_TALENT),
      this.extendHots,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.handleVivify);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.calculateEnv); //gotta just look at all heals tbh
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.handleMastery,
    );
  }

  hasAttribution(attributions, name) {
    return attributions.some(function (attr) {
      return attr.name === name;
    });
  }

  handleMastery(event) {
    const targetId = event.targetID;
    if (
      !this.hotTracker.hots[targetId] ||
      (!this.hotTracker.hots[targetId][SPELLS.ESSENCE_FONT_BUFF.id] &&
        !this.hotTracker.hots[targetId][SPELLS.FAELINE_STOMP_ESSENCE_FONT.id])
    ) {
      return;
    }

    const object = this.hotTracker.hots[targetId][SPELLS.ESSENCE_FONT_BUFF.id]
      ? this.hotTracker.hots[targetId][SPELLS.ESSENCE_FONT_BUFF.id]
      : this.hotTracker.hots[targetId][SPELLS.FAELINE_STOMP_ESSENCE_FONT.id];

    if (object.originalEnd < event.timestamp) {
      if (!this.masteryTickTock) {
        this.extraMasteryHits += 1;
        this.extraMasteryhealing += event.amount || 0;
        this.extraMasteryOverhealing += event.overheal || 0;
        this.extraMasteryAbsorbed += event.absorbed || 0;
      }
      this.masteryTickTock = !this.masteryTickTock;
    }
  }

  calculateEnv(event) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;
    if (
      !this.hotTracker.hots[targetId] ||
      (!this.hotTracker.hots[targetId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id] &&
        !this.hotTracker.hots[targetId][SPELLS.ENVELOPING_MIST_TFT.id])
    ) {
      return;
    }
    const object = this.hotTracker.hots[targetId][TALENTS_MONK.ENVELOPING_MIST_TALENT.id];

    if (
      !this.hasAttribution(object.attributions, ENVELOPING_MIST_HARDCAST) ||
      UNAFFECTED_SPELLS.includes(spellId)
    ) {
      return;
    }

    if (object.originalEnd < event.timestamp) {
      this.extraEnvHits += 1;
      this.extraEnvBonusHealing += calculateEffectiveHealing(event, this.evmHealingIncrease);
    }
  }

  handleVivify(event) {
    const targetId = event.targetID;
    if (
      !this.hotTracker.hots[targetId] ||
      !this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id];
    if (
      this.hasAttribution(hot.attributions, RENEWING_MIST_HARDCAST) &&
      hot.originalEnd < event.timestamp &&
      event.timestamp < hot.end
    ) {
      this.extraVivCleaves += 1;
      this.extraVivHealing += event.amount || 0;
      this.extraVivOverhealing += event.overheal || 0;
      this.extraVivAbsorbed += event.absorbed || 0;
    }
  }

  extendHots(event) {
    const spellId = event.ability.guid;
    if (TALENTS_MONK.RISING_SUN_KICK_TALENT.id !== spellId) {
      return;
    }

    this.risingMistCount += 1;
    debug && console.log(`risingMist cast #: ${this.risingMistCount}`);

    const newRisingMist = HotTracker.getNewAttribution(`RisingMist #${this.risingMistCount}`);
    this.risingMists.push(newRisingMist);

    let foundTarget = false;
    const untrackedSpells = [SPELLS.ESSENCE_FONT_BUFF.id, SPELLS.FAELINE_STOMP_ESSENCE_FONT.id];
    Object.keys(this.hotTracker.hots).forEach((playerId) => {
      Object.keys(this.hotTracker.hots[playerId]).forEach((spellIdString) => {
        const spellId = Number(spellIdString);

        const attribution = newRisingMist;
        const hot = this.hotTracker.hots[playerId][spellId];
        if (!untrackedSpells.includes(spellId) && !this.hotTracker.fromHardcast(hot)) {
          return;
        }
        this.hotTracker.addExtension(
          attribution,
          RISING_MIST_EXTENSION,
          playerId,
          spellId,
          event.timestamp,
        );

        if (spellId === SPELLS.ESSENCE_FONT_BUFF.id) {
          foundTarget = true;
          this.efCount += 1;
        } else if (spellId === SPELLS.FAELINE_STOMP_ESSENCE_FONT.id) {
          foundTarget = true;
          this.flsEfCount += 1;
        } else if (spellId === SPELLS.RENEWING_MIST_HEAL.id) {
          foundTarget = true;
          this.remCount += 1;
        } else if (
          spellId === TALENTS_MONK.ENVELOPING_MIST_TALENT.id ||
          spellId === SPELLS.ENVELOPING_MIST_TFT.id
        ) {
          foundTarget = true;
          this.evmCount += 1;
        }
      });
    });
    if (foundTarget) {
      this.targetCount += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Your {this.risingMistCount} Rising Sun Kick casts contributed the following healing:
            <ul>
              <li>HoT Extension Healing: {formatNumber(this.hotHealing)}</li>
              <li>Rising Mist Direct Healing: {formatNumber(this.directHealing)}</li>
              <li>Average HoT Extension Seconds per cast: {this.averageExtension.toFixed(2)}</li>
              <ul>
                <li>Essence Font HoTs Extended: {this.efCount}</li>
                {this.selectedCombatant.hasTalent(TALENTS_MONK.FAELINE_STOMP_TALENT) && (
                  <li>FLS Essence Font HoTs extended: {this.flsEfCount}</li>
                )}
                <li>Renewing Mist HoTs Extended: {this.remCount}</li>
                <li>Enveloping Mist HoTs Extended: {this.evmCount}</li>
              </ul>
              Vivify
              <ul>
                <li>Extra Cleaves: {this.extraVivCleaves}</li>
                <li>
                  Extra Healing: {formatNumber(this.extraVivHealing)} (
                  {this.calculateVivOverHealing}% Overhealing)
                </li>
              </ul>
              Enveloping Mist
              <ul>
                <li>Extra Hits: {this.extraEnvHits}</li>
                <li>Extra Healing: {formatNumber(this.extraEnvBonusHealing)}</li>
              </ul>
              Mastery
              <ul>
                <li>Extra Hits: {this.extraMasteryHits}</li>
                <li>
                  Extra Healing: {formatNumber(this.extraMasteryhealing)} (
                  {this.calculateMasteryOverHealing}% Overhealing)
                </li>
              </ul>
            </ul>
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellIcon id={TALENTS_MONK.RISING_MIST_TALENT.id} /> Healing Contributed
            </>
          }
        >
          <>
            {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalHealing))}% total
            healing
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default RisingMist;
