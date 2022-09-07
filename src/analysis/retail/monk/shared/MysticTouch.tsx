import fetchWcl from 'common/fetchWclApi';
import { formatNumber } from 'common/format';
import makeWclUrl from 'common/makeWclUrl';
import SPELLS from 'common/SPELLS';
import { WCLDamageDoneTableResponse } from 'common/WCL_TYPES';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import LazyLoadStatisticBox, { STATISTIC_ORDER } from 'parser/ui/LazyLoadStatisticBox';

const MYSTIC_TOUCH_INCREASE = 0.05;

/**
 * Spirit Link Totem
 * Summons a totem at the target location for 6 sec, which reduces damage taken by all party and raid members within 10 yards by 10%.
 */
class MysticTouch extends Analyzer {
  totalDamageAdded = 0;
  damageAdded = 0;

  get filter() {
    const playerName = this.owner.player.name;
    return `
      ability.type=${MAGIC_SCHOOLS.ids.PHYSICAL}
      AND
      IN RANGE
        FROM type='${EventType.ApplyDebuff}'
          AND ability.id=${SPELLS.MYSTIC_TOUCH_DEBUFF.id}
          AND source.owner.name='${playerName}'
        TO type='${EventType.RemoveDebuff}'
          AND ability.id=${SPELLS.MYSTIC_TOUCH_DEBUFF.id}
          AND source.owner.name='${playerName}'
        GROUP BY target
      END
    `;
  }

  load() {
    return fetchWcl(`report/tables/damage-done/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: this.filter,
    }).then((json) => {
      const data = json as WCLDamageDoneTableResponse;

      this.totalDamageAdded = data.entries.reduce(
        (damageDone: number, entry) => damageDone + entry.total,
        0,
      );

      this.damageAdded =
        this.totalDamageAdded - this.totalDamageAdded / (1 + MYSTIC_TOUCH_INCREASE);
    });
  }

  statistic() {
    return (
      <LazyLoadStatisticBox
        position={STATISTIC_ORDER.OPTIONAL(60)}
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.MYSTIC_TOUCH_DEBUFF.id} />}
        value={formatNumber(this.owner.getPerSecond(this.damageAdded)) + ' DPS'}
        label="Mystic Touch Damage Increased"
        tooltip={
          <>
            If this number is zero then another monk most likely applyed mystic touch before you.
            <br />
            If you want to see the value Mystic Touch provided you will need to go to their log to
            find out.
            <br />
            Total Physical Damage Queried: {formatNumber(this.totalDamageAdded)}
          </>
        }
        drilldown={makeWclUrl(this.owner.report.code, {
          fight: this.owner.fightId,
          type: 'damage-done',
          pins: `2$Off$#244F4B$expression$${this.filter}`,
          view: 'events',
        })}
      />
    );
  }
}

export default MysticTouch;
