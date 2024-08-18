import { TALENTS_SHAMAN } from 'common/TALENTS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import Events, { ApplyBuffEvent, CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemManaGained from 'parser/ui/ItemManaGained';
import { formatNumber } from 'common/format';
import { SPIRITWALKERS_TIDAL_TOTEM_REDUCTION } from '../../constants';

class SpiritWalkersTidalTotem extends Analyzer {
  manaSaved = 0;
  swttCount = 0;
  swttStackConsumed = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.SPIRITWALKERS_TIDAL_TOTEM_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HEALING_SURGE),
      this.onHealingSurgeCast,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SPIRITWALKERS_TIDAL_TOTEM_BUFF),
      this.onApplyBuff,
    );
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.swttCount += 1;
  }

  onHealingSurgeCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SPIRITWALKERS_TIDAL_TOTEM_BUFF.id)) {
      return;
    }

    if (!event.resourceCost) {
      return;
    }

    this.swttStackConsumed += 1;

    if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
      return;
    }

    const manaSaved =
      event.resourceCost[RESOURCE_TYPES.MANA.id] * SPIRITWALKERS_TIDAL_TOTEM_REDUCTION;

    this.manaSaved += manaSaved;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <TalentSpellText talent={TALENTS_SHAMAN.SPIRITWALKERS_TIDAL_TOTEM_TALENT}>
          <div>
            <ItemManaGained amount={this.manaSaved} useAbbrev customLabel="mana" />
          </div>
          <div>
            {`${formatNumber(this.swttStackConsumed)} / ${formatNumber(this.swttCount * 3)}`}{' '}
            <small>stacks consumed</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SpiritWalkersTidalTotem;
