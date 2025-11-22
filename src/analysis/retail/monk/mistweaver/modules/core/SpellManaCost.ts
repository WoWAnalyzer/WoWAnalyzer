import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Module';
import { TALENTS_MONK } from 'common/TALENTS';
import { CHIJI_REDUCTION, YULON_REDUCTION } from '../../constants';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import { CastEvent } from 'parser/core/Events';
import BaseCelestialAnalyzer from '../spells/BaseCelestialAnalyzer';

class MWSpellManaCost extends SpellManaCost {
  static dependencies = {
    ...SpellManaCost.dependencies,
    celestial: BaseCelestialAnalyzer,
  };
  celestial!: BaseCelestialAnalyzer;
  currentBuffs = new Set<number>();
  hasChiji = false;
  constructor(options: Options) {
    super(options);
    this.hasChiji = this.selectedCombatant.hasTalent(
      TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT,
    );
  }

  findAdjustedSpellResourceCost(spellID: number, originalCost: number) {
    return originalCost * this.getCurrentMultiplierForSpell(spellID);
  }

  getResourceCost(event: CastEvent): number {
    const cost = super.getResourceCost(event);
    return this.findAdjustedSpellResourceCost(event.ability.guid, cost);
  }

  getCurrentMultiplierForSpell(spellID: number): number {
    if (
      this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id) ||
      (spellID === SPELLS.VIVIFY.id &&
        this.selectedCombatant.hasBuff(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id))
    ) {
      return 0;
    }
    let celestialMultiplier = 1;
    if (spellID === TALENTS_MONK.ENVELOPING_MIST_TALENT.id && this.celestial.celestialActive) {
      celestialMultiplier -= this.hasChiji ? CHIJI_REDUCTION : YULON_REDUCTION;
    }
    return celestialMultiplier;
  }
}

export default MWSpellManaCost;
