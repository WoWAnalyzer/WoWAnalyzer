import { formatPercentage, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import BoneShieldTimesByStacks from '../features/BoneShieldTimesByStacks';

class CrimsonRuneWeapon extends Analyzer {
  static dependencies = {
    boneShieldTimesByStacks: BoneShieldTimesByStacks,
  };
  protected boneShieldTimesByStacks!: BoneShieldTimesByStacks;

  constructor(options: Options) {
    super(options);

    const active = this.selectedCombatant.hasLegendary(SPELLS.CRIMSON_RUNE_WEAPON);
    this.active = active;
    if (!active) {
      return;
    }
  }

  get reduction() {
    return this.boneShieldTimesByStacks.totalDRWCooldownReduction / 1000;
  }

  get wastedReduction() {
    return this.boneShieldTimesByStacks.totalDRWCooldownReductionWasted / 1000;
  }

  get wastedPercent() {
    return this.wastedReduction / (this.wastedReduction + this.reduction);
  }

  get cdrSuggestionThresholds() {
    return {
      actual: this.wastedPercent,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.4,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.cdrSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Use <SpellLink id={SPELLS.DANCING_RUNE_WEAPON.id} /> quickly once it comes off cooldown.
        </span>,
      )
        .icon(SPELLS.CRIMSON_RUNE_WEAPON.icon)
        .actual(
          `You wasted ${formatPercentage(actual)}% of cooldown reduction from ${
            SPELLS.CRIMSON_RUNE_WEAPON.name
          } by waiting to cast Dancing Rune Weapon`,
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    console.log('statistic', this);
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            {formatNumber(this.reduction)} sec total effective reduction and{' '}
            {formatNumber(this.wastedReduction)} sec ({formatPercentage(this.wastedPercent)}%)
            wasted reduction.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.CRIMSON_RUNE_WEAPON.id}>
          <>
            <UptimeIcon /> {formatNumber(this.reduction)} sec{' '}
            <small>total effective reduction</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CrimsonRuneWeapon;
