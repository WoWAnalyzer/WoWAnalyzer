import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Abilities from 'Parser/Core/Modules/Abilities';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import ManaValues from 'Parser/Core/Modules/ManaValues';
import VelensFutureSight from 'Parser/Core/Modules/Items/Legion/Legendaries/VelensFutureSight';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

import MasteryEffectiveness from '../MasteryEffectiveness';
import AlwaysBeCasting from '../AlwaysBeCasting';
import BeaconHealing from '../../PaladinCore/BeaconHealing';
import FillerLightOfTheMartyrs from '../../PaladinCore/FillerLightOfTheMartyrs';
import FillerFlashOfLight from '../../PaladinCore/FillerFlashOfLight';
import AuraOfSacrifice from '../../Talents/AuraOfSacrifice';
import Ilterendi from '../../Items/Ilterendi';
import Overhealing from '../../PaladinCore/Overhealing';
import JudgmentOfLight from '../../Talents/JudgmentOfLight';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    beaconHealing: BeaconHealing,
    fillerLightOfTheMartyrs: FillerLightOfTheMartyrs,
    fillerFlashOfLight: FillerFlashOfLight,
    manaValues: ManaValues,
    auraOfSacrifice: AuraOfSacrifice,
    ilterendi: Ilterendi,
    velensFutureSight: VelensFutureSight,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    overhealing: Overhealing,
    enchantChecker: EnchantChecker,
    judgmentOfLight: JudgmentOfLight,
  };

  render() {
    return (
      <Component
        abilities={this.abilities}
        thresholds={{
          fillerFlashOfLight: this.fillerFlashOfLight.suggestionThresholds,
          masteryEffectiveness: this.masteryEffectiveness.suggestionThresholds,
          nonHealingTimeSuggestionThresholds: this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          beaconHealing: this.beaconHealing.suggestionThresholds,
          fillerLightOfTheMartyrsCpm: this.fillerLightOfTheMartyrs.cpmSuggestionThresholds,
          fillerLightOfTheMartyrsInefficientCpm: this.fillerLightOfTheMartyrs.inefficientCpmSuggestionThresholds,
          manaLeft: this.manaValues.suggestionThresholds,
          overhealing: {
            holyShock: this.overhealing.holyShockSuggestionThresholds,
            lightOfDawn: this.overhealing.lightOfDawnSuggestionThresholds,
            flashOfLight: this.overhealing.flashOfLightSuggestionThresholds,
            bestowFaith: this.overhealing.bestowFaithSuggestionThresholds,
          },
        }}
      />
    );
  }
}

export default Checklist;
