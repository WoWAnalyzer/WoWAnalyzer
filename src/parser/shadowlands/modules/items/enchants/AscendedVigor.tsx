import { formatPercentage } from 'common/format';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Uptime from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import Buffs from 'parser/core/modules/Buffs';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const PERCENTAGE_HEALING_INCREASE = 0.12;

class AscendedVigor extends Analyzer {
  static dependencies = {
    buffs: Buffs,
  };

  healing = 0;
  isBuffed = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasWeaponEnchant(ITEMS.ENCHANT_WEAPON_ASCENDED_VIGOR);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ASCENDED_VIGOR_CAST),
      this.toggle,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ASCENDED_VIGOR_CAST),
      this.toggle,
    );

    this.addEventListener(Events.heal, this.onHeal);
  }

  toggle = (event: ApplyBuffEvent | RemoveBuffEvent) => {
    this.isBuffed = event.type === 'applybuff';
  };

  onHeal = (event: HealEvent) => {
    if (this.isBuffed) {
      this.healing += calculateEffectiveHealing(event, PERCENTAGE_HEALING_INCREASE);
    }
  };

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.ASCENDED_VIGOR_CAST.id) / this.owner.fightDuration
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spellId={SPELLS.ASCENDED_VIGOR_CAST.id}>
          <ItemHealingDone displayPercentage={false} amount={this.healing} />
          <br />
          <Uptime /> {formatPercentage(this.uptime)}% <small>Uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AscendedVigor;
