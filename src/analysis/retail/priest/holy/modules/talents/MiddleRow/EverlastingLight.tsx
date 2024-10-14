import { formatNumber, formatPercentage } from 'common/format';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import { MAX_EVERLASTING_LIGHT_BUFF } from '../../../constants';
import EOLAttrib from '../../core/EchoOfLightAttributor';
import SpellLink from 'interface/SpellLink';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

/**
 * Heal restores up to 15% additional health, based on your missing mana.
 */
class EverlastingLight extends Analyzer {
  static dependencies = {
    eolAttrib: EOLAttrib,
  };
  protected eolAttrib!: EOLAttrib;
  eolContrib = 0;

  currentHealingBonus: number = 0;
  rawAdditionalHealing: number = 0;
  effectiveAdditionalHealing: number = 0;
  overhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EVERLASTING_LIGHT_TALENT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.GREATER_HEAL), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GREATER_HEAL), this.onHeal);
  }

  get percentOverhealing() {
    if (this.rawAdditionalHealing === 0) {
      return 0;
    }
    return this.overhealing / this.rawAdditionalHealing;
  }

  onCast(event: CastEvent) {
    event.classResources &&
      event.classResources.forEach((resource) => {
        if (resource.type !== RESOURCE_TYPES.MANA.id) {
          return;
        }
        const currentMana = resource.amount;
        this.currentHealingBonus =
          MAX_EVERLASTING_LIGHT_BUFF * Math.max(0, 1 - currentMana / resource.max);
      });
  }

  onHeal(event: HealEvent) {
    if (this.currentHealingBonus > 0) {
      const rawHealAmount = event.amount * this.currentHealingBonus;
      const effectiveHealAmount = calculateEffectiveHealing(event, this.currentHealingBonus);
      const overHealAmount = calculateOverhealing(event, this.currentHealingBonus);

      this.rawAdditionalHealing += rawHealAmount;
      this.effectiveAdditionalHealing += effectiveHealAmount;
      this.overhealing += overHealAmount;

      this.eolContrib += this.eolAttrib.getEchoOfLightAmpAttrib(event, this.currentHealingBonus);
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            Total Healing: {formatNumber(this.rawAdditionalHealing)} (
            {formatPercentage(this.percentOverhealing)}% OH)
            <br />
            <div>Breakdown: </div>
            <div>
              <SpellLink spell={TALENTS_PRIEST.EVERLASTING_LIGHT_TALENT} />:{' '}
              <ItemPercentHealingDone
                amount={this.effectiveAdditionalHealing}
              ></ItemPercentHealingDone>
            </div>
            <div>
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
              <ItemPercentHealingDone amount={this.eolContrib}></ItemPercentHealingDone>{' '}
            </div>
            <br />
            <div>
              Notably this module currently is missing the contributions to{' '}
              <SpellLink spell={TALENTS_PRIEST.BINDING_HEALS_TALENT} /> and{' '}
              <SpellLink spell={TALENTS_PRIEST.TRAIL_OF_LIGHT_TALENT} />, which can undervalue it.
            </div>
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(1)}
      >
        <BoringSpellValueText spell={TALENTS.EVERLASTING_LIGHT_TALENT}>
          <ItemHealingDone amount={this.effectiveAdditionalHealing + this.eolContrib} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EverlastingLight;
