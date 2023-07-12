import { Trans } from '@lingui/macro';
import fetchWcl from 'common/fetchWclApi';
import { formatThousands, formatNumber } from 'common/format';
import makeWclUrl from 'common/makeWclUrl';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { WCLDamageTaken, WCLDamageTakenTableResponse } from 'common/WCL_TYPES';
import { SpellIcon } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import LazyLoadStatisticBox, { STATISTIC_ORDER } from 'parser/ui/LazyLoadStatisticBox';

const SPIRIT_LINK_TOTEM_DAMAGE_REDUCTION = 0.1;

/**
 * Spirit Link Totem
 * Summons a totem at the target location for 6 sec, which reduces damage taken by all party and raid members within 10 yards by 10%.
 */
class SpiritLinkDamageReduction extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SPIRIT_LINK_TOTEM_TALENT);
  }

  damageReduced = 0;
  get drps() {
    return (this.damageReduced / this.owner.fightDuration) * 1000;
  }

  get filter() {
    const playerName = this.owner.player.name;

    return `
      IN RANGE
        FROM type='${EventType.ApplyBuff}'
          AND ability.id=${SPELLS.SPIRIT_LINK_TOTEM_BUFF.id}
          AND source.owner.name='${playerName}'
        TO type='${EventType.RemoveBuff}'
          AND ability.id=${SPELLS.SPIRIT_LINK_TOTEM_BUFF.id}
          AND source.owner.name='${playerName}'
        GROUP BY target
      END
    `;
  }

  load() {
    return fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: this.filter,
    }).then((json) => {
      json = json as WCLDamageTakenTableResponse;

      const totalDamageTaken = (json.entries as WCLDamageTaken[]).reduce(
        (damageTaken: number, entry) => damageTaken + entry.total,
        0,
      );
      this.damageReduced =
        (totalDamageTaken / (1 - SPIRIT_LINK_TOTEM_DAMAGE_REDUCTION)) *
        SPIRIT_LINK_TOTEM_DAMAGE_REDUCTION;
    });
  }

  statistic() {
    const tooltip = (
      <Trans id="shaman.restoration.slt.statistic.tooltip">
        The total estimated damage reduced during Spirit Link was{' '}
        {formatThousands(this.damageReduced)} ({formatNumber(this.drps)} DRPS). This has a 99%
        accuracy.
        <br />
        <br />
        This value is calculated using the <i>Optional DRs</i> method. This results in the lowest
        possible damage reduction value being shown. This should be the correct value in most
        circumstances. Health redistribution is not part of this calculated value.
      </Trans>
    );

    return (
      <LazyLoadStatisticBox
        position={STATISTIC_ORDER.OPTIONAL(60)}
        loader={this.load.bind(this)}
        icon={<SpellIcon spell={TALENTS.SPIRIT_LINK_TOTEM_TALENT} />}
        value={
          <Trans id="shaman.restoration.slt.statistic.value">≈{formatNumber(this.drps)} DRPS</Trans>
        }
        label={<Trans id="shaman.restoration.slt.statistic.label">Damage reduction</Trans>}
        tooltip={tooltip}
        drilldown={makeWclUrl(this.owner.report.code, {
          fight: this.owner.fightId,
          type: 'damage-taken',
          pins: `2$Off$#244F4B$expression$${this.filter}`,
          view: 'events',
        })}
      />
    );
  }
}

export default SpiritLinkDamageReduction;
