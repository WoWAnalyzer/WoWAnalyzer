import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
import { SpellIcon } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { EventType, RemoveStaggerEvent } from 'parser/core/Events';
import BoringValue from 'parser/ui/BoringValueText';
import ItemDamageTaken from 'parser/ui/ItemDamageTaken';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { ReactNode } from 'react';

export default class BrewmasterT29FourSet extends Analyzer {
  protected damagePurified = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has4PieceByTier(TIERS.DF1);

    this.addEventListener(EventType.RemoveStagger, this.onRemoveStagger);
  }

  private onRemoveStagger(event: RemoveStaggerEvent) {
    const rhythmPct = event.sourceBreakdown?.[SPELLS.BREWMASTERS_RHYTHM_BUFF.id];

    // unnecessary additional check allows inferring that sourceBreakdown is not undefined
    if (event.sourceBreakdown === undefined || rhythmPct === undefined) {
      return;
    }

    const totalPct = Object.values(event.sourceBreakdown).reduce((a, b) => a + b, 0);

    this.damagePurified += event.amount * (rhythmPct / totalPct);
  }

  statistic(): ReactNode {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            Purified an additional <strong>{formatNumber(this.damagePurified)}</strong> damage.
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellIcon spell={{ ...SPELLS.BREWMASTERS_RHYTHM_BUFF, id: 393660 }} /> Wrappings of
              the Waking Fist &mdash; 4pc
            </>
          }
        >
          <ItemDamageTaken amount={this.damagePurified} hideTotal />
        </BoringValue>
      </Statistic>
    );
  }
}
