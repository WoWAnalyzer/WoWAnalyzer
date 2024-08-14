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

class NaturesSwiftness extends Analyzer {
  static AFFECTED_SPELLS = [
    // Healing surge is affected but is handled in a separate event handler
    // due to SWTT reducing specifically this spell's mana cost
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
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HEALING_SURGE),
      this.onHealingSurgeCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.NATURES_SWIFTNESS_BUFF),
      this.onApplyBuff,
    );
  }

  triggerConditions() {
    let condition = true;

    if (!this.selectedCombatant.hasBuff(SPELLS.NATURES_SWIFTNESS_BUFF.id)) {
      condition = false;
    }

    if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
      condition = false;
    }

    return condition;
  }

  onHealingSurgeCast(event: CastEvent) {
    if (!this.triggerConditions) {
      return;
    }

    if (!event.resourceCost) {
      return;
    }

    let manaSaved = event.resourceCost[RESOURCE_TYPES.MANA.id];

    if (this.selectedCombatant.hasBuff(SPELLS.SPIRITWALKERS_TIDAL_TOTEM_BUFF.id)) {
      // NS only saves the rest of the mana cost after SWTT mana reduction
      manaSaved =
        event.resourceCost[RESOURCE_TYPES.MANA.id] * (1 - SPIRITWALKERS_TIDAL_TOTEM_REDUCTION);
    }

    this.manaSaved += manaSaved;
  }

  onRelevantCast(event: CastEvent) {
    if (!this.triggerConditions) {
      return;
    }

    if (!event.resourceCost) {
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
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<>Total mana saved: {this.manaSaved}</>}
      >
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
