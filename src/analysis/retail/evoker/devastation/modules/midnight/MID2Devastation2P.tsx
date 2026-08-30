import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/evoker';
import { getCastEventFromDamage } from 'analysis/retail/evoker/devastation/modules/normalizers/CastLinkNormalizer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import {
  MID2_2P_DAMAGE_AMP,
  SHATTERING_STARS_MULTIPLIER_PER_RANK,
} from 'analysis/retail/evoker/devastation/constants';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber } from 'common/format';
import SpellLink from 'interface/SpellLink';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemSetLink from 'interface/ItemSetLink';
import { EVOKER_MID2_ID } from 'common/ITEMS';
import TALENTS from 'common/TALENTS/evoker';

/**
 * (2) Set Devastation: Shattering Star's damage is increased by 50%, and it always casts as if you had reached maximum empower level.
 */
export default class MID2Devastation2P extends Analyzer {
  uprankOverride = this.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_DEVASTATION_TALENT)
    ? 4
    : 3;

  damageFromAmp = 0;
  damageFromAlwaysUprank = 0;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.has2PieceByTier(TIERS.MID2) &&
      this.selectedCombatant.hasTalent(TALENTS.SHATTERING_STARS_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHATTERING_STAR_DAMAGE),
      this.onDamage,
    );
  }

  private onDamage(event: DamageEvent) {
    const totalAmp =
      MID2_2P_DAMAGE_AMP + SHATTERING_STARS_MULTIPLIER_PER_RANK * this.uprankOverride;
    const totalExtraDamage = calculateEffectiveDamage(event, totalAmp);

    this.damageFromAmp += (totalExtraDamage * MID2_2P_DAMAGE_AMP) / totalAmp;
    this.damageFromAlwaysUprank +=
      (totalExtraDamage * SHATTERING_STARS_MULTIPLIER_PER_RANK * this.uprankOverride) / totalAmp;

    const castEvent = getCastEventFromDamage(event);
    if (!castEvent || encodeEventTargetString(castEvent) !== encodeEventTargetString(event)) {
      return;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <strong>Shattering Stars:</strong>
            <ul>
              <li>Damage from amp: {formatNumber(this.damageFromAmp)}</li>
              <li>Damage from upranking: {formatNumber(this.damageFromAlwaysUprank)}</li>
            </ul>
          </>
        }
      >
        <div className="pad">
          <label>
            <ItemSetLink id={EVOKER_MID2_ID}>MID Season 2 Tier Set 2-piece</ItemSetLink>
          </label>
          <label>
            <SpellLink spell={TALENTS.SHATTERING_STARS_TALENT} />
          </label>
          <div>
            <strong>Damage from amp:</strong>
            <div className="value">
              <ItemDamageDone amount={this.damageFromAmp} />
            </div>
            <strong>Damage from upranking:</strong>
            <div className="value">
              <ItemDamageDone amount={this.damageFromAlwaysUprank} />
            </div>
          </div>
        </div>
      </Statistic>
    );
  }
}
