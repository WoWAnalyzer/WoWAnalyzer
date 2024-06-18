import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_MONK } from 'common/TALENTS';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import {
  ABILITIES_AFFECTED_BY_HEALING_INCREASES,
  CHI_HARMONY_BOOST,
  CHI_HARMONY_DURATION,
} from '../../constants';
import HotTrackerMW from '../core/HotTrackerMW';
import TalentSpellText from 'parser/ui/TalentSpellText';

//TODO : Move into & refactor into Chi Harmony talent module

class ChiHarmony extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    healingDone: HealingDone,
    hotTracker: HotTrackerMW,
  };
  protected healingDone!: HealingDone;
  protected combatants!: Combatants;
  protected hotTracker!: HotTrackerMW;

  healing: number = 0;
  overheal: number = 0;
  refreshes: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.CHI_HARMONY_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.handleGomHit,
    );
  }

  handleRefresh(event: RefreshBuffEvent) {
    this.refreshes += 1;
  }

  handleGomHit(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    if (!combatant) {
      return;
    }
  }

  onHeal(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    if (!combatant || !ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(event.ability.guid)) {
      return;
    }

    //hotTracker Check to see if the REM has been on for less than 8s
    if (
      !this.hotTracker.hots[combatant.id] ||
      !this.hotTracker.hots[combatant.id][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[combatant.id][SPELLS.RENEWING_MIST_HEAL.id];
    const currentDuration = event.timestamp - hot.start;

    if (currentDuration <= CHI_HARMONY_DURATION && !this.hotTracker.fromBounce(hot)) {
      this.healing += calculateEffectiveHealing(event, CHI_HARMONY_BOOST);
      this.overheal += calculateOverhealing(event, CHI_HARMONY_BOOST);
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(0)}
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <TalentSpellText talent={TALENTS_MONK.CHI_HARMONY_TALENT}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ChiHarmony;
