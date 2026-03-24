import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import Events, { CastEvent } from 'parser/core/Events';
import { DEEP_BREATH_SPELLS } from 'analysis/retail/evoker/shared';
import { getDamageEventsFromCast } from '../normalizers/CastLinkNormalizer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { STRAFING_RUN_MULTIPLIER } from '../../constants';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber } from 'common/format';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import SpellLink from 'interface/SpellLink';
import { getPrimaryDeepBreathEvent } from '../normalizers/StrafingRun';

/** Deep Breath deals 20% increased damage and can be cast again within 18 sec of being used. */
class StrafingRun extends Analyzer {
  damageFromAmp = 0;
  damageFromExtraCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.STRAFING_RUN_TALENT);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(DEEP_BREATH_SPELLS), this.onCast);
  }

  private onCast(event: CastEvent) {
    const primaryEvent = getPrimaryDeepBreathEvent(event);

    if (!primaryEvent) {
      const damageEvents = getDamageEventsFromCast(event);
      this.damageFromAmp += damageEvents.reduce(
        (acc, e) => acc + calculateEffectiveDamage(e, STRAFING_RUN_MULTIPLIER),
        0,
      );

      return;
    }

    const damageEvents = getDamageEventsFromCast(primaryEvent);
    this.damageFromExtraCasts += damageEvents.reduce(
      (acc, e) => acc + e.amount + (e.absorbed || 0),
      0,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage from amp: {formatNumber(this.damageFromAmp)}</li>
            <li>Damage from extra casts: {formatNumber(this.damageFromExtraCasts)}</li>
          </>
        }
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS.STRAFING_RUN_TALENT} />
          </label>

          <strong>Damage from amp:</strong>
          <div className="value">
            <ItemDamageDone amount={this.damageFromAmp} />
          </div>

          <strong>Damage from extra casts:</strong>
          <div className="value">
            <ItemDamageDone amount={this.damageFromExtraCasts} />
          </div>
        </div>
      </Statistic>
    );
  }
}

export default StrafingRun;
