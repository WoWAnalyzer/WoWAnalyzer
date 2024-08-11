import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import {
  isFromCraneStyleBok,
  isFromCraneStyleRSK,
  isFromCraneStyleSCK,
} from '../../normalizers/CastLinkNormalizer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import SpellLink from 'interface/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

class CraneStyle extends Analyzer {
  gomHealing: number = 0;
  gomOverhealing: number = 0;
  rskHealing: number = 0;
  bokHealing: number = 0;
  sckHealing: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.CRANE_STYLE_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.onGomHeal,
    );
  }

  private onGomHeal(event: HealEvent) {
    if (this.attributeSourceGoM(event)) {
      this.gomHealing += event.amount + (event.absorbed || 0);
      this.gomOverhealing += event.overheal || 0;
    }
  }

  private attributeSourceGoM(event: HealEvent): boolean {
    if (isFromCraneStyleRSK(event)) {
      this.rskHealing += event.amount + (event.absorbed || 0);
    } else if (isFromCraneStyleBok(event)) {
      this.bokHealing += event.amount + (event.absorbed || 0);
    } else if (isFromCraneStyleSCK(event)) {
      this.sckHealing += event.amount + (event.absorbed || 0);
    } else {
      return false;
    }
    return true;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.CRANE_STYLE_TALENT} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.gomHealing))} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <SpellLink spell={SPELLS.GUSTS_OF_MISTS} /> healing by source:
            <ul>
              <li>
                {formatNumber(this.rskHealing)} from{' '}
                <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} />
              </li>
              <li>
                {formatNumber(this.bokHealing)} from <SpellLink spell={SPELLS.BLACKOUT_KICK} />
              </li>
              <li>
                {formatNumber(this.sckHealing)} from{' '}
                <SpellLink spell={SPELLS.SPINNING_CRANE_KICK} />
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.CRANE_STYLE_TALENT}>
          <ItemHealingDone amount={this.gomHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default CraneStyle;
