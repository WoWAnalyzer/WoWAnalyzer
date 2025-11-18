import { EVOKER_TWW2_ID } from 'common/ITEMS';
import { TIERS } from 'game/TIERS';
import ItemSetLink from 'interface/ItemSetLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import SPELLS from 'common/SPELLS';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { isInsuranceFromVe } from '../../normalizers/EventLinking/helpers';

class T33Prevoker extends Analyzer {
  has4Piece = false;
  insurance2pHotHealing = 0;
  insurance2pProcHealing = 0;
  insurance4pHotHealing = 0;
  insurance4pProcHealing = 0;
  ins4pOverheal = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.TWW2);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.TWW2);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.INSURANCE_HOT_EVOKER),
      this.onInsuranceHeal,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.INSURANCE_PROC_EVOKER),
      this.onInsuranceHeal,
    );
  }

  onInsuranceHeal(event: HealEvent) {
    if (this.has4Piece && isInsuranceFromVe(event)) {
      this.ins4pOverheal += event.overheal || 0;
      if (event.ability.guid === SPELLS.INSURANCE_HOT_EVOKER.id) {
        this.insurance4pHotHealing += event.amount + (event.absorbed || 0);
      } else if (event.ability.guid === SPELLS.INSURANCE_PROC_EVOKER.id) {
        this.insurance4pProcHealing += event.amount + (event.absorbed || 0);
      }
    } else {
      if (event.ability.guid === SPELLS.INSURANCE_HOT_EVOKER.id) {
        this.insurance2pHotHealing += event.amount + (event.absorbed || 0);
      } else if (event.ability.guid === SPELLS.INSURANCE_PROC_EVOKER.id) {
        this.insurance2pProcHealing += event.amount + (event.absorbed || 0);
      }
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <ItemSetLink id={EVOKER_TWW2_ID}>Opulent Treasurescale's Hoard</ItemSetLink> (T33 tier set){' '}
        <div className="pad">
          <h4>2 Piece</h4>
          Heal over time
          <br />
          <ItemHealingDone amount={this.insurance2pHotHealing} />
          <br />
          Proc activation
          <br />
          <ItemHealingDone amount={this.insurance2pProcHealing} />
        </div>
        <div className="pad">
          <h4>4 piece</h4>
          Heal over time
          <br />
          <ItemHealingDone amount={this.insurance4pHotHealing} />
          <br />
          Proc activation
          <br />
          <ItemHealingDone amount={this.insurance4pProcHealing} />
          <br />
          {this.ins4pOverheal}{' '}
        </div>
      </Statistic>
    );
  }
}

export default T33Prevoker;
