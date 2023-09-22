import { TALENTS_MONK } from 'common/TALENTS';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { formatNumber, formatPercentage } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

class Unison extends Analyzer {
  healing: number = 0;
  overhealing: number = 0;
  healingFromJss: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.UNISON_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.UNISON_HEAL),
      this.unisonHeal,
    );
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT)) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER_PET).spell(SPELLS.UNISON_HEAL),
        this.jssUnisonHeal,
      );
    }
  }

  unisonHeal(event: HealEvent) {
    this.healing += (event.amount || 0) + (event.absorbed || 0);
    this.overhealing += event.overheal || 0;
  }

  jssUnisonHeal(event: HealEvent) {
    this.healing += (event.amount || 0) + (event.absorbed || 0);
    this.overhealing += event.overheal || 0;
    this.healingFromJss += (event.amount || 0) + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={SPELLS.UNISON_HEAL} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(8)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>
              Healing from <SpellLink spell={TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT} />:{' '}
              {formatNumber(this.healingFromJss)}
            </li>
            <li>
              Healing from <SpellLink spell={TALENTS_MONK.SOOTHING_MIST_TALENT} />:{' '}
              {formatNumber(this.healing - this.healingFromJss)}
            </li>
          </ul>
        }
      >
        <BoringSpellValueText spell={SPELLS.UNISON_HEAL}>
          <ItemHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Unison;
