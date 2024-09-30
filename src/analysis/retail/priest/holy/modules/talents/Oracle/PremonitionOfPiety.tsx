import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import { TALENTS_PRIEST } from 'common/TALENTS';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

import { PIETY_AMP } from '../../../constants';
import { PIETY_OVERHEAL_MISDIRECT } from '../../../constants';
import { FATEBENDER_SCALER } from '../../../constants';

class PremonitionOfPiety extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  totalHealingFromPietyAmp = 0;
  totalNonFBHealingFromPietyAmp = 0;
  totalPietyOverHealingMD = 0;
  totalNonFBPietyOverhealingMD = 0;

  private scaledPietyAmp = PIETY_AMP;
  private scaledPietyOH = PIETY_OVERHEAL_MISDIRECT;
  private pietyBuffActive = false;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.CLAIRVOYANCE_TALENT);
    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.FATEBENDER_TALENT)) {
      this.scaledPietyAmp *= FATEBENDER_SCALER;
      this.scaledPietyOH;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handlePiety);

    // These two check if Piety is active
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.PREMONITION_OF_PIETY_BUFF),
      this.gainPiety,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.PREMONITION_OF_PIETY_BUFF),
      this.losePiety,
    );
  }

  handlePiety(event: HealEvent) {
    if (!this.pietyBuffActive) {
      return;
    }

    //Handle just raw piety healing amp
    this.totalHealingFromPietyAmp += calculateEffectiveHealing(event, this.scaledPietyAmp);

    //TODO get toal healing and minus the effective amp healing to get fatebender contrib

    //direct effective piety redirect
    if (event.ability.guid === SPELLS.PREMONITION_OF_PIETY.id) {
      this.totalPietyOverHealingMD += event.amount;
      this.totalNonFBPietyOverhealingMD = event.amount / (1 + PIETY_AMP);

      // this gives a different amount from WCL for some reason
      //this.totalPietyOverHealingMD+=event.amount + (event.absorb || 0);
      return;
    }
  }

  gainPiety() {
    this.pietyBuffActive = true;
  }

  losePiety() {
    this.pietyBuffActive = false;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.PREMONITION_OF_PIETY}>
          <ItemPercentHealingDone amount={this.totalHealingFromPietyAmp} />
          <small>{' amped healing'}</small>
          <br />
          <ItemPercentHealingDone amount={this.totalPietyOverHealingMD} />
          <small>{' redirected'}</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PremonitionOfPiety;
