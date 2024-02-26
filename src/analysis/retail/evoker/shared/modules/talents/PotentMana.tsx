import { Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import fetchWcl from 'common/fetchWclApi';
import { WCLDamageDoneTableResponse, WCLHealing, WCLHealingTableResponse } from 'common/WCL_TYPES';
import SourceOfMagic from './SourceOfMagic';
import { POTENT_MANA_MULTIPLIER } from '../../constants';
import LazyLoadStatisticBox from 'parser/ui/LazyLoadStatisticBox';
import { SpellIcon, SpellLink } from 'interface';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { formatNumber } from 'common/format';

class PotentMana extends SourceOfMagic {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.POTENT_MANA_TALENT);
  }

  totalHealingFromPotentMana = 0;
  totalDamageFromPotentMana = 0;

  getDamageFilter(): string {
    const filter = this.sourceOfMagicWindows
      .map((window) => {
        const filter = `
        ((source.name='${window.player}' OR source.owner.name='${window.player}') AND
        timestamp>=${window.start - this.owner.fight.start_time} AND 
        timestamp<=${window.end - this.owner.fight.start_time})
        `;
        return filter;
      })
      .join(' OR ');

    return filter;
  }

  getHealingFilter(): string {
    let filter = this.sourceOfMagicWindows
      .map((window) => {
        const filter = `
        ((source.name='${window.player}' OR source.owner.name='${window.player}') AND
        timestamp>=${window.start - this.owner.fight.start_time} AND 
        timestamp<=${window.end - this.owner.fight.start_time})
        `;
        return filter;
      })
      .join(' OR ');

    filter = String(filter) + 'AND effectiveHealing > 0';
    return filter;
  }

  async load() {
    const fetchPromises = {
      healingTable: await fetchWcl<WCLHealingTableResponse>(
        `report/tables/healing/${this.owner.report.code}`,
        {
          start: this.owner.fight.start_time,
          end: this.owner.fight.end_time,
          filter: this.getHealingFilter(),
        },
      ),
      damageTable: await fetchWcl<WCLDamageDoneTableResponse>(
        `report/tables/damage-done/${this.owner.report.code}`,
        {
          start: this.owner.fight.start_time,
          end: this.owner.fight.end_time,
          filter: this.getDamageFilter(),
        },
      ),
    };

    const [healingTable, damageTable] = await Promise.all([
      fetchPromises.healingTable,
      fetchPromises.damageTable,
    ]);

    this.totalHealingFromPotentMana = healingTable.entries.reduce(
      // Because this is a % healing increase and we are unable to parse each healing event individually for its effective healing,
      // we need to do some "approximations" using the total overheal in tandem with the total healing. We do not want to naively
      // assume all healing was fully effective, as this would drastically overweight the power of the buff in situations where a
      // lot of overhealing occurs.

      // We increase the accuracy by only including events that had effective healing.
      // Tested this against fetching all events and calculating the effective healing of each event and it ended up being
      // within ~1-2% of the approximation (m+ has higher variance but w/e)
      // The approximation is always on the lower end, so we won't be overvaluing.
      (healingFromBuff, entry: WCLHealing) =>
        healingFromBuff +
        (entry.total - entry.total / (1 + POTENT_MANA_MULTIPLIER)) *
          (entry.total / (entry.total + (entry.overheal || 0))),
      0,
    );
    this.totalDamageFromPotentMana = damageTable.entries.reduce(
      (damageFromBuff, entry) =>
        damageFromBuff + (entry.total - entry.total / (1 + POTENT_MANA_MULTIPLIER)),
      0,
    );
  }

  statistic() {
    if (!this.active) {
      return null;
    }

    return (
      <>
        <LazyLoadStatisticBox
          loader={this.load.bind(this)}
          icon={<SpellIcon spell={TALENTS.POTENT_MANA_TALENT} />}
          value={
            <>
              <div>
                <ItemHealingDone
                  amount={this.totalHealingFromPotentMana}
                  displayPercentage={false}
                  approximate
                />
              </div>
              <div>
                <ItemDamageDone
                  amount={this.totalDamageFromPotentMana}
                  displayPercentage={false}
                  approximate
                />
              </div>
            </>
          }
          label={<SpellLink spell={TALENTS.POTENT_MANA_TALENT} icon={false} />}
          tooltip={
            <>
              <SpellLink spell={TALENTS.POTENT_MANA_TALENT} /> contributed ≈
              {formatNumber(this.totalHealingFromPotentMana)} healing and ≈
              {formatNumber(this.totalDamageFromPotentMana)} damage.
              <br />
              NOTE: This metric uses an approximation to calculate contribution from the buff due to
              technical limitations.
            </>
          }
        />
      </>
    );
  }
}

export default PotentMana;
