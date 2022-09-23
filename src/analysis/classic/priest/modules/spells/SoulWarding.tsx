import * as SPELLS from 'analysis/classic/priest/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Events, { CastEvent } from 'parser/core/Events';
import ItemManaGained from 'parser/ui/ItemManaGained';

const POWER_WORD_SHIELD_COOLDOWN = 4000;
const SOUL_WARDING_MANA_REDUCTION = .15;

class SoulWarding extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  private lastPwsTimestamp = 0;
  private soulWardingActive = false;

  get manaSpentOnPws() {
    return this.abilityTracker.getAbility(SPELLS.POWER_WORD_SHIELD).manaUsed;
  }

  get manaSaved() {
    return this.manaSpentOnPws / (1 - SOUL_WARDING_MANA_REDUCTION) - this.manaSpentOnPws;
  }

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell({ id: SPELLS.POWER_WORD_SHIELD }),
      this.onPowerWordShieldCast,
    );
  }

  onPowerWordShieldCast(event: CastEvent) {
    if (this.soulWardingActive) {
      return;
    }
    if (event.timestamp - POWER_WORD_SHIELD_COOLDOWN > this.lastPwsTimestamp) {
      this.soulWardingActive = true;
    }
    this.lastPwsTimestamp = event.timestamp;
  }

  statistic() {
    if (!this.soulWardingActive) {
      this.active = false;
    }

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={SPELLS.SOUL_WARDING_TALENT}>
          <ItemManaGained amount={this.manaSaved} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulWarding;
