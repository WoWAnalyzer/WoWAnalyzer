import { formatNumber, formatPercentage } from 'common/format';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { RENEWED_FAITH_MULTIPLIER } from '../../../constants';
import EOLAttrib from '../../core/EchoOfLightAttributor';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import SpellLink from 'interface/SpellLink';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import SPELLS from 'common/SPELLS';

class RenewedFaith extends Analyzer {
  static dependencies = {
    eolAttrib: EOLAttrib,
  };
  protected eolAttrib!: EOLAttrib;
  eolContrib = 0;

  renewTracker: { [combatantId: number]: boolean } = {};
  rawAdditionalHealing: number = 0;
  effectiveAdditionalHealing: number = 0;
  overhealing: number = 0;

  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.hasTalent(TALENTS.RENEWED_FAITH_TALENT)) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.RENEW_TALENT),
      this.onRenewApplication,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.RENEW_TALENT),
      this.onRenewRemoval,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  get percentOverhealing() {
    if (this.rawAdditionalHealing === 0) {
      return 0;
    }
    return this.overhealing / this.rawAdditionalHealing;
  }

  onRenewApplication(event: ApplyBuffEvent) {
    this.renewTracker[event.targetID] = true;
  }

  onRenewRemoval(event: RemoveBuffEvent) {
    this.renewTracker[event.targetID] = false;
  }

  onHeal(event: HealEvent) {
    // If the character that you are healing has renew on them...
    if (this.renewTracker[event.targetID]) {
      this.effectiveAdditionalHealing += calculateEffectiveHealing(event, RENEWED_FAITH_MULTIPLIER);
      this.overhealing += calculateOverhealing(event, RENEWED_FAITH_MULTIPLIER);
      this.eolContrib += this.eolAttrib.getEchoOfLightAmpAttrib(event, RENEWED_FAITH_MULTIPLIER);
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
              <SpellLink spell={TALENTS_PRIEST.RENEWED_FAITH_TALENT} />:{' '}
              <ItemPercentHealingDone
                amount={this.effectiveAdditionalHealing}
              ></ItemPercentHealingDone>{' '}
            </div>
            <div>
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
              <ItemPercentHealingDone amount={this.eolContrib}></ItemPercentHealingDone>
            </div>
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(1)}
      >
        <BoringSpellValueText spell={TALENTS.RENEWED_FAITH_TALENT}>
          <ItemHealingDone amount={this.effectiveAdditionalHealing + this.eolContrib} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RenewedFaith;
