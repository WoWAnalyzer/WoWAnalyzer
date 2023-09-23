import ITEMS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { formatNumber, formatPercentage } from 'common/format';
import { SpellIcon, SpellLink } from 'interface';
import { DamageIcon } from 'interface/icons';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

// ================ SAMPLE LOGS ================
// Shadowflame Wreathe R1
// https://www.warcraftlogs.com/reports/RWnkNcQxhPKfVgBm#fight=4&type=summary&source=14
// Shadowflame Wreathe R2
// https://www.warcraftlogs.com/reports/ZNgPpJvmKXcTV4WB#fight=14&type=summary&source=536
// Shadowflame Wreathe R3
// https://www.warcraftlogs.com/reports/fJrQVzPpACd6FnTM#fight=1&type=summary&source=3

const RANKS = [
  ITEMS.ENCHANT_WEAPON_SHADOWFLAME_WREATHE_R1,
  ITEMS.ENCHANT_WEAPON_SHADOWFLAME_WREATHE_R2,
  ITEMS.ENCHANT_WEAPON_SHADOWFLAME_WREATHE_R3,
];

class ShadowflameWreathe extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  private buffApplications = 0;
  private outgoingDamage = 0;
  private incomingDamage = 0;

  constructor(options: Options) {
    super(options);

    this.active = RANKS.some((enchant) => this.selectedCombatant.hasWeaponEnchant(enchant));

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOWFLAME_WREATHE_DOT),
      () => (this.buffApplications += 1),
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOWFLAME_WREATHE_DOT),
      () => (this.buffApplications += 1),
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOWFLAME_WREATHE_DOT),
      this.onOutgoingDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOWFLAME_WREATHE_SELF_DAMAGE),
      this.onIncomingDamage,
    );
  }

  private onOutgoingDamage(event: DamageEvent) {
    this.outgoingDamage += event.amount + (event.absorbed || 0);
  }

  private onIncomingDamage(event: DamageEvent) {
    this.incomingDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const ppm = this.owner.getPerMinute(this.buffApplications);
    const uptime =
      this.enemies.getBuffUptime(SPELLS.SHADOWFLAME_WREATHE_DOT.id) / this.owner.fightDuration;
    const dps = this.owner.getPerSecond(this.outgoingDamage);
    const percentage = this.owner.getPercentageOfTotalDamageDone(this.outgoingDamage);

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.UNIMPORTANT(1)}
        tooltip={
          <>
            <SpellIcon spell={SPELLS.SHADOWFLAME_WREATHE_DOT} /> Shadowflame Wreathe triggered{' '}
            <strong>{this.buffApplications}</strong> times ({ppm.toFixed(1)} PPM), resulting in an{' '}
            {formatPercentage(uptime, 1)}% uptime, doing a total of{' '}
            <strong>{formatNumber(this.outgoingDamage)}</strong> damage.
            <br />
            <br />
            Each time triggered, did an average of{' '}
            {formatNumber(this.incomingDamage / this.buffApplications)} damage to self.
          </>
        }
      >
        <div className="pad boring-text">
          <label>
            <SpellIcon spell={SPELLS.SHADOWFLAME_WREATHE_DOT} />{' '}
            <SpellLink spell={SPELLS.SHADOWFLAME_WREATHE_DOT} icon={false} />
          </label>
          <div className="value">
            <DamageIcon /> {formatNumber(dps)} DPS <small>{formatPercentage(percentage)}%</small>
          </div>
          <div className="value" style={{ lineHeight: 0.2 }}>
            <small>
              <DamageIcon />
              &nbsp;&nbsp;{formatNumber(this.incomingDamage)} damage to self
            </small>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default ShadowflameWreathe;
