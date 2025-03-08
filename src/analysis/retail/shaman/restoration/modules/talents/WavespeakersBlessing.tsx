import { formatNumber, formatPercentage } from 'common/format';
import talents from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { RIPTIDE_BASE_DURATION } from '../../constants';
import RiptideTracker from '../core/RiptideTracker';

class WavespeakersBlessing extends Analyzer {
  static dependencies = {
    riptideTracker: RiptideTracker,
  };

  protected riptideTracker!: RiptideTracker;

  healingFromPWaveRiptide: number = 0;
  healingFromPTCRiptide: number = 0;
  healingFromHardcast: number = 0;
  healing: number = 0;
  ptcActive: boolean;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.WAVESPEAKERS_BLESSING_TALENT);
    this.ptcActive = this.selectedCombatant.hasTalent(talents.PRIMAL_TIDE_CORE_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(talents.RIPTIDE_TALENT),
      this.onRiptideHeal,
    );
  }

  onRiptideHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (!this.riptideTracker.hots[targetId] || !this.riptideTracker.hots[targetId][spellId]) {
      return;
    }
    const riptide = this.riptideTracker.hots[targetId][spellId];
    if (riptide && event.timestamp - riptide.start <= RIPTIDE_BASE_DURATION) {
      return;
    }
    this.healing += event.amount + (event.absorbed || 0);
    if (this.riptideTracker.fromHardcast(riptide)) {
      this.healingFromHardcast += event.amount + (event.absorbed || 0);
    }
    if (this.ptcActive && this.riptideTracker.fromPrimalTideCore(riptide)) {
      this.healingFromPTCRiptide += event.amount + (event.absorbed || 0);
    }
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={talents.WAVESPEAKERS_BLESSING_TALENT} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(15)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <ul>
              <li>
                {formatNumber(this.healingFromHardcast)} from hardcast{' '}
                <SpellLink spell={talents.RIPTIDE_TALENT} />
              </li>
              {this.ptcActive && (
                <li>
                  {formatNumber(this.healingFromPTCRiptide)} from{' '}
                  <SpellLink spell={talents.PRIMAL_TIDE_CORE_TALENT} />{' '}
                  <SpellLink spell={talents.RIPTIDE_TALENT} />
                </li>
              )}
            </ul>
          </>
        }
      >
        <TalentSpellText talent={talents.WAVESPEAKERS_BLESSING_TALENT}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default WavespeakersBlessing;
