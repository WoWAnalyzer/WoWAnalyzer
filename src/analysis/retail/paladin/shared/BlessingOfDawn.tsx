import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

/**
 * Blessing of Dawn
 * While you are above 85% health, 5% of all damage taken by allies within 20 yds is redirected to you,
 * up to a maximum of (5 * Total Health / 100) every 5 sec.
 */
export default class BlessingOfDawn extends Analyzer {
  totalRedirectedDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLESSING_OF_DAWN_TALENT);
    if (!this.active) {
      return;
    }

    // Listen to damage taken events that are the redirect effect.
    // The spell ID may need to be added to common/SPELLS/paladin.ts.
    this.addEventListener(
      Events.damage.to(SELECTED_PLAYER).spell(SPELLS.BLESSING_OF_DAWN_REDIRECT),
      this.onRedirectDamage,
    );
  }

  onRedirectDamage(event: DamageEvent) {
    this.totalRedirectedDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.DEFAULT}
      >
        <BoringSpellValueText spell={TALENTS.BLESSING_OF_DAWN_TALENT}>
          <div>
            {formatNumber(this.totalRedirectedDamage)} <small>damage redirected</small>
          </div>
          <div>
            {formatNumber(this.owner.getPerSecond(this.totalRedirectedDamage))} <small>DRPS</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
