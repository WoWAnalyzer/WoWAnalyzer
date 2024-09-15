import ITEMS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { formatNumber, formatPercentage } from 'common/format';
import { DamageIcon } from 'interface/icons';
import { Options, SELECTED_PLAYER, withDependencies } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import WeaponEnchantAnalyzer from '../../WeaponEnchantAnalyzer';

// ================ SAMPLE LOGS ================
// Shadowflame Wreathe R1
// https://www.warcraftlogs.com/reports/RWnkNcQxhPKfVgBm#fight=4&type=summary&source=14
// Shadowflame Wreathe R2
// https://www.warcraftlogs.com/reports/ZNgPpJvmKXcTV4WB#fight=14&type=summary&source=536
// Shadowflame Wreathe R3
// https://www.warcraftlogs.com/reports/fJrQVzPpACd6FnTM#fight=1&type=summary&source=3

const RANKS = [
  { rank: 1, enchant: ITEMS.ENCHANT_WEAPON_SHADOWFLAME_WREATHE_R1 },
  { rank: 2, enchant: ITEMS.ENCHANT_WEAPON_SHADOWFLAME_WREATHE_R2 },
  { rank: 3, enchant: ITEMS.ENCHANT_WEAPON_SHADOWFLAME_WREATHE_R3 },
];

const deps = { enemies: Enemies };

class ShadowflameWreathe extends withDependencies(WeaponEnchantAnalyzer, deps) {
  private buffApplications = 0;
  private outgoingDamage = 0;
  private incomingDamage = 0;

  constructor(options: Options) {
    super(SPELLS.SHADOWFLAME_WREATHE_ENCHANT, RANKS, options);

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

  statisticParts() {
    const uptime =
      this.deps.enemies.getBuffUptime(SPELLS.SHADOWFLAME_WREATHE_DOT.id) / this.owner.fightDuration;

    return {
      tooltip: (
        <>
          {this.procCount(this.buffApplications)}, resulting in an {formatPercentage(uptime, 1)}%
          uptime, doing a total of <strong>{formatNumber(this.outgoingDamage)}</strong> damage.
          <br />
          Each time triggered, did an average of{' '}
          {formatNumber(this.incomingDamage / this.buffApplications)} damage to self.
        </>
      ),
      content: (
        <>
          <div className="value">
            <ItemDamageDone amount={this.outgoingDamage} />
          </div>
          <div className="value" style={{ lineHeight: 0.2 }}>
            <small>
              <DamageIcon />
              &nbsp;&nbsp;{formatNumber(this.incomingDamage)} damage to self
            </small>
          </div>
        </>
      ),
    };
  }
}

export default ShadowflameWreathe;
