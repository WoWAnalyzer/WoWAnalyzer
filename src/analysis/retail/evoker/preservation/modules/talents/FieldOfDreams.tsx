import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { formatNumber } from 'common/format';
import { SpellLink } from 'interface';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { isFromFieldOfDreams } from '../../normalizers/CastLinkNormalizer';

class FieldOfDreams extends Analyzer {
  totalHealing: number = 0;
  totalOverhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EMERALD_BLOSSOM),
      this.onEbHeal,
    );
  }

  onEbHeal(event: HealEvent) {
    if (isFromFieldOfDreams(event)) {
      this.totalHealing += (event.amount || 0) + (event.absorbed || 0);
      this.totalOverhealing += event.overheal || 0;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <SpellLink id={TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT.id} /> provided the following:
            <ul>
              <li>{formatNumber(this.totalHealing)} effective healing</li>
              <li>{formatNumber(this.totalOverhealing)} overheal</li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FieldOfDreams;
