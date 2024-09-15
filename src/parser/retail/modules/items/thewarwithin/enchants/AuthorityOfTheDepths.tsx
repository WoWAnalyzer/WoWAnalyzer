import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Events, { DamageEvent } from 'parser/core/Events';
import { DamageIcon } from 'interface/icons';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import WeaponEnchantAnalyzer from '../../WeaponEnchantAnalyzer';
import Enemies from 'parser/shared/modules/Enemies';

class AuthorityOfTheDepths extends WeaponEnchantAnalyzer.withDependencies({
  enemies: Enemies,
}) {
  private damage = 0;

  constructor(options: Options) {
    super(
      SPELLS.AUTHORITY_OF_THE_DEPTHS_ENCHANT,
      [
        { rank: 1, enchant: ITEMS.AUTHORITY_OF_THE_DEPTHS_R1 },
        { rank: 2, enchant: ITEMS.AUTHORITY_OF_THE_DEPTHS_R2 },
        { rank: 3, enchant: ITEMS.AUTHORITY_OF_THE_DEPTHS_R3 },
      ],
      options,
    );

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.AUTHORITY_OF_THE_DEPTHS_DAMAGE),
      this.onDamage,
    );
  }

  private onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  protected statisticParts() {
    const { content } = super.statisticParts();
    const uptime = this.deps.enemies.getBuffUptime(SPELLS.AUTHORITY_OF_THE_DEPTHS_DAMAGE.id);
    const uptimePercentage = uptime / this.owner.fightDuration;

    return {
      tooltip: (
        <>
          The proc dealt{' '}
          <b style={{ color: color(MAGIC_SCHOOLS.ids.SHADOW) }}>{formatNumber(this.damage)}</b>{' '}
          damage, and had an uptime of <b>{formatDuration(uptime)}</b>,{' '}
          {formatPercentage(uptimePercentage, 1)}% of the fight.
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

export default AuthorityOfTheDepths;
