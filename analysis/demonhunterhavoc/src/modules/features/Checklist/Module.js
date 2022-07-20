import PreparationRuleAnalyzer from 'parser/shadowlands/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseModule from 'parser/shared/modules/features/Checklist/Module';
import ManaValues from 'parser/shared/modules/ManaValues';

import SinfulBrandUptime from '../../covenants/SinfulBrandUptime';
import FuryDetails from '../../resourcetracker/FuryDetails';
import DemonBite from '../../spells/DemonBite';
import BlindFury from '../../talents/BlindFury';
import DemonBlades from '../../talents/DemonBlades';
import Demonic from '../../talents/Demonic';
import DemonicAppetite from '../../talents/DemonicAppetite';
import FelBarrage from '../../talents/FelBarrage';
import Felblade from '../../talents/Felblade';
import FelEruption from '../../talents/FelEruption';
import ImmolationAura from '../../talents/ImmolationAura';
import Momentum from '../../talents/Momentum';
import AlwaysBeCasting from '../AlwaysBeCasting';
import Component from './Component';

class Checklist extends BaseModule {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    manaValues: ManaValues,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    // Short CDs
    felblade: Felblade,
    immolationAura: ImmolationAura,

    // Don't waste casts
    blindFury: BlindFury,
    demonic: Demonic,
    felBarrage: FelBarrage,
    felEruption: FelEruption,

    // Maintain buffs/debuffs
    momentum: Momentum,
    sinfulBrandUptime: SinfulBrandUptime,

    // Use your offensive cool downs

    // Manage your fury properly
    demonBite: DemonBite,
    demonicAppetite: DemonicAppetite,
    demonBlades: DemonBlades,
    furyDetails: FuryDetails,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,

          // Short CDs
          felbladeEfficiency: this.felblade.suggestionThresholds,
          immolationAuraEfficiency: this.immolationAura.suggestionThresholds,

          // Don't waste casts
          blindFuryBadCasts: this.blindFury.suggestionThresholds,
          demonicBadCasts: this.demonic.suggestionThresholds,
          felBarrageBadCasts: this.felBarrage.suggestionThresholds,
          felEruptionBadCasts: this.felEruption.suggestionThresholds,

          // Maintain buffs/debuffs
          momentumBuffUptime: this.momentum.suggestionThresholds,
          sinfulBrandUptime: this.sinfulBrandUptime.suggestionThresholds,

          // Use your offensive cool downs

          // Manage your fury properly
          demonBiteFury: this.demonBite.suggestionThresholds,
          demonicAppetiteEfficiency: this.demonicAppetite.suggestionThresholds,
          demonBladesEfficiency: this.demonBlades.suggestionThresholds,
          totalFuryWasted: this.furyDetails.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
