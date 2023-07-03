import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, Event, EventType, HealEvent } from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { GIFT_OF_THE_OX_SPELLS } from '../../constants';

/**
 * Gift of the Ox
 *
 * Generated healing spheres when struck, which heal for 1.5x AP when
 * consumed by walking over, expiration, overcapping, or casting
 * Expel Harm.
 *
 * See peak for a breakdown of how it works and all its quirks:
 * https://www.peakofserenity.com/2018/10/06/gift-of-the-ox/
 */
export default class GiftOfTheOx extends Analyzer {
  static dependencies = {
    stats: StatTracker,
  };

  protected stats!: StatTracker;

  totalHealing = 0;

  orbsGenerated = 0;
  orbsConsumed = 0;

  expelHarmCasts = 0;
  expelHarmOrbsConsumed = 0;
  expelHarmOverhealing = 0;

  _lastEHTimestamp: number | null = null;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.GIFT_OF_THE_OX_TALENT);

    this.addEventListener(EventType.OrbGenerated, this._orbGenerated);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXPEL_HARM),
      this._expelCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(GIFT_OF_THE_OX_SPELLS),
      this._gotoxHeal,
    );
  }

  _orbGenerated(event: Event<EventType.OrbGenerated>) {
    this.orbsGenerated += 1;
  }

  _expelCast(event: CastEvent) {
    this.expelHarmCasts += 1;
    this._lastEHTimestamp = event.timestamp;
  }

  _gotoxHeal(event: HealEvent) {
    this.orbsConsumed += 1;
    const amount = event.amount + (event.absorbed || 0);
    this.totalHealing += amount;

    if (event.timestamp === this._lastEHTimestamp) {
      this.expelHarmOrbsConsumed += 1;
      this.expelHarmOverhealing += event.overheal || 0;
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL()}
        tooltip={
          <>
            You generated {formatNumber(this.orbsGenerated)} healing spheres and consumed{' '}
            {formatNumber(this.orbsConsumed)} of them, healing for{' '}
            <b>{formatNumber(this.totalHealing)}</b>.<br />
            {formatNumber(this.expelHarmOrbsConsumed)} of these were consumed with Expel Harm over{' '}
            {formatNumber(this.expelHarmCasts)} casts.
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellIcon spell={GIFT_OF_THE_OX_SPELLS[0]} /> Gift of the Ox Healing
            </>
          }
        >
          <>{formatNumber(this.totalHealing / (this.owner.fightDuration / 1000))} HPS</>
        </BoringValue>
      </Statistic>
    );
  }
}
