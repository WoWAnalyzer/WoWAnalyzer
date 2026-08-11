import { TALENTS_MONK } from 'common/TALENTS';
import { formatNumber, formatPercentage } from 'common/format';
import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SOOTHING_MIST_SOURCES, VITAL_EXPENDITURE_HEALING_INCREASE } from '../../constants';

// statue doesn't get boosted, so we can ignore it here
const BOOSTED_SOURCES = SOOTHING_MIST_SOURCES.filter(
  ({ spell }) => spell !== TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT,
);

class VitalExpenditure extends Analyzer {
  healingBySource = new Map<Spell, number>();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.VITAL_EXPENDITURE_TALENT);

    BOOSTED_SOURCES.forEach(({ spell }) => {
      this.healingBySource.set(spell, 0);
    });

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(BOOSTED_SOURCES.map(({ heal }) => heal)),
      this.onSoothingMistHeal,
    );
  }

  private onSoothingMistHeal(event: HealEvent) {
    const source = BOOSTED_SOURCES.find(({ heal }) => heal.id === event.ability.guid);
    if (!source) return;

    const healing = calculateEffectiveHealing(event, VITAL_EXPENDITURE_HEALING_INCREASE);
    this.healingBySource.set(source.spell, (this.healingBySource.get(source.spell) || 0) + healing);
  }

  get totalHealing() {
    return Array.from(this.healingBySource.values()).reduce((total, healing) => total + healing, 0);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.VITAL_EXPENDITURE_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <strong>Effective healing</strong> from the{' '}
            {formatPercentage(VITAL_EXPENDITURE_HEALING_INCREASE, 0)}% increase:
            <ul>
              {Array.from(this.healingBySource).map(([spell, healing]) => (
                <li key={spell.id}>
                  <SpellLink spell={spell} />: {formatNumber(healing)} (
                  {formatPercentage(this.owner.getPercentageOfTotalHealingDone(healing))}%)
                </li>
              ))}
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.VITAL_EXPENDITURE_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default VitalExpenditure;
