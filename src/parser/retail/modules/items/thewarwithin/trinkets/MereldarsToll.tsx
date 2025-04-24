import ITEMS from 'common/ITEMS/thewarwithin/trinkets';
import SPELLS from 'common/SPELLS/thewarwithin/trinkets';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Abilities from 'parser/core/modules/Abilities';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import { formatPercentage, formatNumber } from 'common/format';
import { DamageIcon, VersatilityIcon, InformationIcon } from 'interface/icons';
import Combatants from 'parser/shared/modules/Combatants';
import { calculateSecondaryStatDefault } from 'parser/core/stats';

/**
 * Based on the stats provided on wowhead.
 *
 * https://www.wowhead.com/item=219313/mereldars-toll
 */
const MERELDARS_TOLL_BASE_ILVL = 437;
const MERELDARS_TOLL_BASE_GAIN = 658;

export default class MereldarsToll extends Analyzer.withDependencies({
  abilities: Abilities,
  combatants: Combatants,
}) {
  protected damage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTrinket(ITEMS.MERELDARS_TOLL.id);
    if (!this.active) {
      return;
    }

    this.deps.abilities.add({
      spell: SPELLS.MERELDARS_TOLL_USE.id,
      category: SPELL_CATEGORY.ITEMS,
      cooldown: 90,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.9,
      },
    });

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MERELDARS_TOLL_DAMAGE),
      this.onDamage,
    );
  }

  private onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const externalUptime = this.deps.combatants.getBuffUptime(SPELLS.MERELDARS_TOLL_VERS.id);
    const externalUptimePercentage = externalUptime / this.owner.fightDuration;
    const players = Object.values(this.deps.combatants.players);
    const externalUptimeTotal = players.reduce((acc, player) => {
      return acc + player.getBuffUptime(SPELLS.MERELDARS_TOLL_VERS.id);
    }, 0);
    const externalUptimeTotalPercentage = externalUptimeTotal / this.owner.fightDuration;
    const versBuff = calculateSecondaryStatDefault(
      MERELDARS_TOLL_BASE_ILVL,
      MERELDARS_TOLL_BASE_GAIN,
      this.selectedCombatant.getTrinket(ITEMS.MERELDARS_TOLL.id)?.itemLevel,
    );
    const averageVers = versBuff * externalUptimeTotalPercentage;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.MERELDARS_TOLL}>
          <DamageIcon /> {formatNumber(this.owner.getPerSecond(this.damage))}{' '}
          <small>direct DPS</small>
          <p></p>
          <VersatilityIcon /> {formatNumber(averageVers)} <small>average Versatility granted</small>
          <p></p>
          <InformationIcon /> {formatPercentage(externalUptimePercentage, 1)}%{' '}
          <small>Versatility buff uptime</small>
        </BoringItemValueText>
      </Statistic>
    );
  }
}
