import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  HasTarget,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { SWIRLING_CURRENTS_RANKS } from '../../../constants';

/**
 * Using Healing stream totem/Cloudburst totem increases the healing of your next 3 healing surges, healing waves or riptides by x%
 * https://www.warcraftlogs.com/reports/8HtnKrqLJ7y9VFQ6#fight=21&type=summary&source=88
 */
class SwirlingCurrents extends Analyzer {
  conduitRank = 0;
  healingBoost = 0;
  healing = 0;
  targetsWithBoostedRiptides: boolean[] = [];

  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.SWIRLING_CURRENTS.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }

    this.healingBoost = SWIRLING_CURRENTS_RANKS[this.conduitRank] / 100;

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this.riptideHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.HEALING_SURGE, TALENTS.HEALING_WAVE_TALENT]),
      this.notRiptideHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this.trackRiptide,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this.trackRiptide,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this.removeRiptide,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this.pandemicRiptide,
    );
  }

  riptideHeal(event: HealEvent) {
    if (this.targetsWithBoostedRiptides[event.targetID]) {
      this.healing += calculateEffectiveHealing(event, this.healingBoost);
    }
  }

  notRiptideHeal(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.SWIRLING_CURRENTS_BUFF.id)) {
      this.healing += calculateEffectiveHealing(event, this.healingBoost);
    }
  }

  trackRiptide(event: ApplyBuffEvent | CastEvent) {
    if (!HasTarget(event)) {
      return;
    }
    // todo: check logic and timings, we don't want the castevent to add to the list, and the applybuffevent to remove again
    // probably only use applybuffevent with proper buffers to catch non-casted riptides (legendary, pwave)
    if (this.selectedCombatant.hasBuff(SPELLS.SWIRLING_CURRENTS_BUFF.id)) {
      this.targetsWithBoostedRiptides[event.targetID] = true;
    } else {
      delete this.targetsWithBoostedRiptides[event.targetID];
    }
  }

  removeRiptide(event: RemoveBuffEvent) {
    delete this.targetsWithBoostedRiptides[event.targetID];
  }

  pandemicRiptide(event: RefreshBuffEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SWIRLING_CURRENTS_BUFF.id)) {
      delete this.targetsWithBoostedRiptides[event.targetID];
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spellId={SPELLS.SWIRLING_CURRENTS.id} rank={this.conduitRank}>
          <ItemHealingDone amount={this.healing} />
          <br />
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default SwirlingCurrents;
