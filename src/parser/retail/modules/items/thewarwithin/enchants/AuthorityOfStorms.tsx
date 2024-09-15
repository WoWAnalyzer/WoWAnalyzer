import ITEMS from 'common/ITEMS/thewarwithin/enchants';
import SPELLS from 'common/SPELLS/thewarwithin/enchants';
import { formatNumber, formatPercentage } from 'common/format';
import { DamageIcon } from 'interface/icons';
import { SELECTED_PLAYER, type Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import WeaponEnchantAnalyzer from '../../WeaponEnchantAnalyzer';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';

class AuthorityOfStorms extends WeaponEnchantAnalyzer {
  private count = 0;
  private totalDamage = 0;

  constructor(options: Options) {
    super(
      SPELLS.AUTHORITY_OF_STORMS_ENCHANT,
      [
        { rank: 1, enchant: ITEMS.AUTHORITY_OF_STORMS_R1 },
        { rank: 2, enchant: ITEMS.AUTHORITY_OF_STORMS_R2 },
        { rank: 3, enchant: ITEMS.AUTHORITY_OF_STORMS_R3 },
      ],
      options,
    );

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.AUTHORITY_OF_STORMS_DAMAGE),
      this.onDamage,
    );
  }

  private onDamage(event: DamageEvent) {
    this.count += 1;
    this.totalDamage += event.amount + (event.absorbed || 0);
  }

  protected statisticParts() {
    return {
      tooltip: (
        <>
          {this.procCount(this.count)}, dealing a total of{' '}
          <strong style={{ color: color(MAGIC_SCHOOLS.ids.NATURE) }}>
            {formatNumber(this.totalDamage)}
          </strong>{' '}
          damage.
        </>
      ),
      content: (
        <>
          <DamageIcon /> {formatNumber(this.owner.getPerSecond(this.totalDamage))} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.totalDamage))}%
          </small>
        </>
      ),
    };
  }
}

export default AuthorityOfStorms;
