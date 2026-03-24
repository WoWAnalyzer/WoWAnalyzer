import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Events, { DamageEvent } from 'parser/core/Events';
import { DamageIcon } from 'interface/icons';
import { formatNumber, formatPercentage } from 'common/format';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import StatProcEnchantAnalyzer from '../../StatProcEnchantAnalyzer';

class AuthorityOfRadiantPower extends StatProcEnchantAnalyzer {
  private damage = 0;

  constructor(options: Options) {
    super(
      options.owner.selectedCombatant.primaryStat,
      SPELLS.AUTHORITY_OF_RADIANT_POWER_ENCHANT,
      SPELLS.AUTHORITY_OF_RADIANT_POWER_BUFF,
      [
        { rank: 1, enchant: ITEMS.AUTHORITY_OF_RADIANT_POWER_R1, amount: 1560 },
        { rank: 2, enchant: ITEMS.AUTHORITY_OF_RADIANT_POWER_R2, amount: 1895 },
        { rank: 3, enchant: ITEMS.AUTHORITY_OF_RADIANT_POWER_R3, amount: 2230 },
      ],
      options,
    );

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.AUTHORITY_OF_RADIANT_POWER_DAMAGE),
      this.onDamage,
    );
  }

  private onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  protected statisticParts() {
    const { content, tooltip } = super.statisticParts();
    return {
      tooltip: (
        <>
          {tooltip}
          <br />
          The proc dealt{' '}
          <b style={{ color: color(MAGIC_SCHOOLS.ids.RADIANT) }}>
            {formatNumber(this.damage)}
          </b>{' '}
          total damage, for an average hit of{' '}
          <b style={{ color: color(MAGIC_SCHOOLS.ids.RADIANT) }}>
            {formatNumber(this.damage / this.totalProcs)}
          </b>
          .
        </>
      ),
      content: (
        <>
          <div>{content}</div>
          <div>
            <DamageIcon /> {formatNumber(this.owner.getPerSecond(this.damage))} DPS{' '}
            <small>
              {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))}%
            </small>
          </div>
        </>
      ),
    };
  }
}

export default AuthorityOfRadiantPower;
