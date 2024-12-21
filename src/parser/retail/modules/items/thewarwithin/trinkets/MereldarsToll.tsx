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
import { formatDuration, formatPercentage, formatNumber } from 'common/format';
import { DamageIcon } from 'interface/icons';
import VersatilityIcon from 'interface/icons/Versatility';

export default class MereldarsToll extends Analyzer.withDependencies({
  abilities: Abilities,
}) {
    protected damage: number = 0;

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

        this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MERELDARS_TOLL_DAMAGE), this.onDamage);
    }

    private onDamage(event: DamageEvent) {
        this.damage += event.amount + (event.absorbed || 0);
    }

    statistic() {
        const uptime = this.selectedCombatant.getBuffUptime(SPELLS.MERELDARS_TOLL_VERS.id, this.owner.playerId);
        const uptimePercentage = uptime / this.owner.fightDuration;
        return (
          <Statistic
            position={STATISTIC_ORDER.OPTIONAL(99)}
            category={STATISTIC_CATEGORY.ITEMS}
            size="flexible"
          >
          <BoringItemValueText item={ITEMS.MERELDARS_TOLL}>
            <DamageIcon /> {formatNumber(this.owner.getPerSecond(this.damage))} <small>direct DPS</small>
            <p></p>
            <VersatilityIcon /> {formatPercentage(uptimePercentage, 1)}% <small>personal Versatility uptime</small>
          </BoringItemValueText>
      </Statistic>
        );
      }
}
