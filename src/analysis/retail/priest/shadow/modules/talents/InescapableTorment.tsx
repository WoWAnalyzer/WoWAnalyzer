import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER_PET } from 'parser/core/EventFilter';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import UptimeIcon from 'interface/icons/Uptime';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { INESCAPABLE_TORMENT_EXTENSION } from '../../constants';

class InescapableTorment extends Analyzer {
  damage = 0;
  time = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.INESCAPABLE_TORMENT_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.INESCAPABLE_TORMENT_TALENT_DAMAGE),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
    this.time +=
      INESCAPABLE_TORMENT_EXTENSION *
      this.selectedCombatant.getTalentRank(TALENTS.INESCAPABLE_TORMENT_TALENT);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.INESCAPABLE_TORMENT_TALENT}>
          <div>
            <ItemDamageDone amount={this.damage} />{' '}
          </div>
          <div>
            <UptimeIcon /> {this.time}s <small>of mindbender extension</small>{' '}
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default InescapableTorment;
