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

class NaturesSwiftness extends Analyzer {
  static AFFECTED_SPELLS = [
    SPELLS.HEALING_SURGE,
    SPELLS.LIGHTNING_BOLT,
    TALENTS_SHAMAN.CHAIN_HEAL_TALENT,
    TALENTS_SHAMAN.HEALING_RAIN_TALENT,
    TALENTS_SHAMAN.HEALING_WAVE_TALENT,
    TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT,
    TALENTS_SHAMAN.WELLSPRING_TALENT,
    TALENTS_SHAMAN.DOWNPOUR_TALENT,
  ];

  manaSaved = 0;
  castCount = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.NATURES_SWIFTNESS_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(NaturesSwiftness.AFFECTED_SPELLS),
      this.onRelevantCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.NATURES_SWIFTNESS_BUFF),
      this.onApplyBuff,
    );
  }

  onRelevantCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.NATURES_SWIFTNESS_BUFF.id)) {
      return;
    }

    if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
      return;
    }

    if (!event.resourceCost) {
      return;
    }

    if (
      this.selectedCombatant.hasBuff(SPELLS.SPIRITWALKERS_TIDAL_TOTEM_BUFF.id) &&
      event.ability.guid === SPELLS.HEALING_SURGE.id
    ) {
      // if both SWTT and NS are present when a Healing Surge is cast, only SWTT is consumed base on my testing
      return;
    }

    const baseCost = event.resourceCost[RESOURCE_TYPES.MANA.id];

    // Nature's Switness removes the mana cost of the spell entirely
    this.manaSaved += baseCost;
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.castCount += 1;
  }

  get avgManaSaved() {
    return this.manaSaved / this.castCount;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <TalentSpellText talent={TALENTS_SHAMAN.NATURES_SWIFTNESS_TALENT}>
          <div>
            <ItemManaGained amount={this.manaSaved} useAbbrev customLabel="mana" />
          </div>
          <div>
            {formatNumber(this.avgManaSaved)} <small>mana saved per cast</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default NaturesSwiftness;
