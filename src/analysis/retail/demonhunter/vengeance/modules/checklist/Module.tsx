import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseModule from 'parser/shared/modules/features/Checklist/Module';

import AlwaysBeCasting from '../features/AlwaysBeCasting';
import FuryDetails from '../resourcetracker/FuryDetails';
import DemonSpikes from '../spells/DemonSpikes';
import ShearFracture from '../spells/ShearFracture';
import SoulsOvercap from '../statistics/SoulsOvercap';
import SoulBarrier from '../talents/SoulBarrier';
import FrailtyDebuff from '../talents/FrailtyDebuff';
import Component from './Component';
import PainbringerBuff from '../talents/PainbringerBuff';

class Checklist extends BaseModule {
  static dependencies = {
    ...BaseModule.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    // Buffs-Debuffs
    painbringerBuff: PainbringerBuff,
    frailtyDebuff: FrailtyDebuff,

    // Talents
    soulBarrier: SoulBarrier,

    // Spells
    demonSpikes: DemonSpikes,
    shearFracture: ShearFracture,

    // Resources
    furyDetails: FuryDetails,
    soulsOvercap: SoulsOvercap,
  };

  //region Core
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  //endregion

  //region Buffs and Debuffs
  protected painbringerBuff!: PainbringerBuff;
  protected frailtyDebuff!: FrailtyDebuff;
  //endregion

  //region Talents
  protected soulBarrier!: SoulBarrier;
  //endregion

  //region Spells
  protected demonSpikes!: DemonSpikes;
  protected shearFracture!: ShearFracture;
  //endregion

  //region Resources
  protected furyDetails!: FuryDetails;
  protected soulsOvercap!: SoulsOvercap;

  //endregion

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          painbringerBuff: this.painbringerBuff.uptimeSuggestionThresholds,
          frailtyDebuff: this.frailtyDebuff.uptimeSuggestionThresholds,
          soulBarrier: this.soulBarrier.suggestionThresholdsEfficiency,
          demonSpikes: this.demonSpikes.suggestionThresholdsEfficiency,
          furyDetails: this.furyDetails.suggestionThresholds,
          soulsOvercap: this.soulsOvercap.suggestionThresholdsEfficiency,
          shearFracture: this.shearFracture.wastedCasts,
        }}
      />
    );
  }
}

export default Checklist;
