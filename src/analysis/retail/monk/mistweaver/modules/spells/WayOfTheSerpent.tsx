import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import {
  WAY_OF_THE_SERPENT_VIV_SG_INCREASE,
  WAY_OF_THE_SERPENT_REM_INCREASE,
} from '../../constants';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { SpellLink } from 'interface/index';
import { formatPercentage, formatNumber } from 'common/format';

class WayOfTheSerpent extends Analyzer {
  activeVivifySpell = SPELLS.VIVIFY;

  vivifySheilunsHealing = 0;
  renewingMistHealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.WAY_OF_THE_SERPENT_TALENT);

    if (this.selectedCombatant.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT)) {
      this.activeVivifySpell = TALENTS_MONK.SHEILUNS_GIFT_TALENT;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([this.activeVivifySpell, SPELLS.RENEWING_MIST_HEAL]),
      this.onHeal,
    );
  }

  get totalHealing(): number {
    return this.vivifySheilunsHealing + this.renewingMistHealing;
  }

  onHeal(event: HealEvent) {
    if (event.ability.guid === this.activeVivifySpell.id) {
      this.vivifySheilunsHealing += calculateEffectiveHealing(
        event,
        WAY_OF_THE_SERPENT_VIV_SG_INCREASE,
      );
    } else if (event.ability.guid === SPELLS.RENEWING_MIST_HEAL.id) {
      this.renewingMistHealing += calculateEffectiveHealing(event, WAY_OF_THE_SERPENT_REM_INCREASE);
    }
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.WAY_OF_THE_SERPENT_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <div>
              <SpellLink spell={this.activeVivifySpell} /> additional healing:{' '}
              {formatNumber(this.vivifySheilunsHealing)}
            </div>
            <div>
              <SpellLink spell={SPELLS.RENEWING_MIST_HEAL} /> additional healing:{' '}
              {formatNumber(this.renewingMistHealing)}
            </div>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.WAY_OF_THE_SERPENT_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default WayOfTheSerpent;
