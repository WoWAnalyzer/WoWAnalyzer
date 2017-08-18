import React from 'react';

import SPELLS from 'common/SPELLS';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';
import Mana from 'Main/Mana';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import LowHealthHealing from 'Parser/Core/Modules/LowHealthHealing';

import HealingDone from './Modules/PaladinCore/HealingDone';
import PaladinAbilityTracker from './Modules/PaladinCore/PaladinAbilityTracker';
import BeaconHealOriginMatcher from './Modules/PaladinCore/BeaconHealOriginMatcher';
import BeaconTargets from './Modules/PaladinCore/BeaconTargets';
import BeaconHealing from './Modules/PaladinCore/BeaconHealing';
import InfusionOfLightCastRatio from './Modules/PaladinCore/InfusionOfLightCastRatio';
import UnusedInfusionOfLights from './Modules/PaladinCore/UnusedInfusionOfLights';
import FilledCastRatio from './Modules/PaladinCore/FilledCastRatio';
import Overhealing from './Modules/PaladinCore/Overhealing';
import FillerLightOfTheMartyrs from './Modules/PaladinCore/FillerLightOfTheMartyrs';
import LightOfDawn from './Modules/PaladinCore/LightOfDawn';

import CastEfficiency from './Modules/Features/CastEfficiency';
import MasteryEffectiveness from './Modules/Features/MasteryEffectiveness';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import SacredDawn from './Modules/Features/SacredDawn';
import TyrsDeliverance from './Modules/Features/TyrsDeliverance';
import CooldownTracker from './Modules/Features/CooldownTracker';

import RuleOfLaw from './Modules/Talents/RuleOfLaw';
import DevotionAura from './Modules/Talents/DevotionAura';
import AuraOfSacrifice from './Modules/Talents/AuraOfSacrifice';
import AuraOfMercy from './Modules/Talents/AuraOfMercy';
import HolyAvenger from './Modules/Talents/HolyAvenger';
import DivinePurpose from './Modules/Talents/DivinePurpose';

import DrapeOfShame from './Modules/Items/DrapeOfShame';
import Ilterendi from './Modules/Items/Ilterendi';
import ChainOfThrayn from './Modules/Items/ChainOfThrayn';
import ObsidianStoneSpaulders from './Modules/Items/ObsidianStoneSpaulders';
import MaraadsDyingBreath from './Modules/Items/MaraadsDyingBreath';
import SoulOfTheHighlord from './Modules/Items/SoulOfTheHighlord';
import Tier19_4set from './Modules/Items/Tier19_4set';
import Tier20_4set from './Modules/Items/Tier20_4set';
import Tier21_2set from './Modules/Items/Tier21_2set';
import Tier21_4set from './Modules/Items/Tier21_4set';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

class CombatLogParser extends MainCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Override the ability tracker so we also get stats for IoL and beacon healing
    abilityTracker: PaladinAbilityTracker,
    lowHealthHealing: LowHealthHealing,

    // PaladinCore
    healingDone: HealingDone,
    beaconHealOriginMatcher: BeaconHealOriginMatcher,
    beaconTargets: BeaconTargets,
    beaconHealing: BeaconHealing,
    infusionOfLightCastRatio: InfusionOfLightCastRatio,
    unusedInfusionOfLights: UnusedInfusionOfLights,
    filledCastRatio: FilledCastRatio,
    overhealing: Overhealing,
    fillerLightOfTheMartyrs: FillerLightOfTheMartyrs,
    lightOfDawn: LightOfDawn,

    // Features
    castEfficiency: CastEfficiency,
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    sacredDawn: SacredDawn,
    tyrsDeliverance: TyrsDeliverance,
    cooldownTracker: CooldownTracker,

    // Talents
    ruleOfLaw: RuleOfLaw,
    devotionAura: DevotionAura,
    auraOfSacrifice: AuraOfSacrifice,
    auraOfMercy: AuraOfMercy,
    holyAvenger: HolyAvenger,
    divinePurpose: DivinePurpose,

    // Items:
    drapeOfShame: DrapeOfShame,
    ilterendi: Ilterendi,
    chainOfThrayn: ChainOfThrayn,
    obsidianStoneSpaulders: ObsidianStoneSpaulders,
    maraadsDyingBreath: MaraadsDyingBreath,
    soulOfTheHighlord: SoulOfTheHighlord,
    tier19_4set: Tier19_4set,
    tier20_4set: Tier20_4set,
    tier21_2set: Tier21_2set,
    tier21_4set: Tier21_4set,
  };

  parseEvents(events) {
    return super.parseEvents(this.reorderEvents(events));
  }

  /**
   * when you cast Light of Dawn and you yourself are one of the targets the heal event will be in the events log before the cast event. This can make parsing certain things rather hard, so we need to swap them around.
   * @param {Array} events
   * @returns {Array}
   */
  reorderEvents(events) { // TODO: Unit test
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (event.type === 'cast' && event.ability.guid === SPELLS.LIGHT_OF_DAWN_CAST.id) {
        const castTimestamp = event.timestamp;

        // Loop through the event history in reverse to detect if there was a `heal` event on the same player that was the result of this cast and thus misordered
        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex--) {
          const previousEvent = fixedEvents[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > 50) { // the max delay between the heal and cast events never looks to be more than this.
            break;
          }
          if (previousEvent.type === 'heal' && previousEvent.ability.guid === SPELLS.LIGHT_OF_DAWN_HEAL.id && previousEvent.sourceID === event.sourceID) {
            fixedEvents.splice(previousEventIndex, 1);
            fixedEvents.push(previousEvent);
            break; // I haven't seen a log with multiple `heal` events before the `cast` yet
          }
        }
      }
    });

    return fixedEvents;
  }

  generateResults() {
    const results = super.generateResults();

    // TODO: Suggestion for Devo when it didn't prevent enough damage to be worthwhile
    // TODO: Suggestion for mana
    // TODO: Suggestion for enchants
    // TODO: Sanctified Wrath healing contribution

    results.tabs = [
      {
        title: 'Suggestions',
        url: 'suggestions',
        render: () => (
          <SuggestionsTab issues={results.issues} />
        ),
      },
      {
        title: 'Talents',
        url: 'talents',
        render: () => (
          <Tab title="Talents">
            <Talents combatant={this.selectedCombatant} />
          </Tab>
        ),
      },
      {
        title: 'Mana',
        url: 'mana',
        render: () => (
          <Tab title="Mana" style={{ padding: '15px 22px' }}>
            <Mana
              reportCode={this.report.code}
              actorId={this.playerId}
              start={this.fight.start_time}
              end={this.fight.end_time}
            />
          </Tab>
        ),
      },
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
