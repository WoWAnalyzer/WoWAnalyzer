import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import DonutChart from 'parser/ui/DonutChart';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { BLAZE_OF_LIGHT_INCREASE } from '../../constants';

import AtonementAnalyzer from '../core/AtonementAnalyzer';
import AtonementDamageSource from '../features/AtonementDamageSource';

class BlazeOfLight extends Analyzer {
  static dependencies = {
    atonementDamageSource: AtonementDamageSource,
  };
  smiteHealing = 0;
  penanceHealing = 0;
  damage = 0;
  blazeOfLightIncrease = 0;
  protected atonementDamageSource!: AtonementDamageSource;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.BLAZE_OF_LIGHT_TALENT);

    this.blazeOfLightIncrease =
      BLAZE_OF_LIGHT_INCREASE[
        this.selectedCombatant.getTalentRank(TALENTS_PRIEST.BLAZE_OF_LIGHT_TALENT) - 1
      ];
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtonement);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.SMITE, SPELLS.PENANCE]),
      this.onDamage,
    );
  }

  onAtonement(event: any) {
    const { healEvent, damageEvent } = event;

    if (
      damageEvent.ability.guid !== SPELLS.SMITE.id &&
      damageEvent.ability.guid !== SPELLS.PENANCE.id
    ) {
      return;
    }

    const healing = calculateEffectiveHealing(healEvent, this.blazeOfLightIncrease);

    damageEvent.ability.guid === SPELLS.SMITE.id
      ? (this.smiteHealing += healing)
      : (this.penanceHealing += healing);
  }

  onDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, this.blazeOfLightIncrease);
  }

  renderBlazeOfLightChart() {
    const items = [
      {
        color: '#fff',
        label: 'Smite',
        spellId: SPELLS.SMITE.id,
        value: this.smiteHealing,
        valueTooltip: `${formatThousands(
          (this.smiteHealing / this.owner.fightDuration) * 1000,
        )} HPS`,
      },
      {
        color: '#0cd368',
        label: 'Penance',
        spellId: SPELLS.PENANCE.id,
        value: this.penanceHealing,
        valueTooltip: `${formatThousands(
          (this.penanceHealing / this.owner.fightDuration) * 1000,
        )} HPS`,
      },
    ];

    return <DonutChart chartSize={50} items={items} />;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringSpellValueText spellId={TALENTS_PRIEST.BLAZE_OF_LIGHT_TALENT.id}>
          <>
            <ItemHealingDone amount={this.smiteHealing + this.penanceHealing} /> <br />
            <ItemDamageDone amount={this.damage} />
            <h5>Healing breakdown:</h5>
            {this.renderBlazeOfLightChart()}
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BlazeOfLight;
