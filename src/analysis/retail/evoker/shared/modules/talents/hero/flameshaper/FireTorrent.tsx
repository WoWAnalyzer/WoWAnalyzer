import { Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import { DamageEvent } from 'parser/core/Events';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import TwinFlame from './TwinFlame';

/**
 * Twin Flame bounces to up to 2 additional targets.
 */
class FireTorrent extends TwinFlame {
  fireTorrentDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FIRE_TORRENT_TALENT);
  }

  protected onDamage(event: DamageEvent) {
    if (!this.hitMainTarget(event)) {
      this.fireTorrentDamage += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS.FIRE_TORRENT_TALENT}>
          <ItemDamageDone amount={this.fireTorrentDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FireTorrent;
