import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class InvokeYulon extends Analyzer {
  soothHealing: number = 0;
  envelopHealing: number = 0;

  get totalHealing() {
    return this.soothHealing + this.envelopHealing;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT,
    );
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH_HEAL),
      this.handleEnvelopingBreath,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_BREATH),
      this.handleSoothingBreath,
    );
  }

  handleEnvelopingBreath(event: HealEvent) {
    this.envelopHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  handleSoothingBreath(event: HealEvent) {
    this.soothHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        tooltip={
          <>
            Healing Breakdown:
            <ul>
              <li>
                {formatNumber(this.soothHealing)} healing from{' '}
                <SpellLink id={SPELLS.SOOTHING_BREATH.id} />.
              </li>
              <li>
                {formatNumber(this.envelopHealing)} healing from{' '}
                <SpellLink id={TALENTS_MONK.ENVELOPING_BREATH_TALENT.id} />.
              </li>
            </ul>
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink id={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id} /> and
              <br />
              <SpellLink id={TALENTS_MONK.ENVELOPING_BREATH_TALENT.id} />
            </>
          }
        >
          <ItemHealingDone amount={this.totalHealing} />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default InvokeYulon;
