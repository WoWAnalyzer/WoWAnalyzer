import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import TalentsTab from 'Main/TalentsTab';
import CooldownsTab from 'Main/CooldownsTab';
import ManaTab from 'Main/ManaTab';
import LowHealthHealingTab from 'Main/LowHealthHealingTab';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';

import HealingDone from './Modules/PaladinCore/HealingDone';
import CastEfficiency from './Modules/PaladinCore/CastEfficiency';
import PaladinAbilityTracker from './Modules/PaladinCore/PaladinAbilityTracker';
import BeaconHealOriginMatcher from './Modules/PaladinCore/BeaconHealOriginMatcher';
import BeaconTargets from './Modules/PaladinCore/BeaconTargets';
import BeaconHealing from './Modules/PaladinCore/BeaconHealing';
import InfusionOfLightCastRatio from './Modules/PaladinCore/InfusionOfLightCastRatio';
import UnusedInfusionOfLights from './Modules/PaladinCore/UnusedInfusionOfLights';
import FilledCastRatio from './Modules/PaladinCore/FilledCastRatio';
import Overhealing from './Modules/PaladinCore/Overhealing';
import FillerLightOfTheMartyrs from './Modules/PaladinCore/FillerLightOfTheMartyrs';

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

    // PaladinCore
    healingDone: HealingDone,
    castEfficiency: CastEfficiency,
    beaconHealOriginMatcher: BeaconHealOriginMatcher,
    beaconTargets: BeaconTargets,
    beaconHealing: BeaconHealing,
    infusionOfLightCastRatio: InfusionOfLightCastRatio,
    unusedInfusionOfLights: UnusedInfusionOfLights,
    filledCastRatio: FilledCastRatio,
    overhealing: Overhealing,
    fillerLightOfTheMartyrs: FillerLightOfTheMartyrs,

    // Features
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
        title: 'Cooldowns',
        url: 'cooldowns',
        render: () => (
          <CooldownsTab
            fightStart={this.fight.start_time}
            fightEnd={this.fight.end_time}
            cooldowns={this.modules.cooldownTracker.pastCooldowns}
            showOutputStatistics
            showResourceStatistics
          />
        ),
      },
      {
        title: 'Talents',
        url: 'talents',
        render: () => (
          <TalentsTab combatant={this.selectedCombatant} />
        ),
      },
      {
        title: 'Mana',
        url: 'mana',
        render: () => (
          <ManaTab
            reportCode={this.report.code}
            actorId={this.playerId}
            start={this.fight.start_time}
            end={this.fight.end_time}
          />
        ),
      },
      {
        title: 'Low health healing',
        url: 'low-health-healing',
        render: () => (
          <LowHealthHealingTab parser={this} />
        ),
      },
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
