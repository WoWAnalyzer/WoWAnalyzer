import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER_PET } from 'parser/core/EventFilter';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import UptimeIcon from 'interface/icons/Uptime';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class InescapableTorment extends Analyzer {
  damage = 0;
  time = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.INESCAPABLE_TORMENT_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(TALENTS.INESCAPABLE_TORMENT_TALENT_DAMAGE),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
    this.time += 0.5 * this.selectedCombatant.getTalentRank(TALENTS.INESCAPABLE_TORMENT_TALENT);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spellId={TALENTS.INESCAPABLE_TORMENT_TALENT.id}>
          <ItemDamageDone amount={this.damage} />
          <>
            <UptimeIcon /> {this.time}s <small>of mindbender extension</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default InescapableTorment;
