import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/evoker';
import { getCastEventFromDamage } from 'analysis/retail/evoker/devastation/modules/normalizers/CastLinkNormalizer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import {
  MID1_2P_DAMAGE_AMP,
  MID1_2P_DAMAGE_AMP_MAIN_TARGET,
} from 'analysis/retail/evoker/devastation/constants';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber } from 'common/format';
import SpellLink from 'interface/SpellLink';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemSetLink from 'interface/ItemSetLink';
import { EVOKER_MID1_ID } from 'common/ITEMS';

/**
 * (2) Set Devastation: Azure Sweep damage increased by 50%
 * and its damage against your primary target is increased by an additional 100%.
 */
class MID1Devastation2P extends Analyzer {
  damageFromAmp = 0;
  damageFromMainTargetAmp = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.MID1);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.AZURE_SWEEP),
      this.onDamage,
    );
  }

  private onDamage(event: DamageEvent) {
    const extraDamage = calculateEffectiveDamage(event, MID1_2P_DAMAGE_AMP);
    this.damageFromAmp += extraDamage;

    const castEvent = getCastEventFromDamage(event);
    if (!castEvent || encodeEventTargetString(castEvent) !== encodeEventTargetString(event)) {
      return;
    }

    this.damageFromMainTargetAmp +=
      calculateEffectiveDamage(event, MID1_2P_DAMAGE_AMP_MAIN_TARGET) - extraDamage;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <strong>2-piece:</strong>
            <li>Damage from amp: {formatNumber(this.damageFromAmp)}</li>
            <li>Damage from main target amp: {formatNumber(this.damageFromMainTargetAmp)}</li>
          </>
        }
      >
        <div className="pad">
          <label>
            <SpellLink spell={SPELLS.AZURE_SWEEP} />
          </label>
          <small>
            <ItemSetLink id={EVOKER_MID1_ID}>MID Season 1 Tier Set 2-piece</ItemSetLink>
          </small>
          <div>
            <strong>Damage from amp:</strong>
            <div className="value">
              <ItemDamageDone amount={this.damageFromAmp} />
            </div>
            <strong>Damage from main target amp:</strong>
            <div className="value">
              <ItemDamageDone amount={this.damageFromMainTargetAmp} />
            </div>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default MID1Devastation2P;
