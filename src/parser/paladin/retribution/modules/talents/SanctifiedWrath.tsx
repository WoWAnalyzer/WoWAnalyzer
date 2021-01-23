import React from 'react';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellIcon } from 'interface';


const AW_BASE_DURATION = 20;

class SanctifiedWrath extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SANCTIFIED_WRATH_TALENT_RETRIBUTION.id);
    if (!this.active) {
      return;
    }
  }

  get damageDone() {
    const spell = this.abilityTracker.getAbility(SPELLS.SANCTIFIED_WRATH_DAMAGE.id);
    return spell.damageEffective + spell.damageAbsorbed;
  }

  statistic() {
    const hist = this.selectedCombatant.getBuffHistory(SPELLS.AVENGING_WRATH.id);
    if (!hist || hist.length === 0) {
      return null;
    }

    let totalIncrease = 0;
    hist.forEach((buff: any, idx: any) => {
      const end = buff.end || this.owner.currentTimestamp;
      const duration = (end - buff.start) / 1000;
      // If the buff ended early because of death or fight end, don't blame the talent
      const increase = Math.max(0, duration - AW_BASE_DURATION);
      totalIncrease += increase;
    });

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip="Damage dealt directly and the Avenging Wrath extension provided by Sanctified Wrath."
      >
        <BoringSpellValueText spell={SPELLS.SANCTIFIED_WRATH_DAMAGE}>
          <ItemDamageDone amount={this.damageDone} /> <br />
          <><SpellIcon id={SPELLS.AVENGING_WRATH.id} /> +{formatNumber(totalIncrease)} seconds</>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SanctifiedWrath;
