import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

import { TALENTS_PRIEST } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { HOLY_ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../../constants';
import { RESONANT_ENERGY_AMP_PER_STACK } from '../../../constants';
import EOLAttrib from '../../core/EchoOfLightAttributor';
import SpellLink from 'interface/SpellLink';

class ResonantEnergyHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    eolAttrib: EOLAttrib,
  };

  protected combatants!: Combatants;
  protected eolAttrib!: EOLAttrib;
  /** Total Healing From Resonant Energy */
  resonantEnergyHealing = 0;
  eolContrib = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.RESONANT_ENERGY_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(HOLY_ABILITIES_AFFECTED_BY_HEALING_INCREASES),
      this.onResonantEnergyHeal,
    );
  }

  onResonantEnergyHeal(event: HealEvent) {
    const target = this.combatants.getEntity(event);

    if (target === null) {
      return;
    }

    const resonantEnergyStacks = target.getBuffStacks(
      SPELLS.RESONANT_ENERGY_TALENT_BUFF.id,
      null,
      0,
      0,
      this.selectedCombatant.id,
    );
    this.resonantEnergyHealing += calculateEffectiveHealing(
      event,
      RESONANT_ENERGY_AMP_PER_STACK * resonantEnergyStacks,
    );
    this.eolContrib += this.eolAttrib.getEchoOfLightAmpAttrib(
      event,
      RESONANT_ENERGY_AMP_PER_STACK * resonantEnergyStacks,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            {' '}
            Breakdown: <br />
            <SpellLink spell={TALENTS_PRIEST.RESONANT_ENERGY_TALENT} />:{' '}
            <ItemPercentHealingDone amount={this.resonantEnergyHealing}></ItemPercentHealingDone>{' '}
            <br />
            <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
            <ItemPercentHealingDone amount={this.eolContrib}></ItemPercentHealingDone> <br />
          </>
        }
      >
        <TalentSpellText talent={TALENTS_PRIEST.RESONANT_ENERGY_TALENT}>
          <ItemPercentHealingDone amount={this.resonantEnergyHealing + this.eolContrib} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ResonantEnergyHoly;
