import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  EventType,
  GetRelatedEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { BLESSING_OF_ANSHE } from '../../../normalizers/EventLinks/EventLinkConstants';
import { formatNumber } from 'common/format';
import {
  calculateEffectiveDamage,
  calculateEffectiveHealing,
  calculateOverhealing,
} from 'parser/core/EventCalculateLib';
import { BLESSING_OF_ANSHE_INCREASE } from '../../../constants';

class BlessingOfAnshe extends Analyzer {
  healingDone = 0;
  overhealing = 0;
  damageDone = 0;

  procs = 0;
  refreshes = 0;
  usedProcs = 0;

  constructor(args: Options) {
    super(args);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLESSING_OF_ANSHE_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BLESSING_OF_ANSHE_BUFF),
      this.onApply,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BLESSING_OF_ANSHE_BUFF),
      this.onRefresh,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BLESSING_OF_ANSHE_BUFF),
      this.onRemove,
    );
  }

  onRefresh(event: RefreshBuffEvent) {
    this.refreshes += 1;
  }

  onApply(event: ApplyBuffEvent) {
    this.procs += 1;
  }

  onRemove(event: RemoveBuffEvent) {
    const holyShock = GetRelatedEvent(event, BLESSING_OF_ANSHE);
    if (!holyShock) return;

    if (holyShock.type === EventType.Heal) {
      this.healingDone += calculateEffectiveHealing(holyShock, BLESSING_OF_ANSHE_INCREASE);
      this.overhealing += calculateOverhealing(holyShock, BLESSING_OF_ANSHE_INCREASE);
    } else if (holyShock.type === EventType.Damage) {
      this.damageDone += calculateEffectiveDamage(holyShock, BLESSING_OF_ANSHE_INCREASE);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            Effective Healing: {formatNumber(this.healingDone)} <br />
            Overhealing: {formatNumber(this.overhealing)} <br />
            Effective Damage: {formatNumber(this.damageDone)} <br />
            Total Procs: {this.procs} <br />
            Wasted Procs: {this.refreshes} <br />
          </>
        }
      >
        <TalentSpellText talent={TALENTS.BLESSING_OF_ANSHE_TALENT}>
          <div>
            <ItemHealingDone amount={this.healingDone} />
          </div>
          {this.damageDone > 0 && (
            <div>
              <ItemDamageDone amount={this.damageDone} />
            </div>
          )}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default BlessingOfAnshe;
