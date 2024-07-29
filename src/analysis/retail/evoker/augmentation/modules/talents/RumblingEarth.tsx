import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Events, { DamageEvent, HasRelatedEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { UPHEAVAL_RUMBLING_EARTH_LINK } from '../normalizers/CastLinkNormalizer';

/**
 * Upheaval causes an aftershock at its location, dealing 50% of its damage 2 additional time.
 */
class RumblingEarth extends Analyzer {
  totalRumblingEarthDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RUMBLING_EARTH_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.UPHEAVAL_DAM),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    if (HasRelatedEvent(event, UPHEAVAL_RUMBLING_EARTH_LINK)) {
      this.totalRumblingEarthDamage += event.amount + (event.absorbed ?? 0);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.totalRumblingEarthDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.RUMBLING_EARTH_TALENT}>
          <ItemDamageDone amount={this.totalRumblingEarthDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default RumblingEarth;
