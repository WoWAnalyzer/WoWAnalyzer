import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import RiptideTracker from '../core/RiptideTracker';
import talents from 'common/TALENTS/shaman';
import { Options } from 'parser/core/Module';
import Events, { ApplyBuffEvent, HealEvent } from 'parser/core/Events';
import { isFromPrimalTideCore } from '../../normalizers/CastLinkNormalizer';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

class PrimalTideCore extends Analyzer {
  static dependencies = {
    riptideTracker: RiptideTracker,
    combatants: Combatants,
  };
  protected riptideTracker!: RiptideTracker;
  protected combatants!: Combatants;
  ptcProcs: number = 0;
  ptcHealing: number = 0;
  ptcOverhealing: number = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.PRIMAL_TIDE_CORE_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(talents.RIPTIDE_TALENT),
      this.onApplyRiptide,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(talents.RIPTIDE_TALENT),
      this.onRiptideHeal,
    );
  }

  onApplyRiptide(event: ApplyBuffEvent) {
    if (isFromPrimalTideCore(event)) {
      const targetId = event.targetID;
      const spellId = event.ability.guid;
      if (!this.riptideTracker.hots[targetId] || !this.riptideTracker.hots[targetId][spellId]) {
        return;
      }
      this.ptcProcs += 1;
    }
  }

  onRiptideHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (event.tick) {
      if (!this.riptideTracker.hots[targetId] || !this.riptideTracker.hots[targetId][spellId]) {
        return;
      }
      const riptide = this.riptideTracker.hots[targetId][spellId];
      if (this.riptideTracker.fromPrimalTideCore(riptide)) {
        this.ptcHealing += event.amount + (event.absorbed || 0);
        this.ptcHealing += event.overheal || 0;
      }
    } else if (isFromPrimalTideCore(event)) {
      this.ptcHealing += event.amount + (event.absorbed || 0);
      this.ptcHealing += event.overheal || 0;
    }
  }
  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={talents.PRIMAL_TIDE_CORE_TALENT} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.ptcHealing))} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is only showing the additional riptide healing gained from{' '}
            <SpellLink spell={talents.PRIMAL_TIDE_CORE_TALENT} />
          </>
        }
      >
        <TalentSpellText talent={talents.PRIMAL_TIDE_CORE_TALENT}>
          <ItemHealingDone amount={this.ptcHealing} />
          <br />
          {this.ptcProcs}{' '}
          <small>
            additional <SpellLink spell={talents.RIPTIDE_TALENT} />
          </small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PrimalTideCore;
