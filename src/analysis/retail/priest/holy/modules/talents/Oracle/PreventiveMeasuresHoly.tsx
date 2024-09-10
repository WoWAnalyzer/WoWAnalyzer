import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import { TALENTS_PRIEST } from 'common/TALENTS';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { HOLY_DMG_ABILITIES_AFFECTED_BY_PM } from '../../../constants';
import { PREVENTIVE_MEASURES_DMG_AMP } from '../../../constants';
import { PREVENTIVE_MEASURES_HEAL_AMP } from '../../../constants';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import TalentSpellText from 'parser/ui/TalentSpellText';
import EOLAttrib from '../../core/EchoOfLightAttributor';
import SpellLink from 'interface/SpellLink';

//Unlike the premonition nodes, this is different between disc/holy

class PreventiveMeasuresHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    eolAttrib: EOLAttrib,
  };

  protected combatants!: Combatants;
  protected eolAttrib!: EOLAttrib;

  totalPOMHealingIncrease = 0;
  totalPMDamageIncrease = 0;
  eolContrib = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.PREVENTIVE_MEASURES_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.PRAYER_OF_MENDING_HEAL),
      this.handlePOM,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(HOLY_DMG_ABILITIES_AFFECTED_BY_PM),
      this.handleDamage,
    );
  }

  handlePOM(event: HealEvent) {
    this.totalPOMHealingIncrease += calculateEffectiveHealing(event, PREVENTIVE_MEASURES_HEAL_AMP);
    this.eolContrib += this.eolAttrib.getEchoOfLightAmpAttrib(event, PREVENTIVE_MEASURES_HEAL_AMP);
  }

  handleDamage(event: DamageEvent) {
    this.totalPMDamageIncrease += calculateEffectiveDamage(event, PREVENTIVE_MEASURES_DMG_AMP);
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
            Breakdown:{' '}
            <div>
              <SpellLink spell={TALENTS_PRIEST.PREVENTIVE_MEASURES_TALENT} />:{' '}
              <ItemPercentHealingDone
                amount={this.totalPOMHealingIncrease}
              ></ItemPercentHealingDone>{' '}
            </div>
            <div>
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
              <ItemPercentHealingDone amount={this.eolContrib}></ItemPercentHealingDone>
            </div>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_PRIEST.PREVENTIVE_MEASURES_TALENT}>
          <div>
            <ItemPercentHealingDone amount={this.totalPOMHealingIncrease + this.eolContrib} />
          </div>
          <div>
            <ItemPercentDamageDone amount={this.totalPMDamageIncrease} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PreventiveMeasuresHoly;
