import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, DamageEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellLink from 'interface/SpellLink';
import { formatNumber } from 'common/format';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

import { SOLACE_DR } from '../../../constants';
import { FATEBENDER_SCALER } from '../../../constants';

class PremonitionOfSolace extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  // Temporary value used as flags or for calculations
  private totalSolaceAbsorb = 0;
  private damageTakenWithSolaceActive = 0;
  private fatebenderActive = false;
  private scaledSolaceDR = SOLACE_DR;
  private baseSolaceDR = SOLACE_DR;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.CLAIRVOYANCE_TALENT);
    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.FATEBENDER_TALENT)) {
      this.scaledSolaceDR *= FATEBENDER_SCALER;
      this.fatebenderActive = true;
    }
    // inverting DR because Damage Amount + absorb is post mitigation
    // this one doesn't use calculateEffectiveDamageReduction
    // since it also has to get fatebender value
    this.scaledSolaceDR = 1 / (1 - this.scaledSolaceDR);
    this.baseSolaceDR = 1 / (1 - this.baseSolaceDR);

    // For Solace
    this.addEventListener(Events.damage, this.onDamageSolaceHandler);
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.PREMONITION_OF_SOLACE_DR_AND_SHIELD_BUFF),
      this.handleSolaceAbsorb,
    );
  }

  onDamageSolaceHandler(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.PREMONITION_OF_SOLACE_CASTER_BUFF.id)) {
      return;
    }
    this.damageTakenWithSolaceActive += event.amount + (event.absorbed || 0);
  }

  handleSolaceAbsorb(event: AbsorbedEvent) {
    this.totalSolaceAbsorb += event.amount;
  }

  get passTotalSolaceDamageReduced(): number {
    return this.damageTakenWithSolaceActive * (this.scaledSolaceDR - 1);
  }

  get passFBSolaceDRIncrease(): number {
    return this.damageTakenWithSolaceActive * (this.scaledSolaceDR - this.baseSolaceDR);
  }

  get passNonFBSolaceDRIncrease(): number {
    return this.damageTakenWithSolaceActive * (this.baseSolaceDR - 1);
  }

  //TODO: get total shield amount and get fatebender shield increase

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <SpellLink spell={SPELLS.PREMONITION_OF_SOLACE_CASTER_BUFF} /> breakdown:
            <ul>
              <li>
                {formatNumber(this.passNonFBSolaceDRIncrease)}
                {' damage reduced base'}
              </li>

              <>
                {this.fatebenderActive ? (
                  <li>
                    {formatNumber(this.passFBSolaceDRIncrease)} damage reduced by{' '}
                    <SpellLink spell={TALENTS_PRIEST.FATEBENDER_TALENT} />
                  </li>
                ) : (
                  <></>
                )}
              </>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.PREMONITION_OF_SOLACE_CASTER_BUFF}>
          <img alt="Damage Mitigated" src="/img/shield.png" className="icon" />{' '}
          {formatNumber(this.passTotalSolaceDamageReduced)} <small> total damage mitigated</small>
          <br />
          <ItemPercentHealingDone amount={this.totalSolaceAbsorb} />
          <small>{' in absorbs'}</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PremonitionOfSolace;
