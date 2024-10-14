import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HasRelatedEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { LIGHTWELL_RENEW_HEALS } from '../../../normalizers/CastLinkNormalizer';
import EOLAttrib from '../../core/EchoOfLightAttributor';
import SpellLink from 'interface/SpellLink';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class Lightwell extends Analyzer {
  static dependencies = {
    eolAttrib: EOLAttrib,
  };
  protected eolAttrib!: EOLAttrib;
  eolContrib = 0;

  Lightwell = 0;
  healingFromLightwell = 0;
  overhealingFromLightwell = 0;
  absorptionFromLightwell = 0;

  healingFromRenew = 0;
  absorptionFromRenew = 0;
  overhealingFromRenew = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.LIGHTWELL_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIGHTWELL_TALENT_HEAL),
      this.onHeal,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RENEW_TALENT),
      this.onRenewHeal,
    );
  }

  get totalHealing() {
    return this.healingFromLightwell + this.healingFromRenew;
  }

  get totalOverHealing() {
    return this.overhealingFromLightwell + this.overhealingFromRenew + this.eolContrib;
  }

  get totalAbsorbed() {
    return this.absorptionFromLightwell + this.absorptionFromRenew;
  }

  onHeal(event: HealEvent) {
    this.healingFromLightwell += event.amount || 0;
    this.overhealingFromLightwell += event.overheal || 0;
    this.absorptionFromLightwell += event.absorbed || 0;
    this.eolContrib += this.eolAttrib.getEchoOfLightHealingAttrib(event);
  }

  onRenewHeal(event: HealEvent) {
    if (HasRelatedEvent(event, LIGHTWELL_RENEW_HEALS)) {
      this.healingFromRenew += event.amount || 0;
      this.overhealingFromRenew += event.overheal || 0;
      this.absorptionFromRenew += event.absorbed || 0;
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            Breakdown:{' '}
            <div>
              <SpellLink spell={SPELLS.LIGHTWELL_TALENT_HEAL} />:{' '}
              <ItemPercentHealingDone
                amount={this.healingFromLightwell + this.absorptionFromLightwell}
              ></ItemPercentHealingDone>{' '}
            </div>
            <div>
              <SpellLink spell={SPELLS.RENEW_HEAL} />:{' '}
              <ItemPercentHealingDone
                amount={this.healingFromRenew + this.absorptionFromRenew}
              ></ItemPercentHealingDone>{' '}
            </div>
            <div>
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
              <ItemPercentHealingDone amount={this.eolContrib}></ItemPercentHealingDone>
            </div>
            <br />
            <div>
              Notably <SpellLink spell={SPELLS.RENEW_HEAL} /> does not contribute to{' '}
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />.
            </div>
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(7)}
      >
        <BoringSpellValueText spell={TALENTS.LIGHTWELL_TALENT}>
          <ItemHealingDone amount={this.totalHealing + this.totalAbsorbed} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Lightwell;
