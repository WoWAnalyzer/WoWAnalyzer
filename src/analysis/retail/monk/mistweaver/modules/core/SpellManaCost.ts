import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Module';
import { TALENTS_MONK } from 'common/TALENTS';
import { MANA_TEA_REDUCTION, MAX_CHIJI_STACKS, YULON_REDUCTION } from '../../constants';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import { CastEvent } from 'parser/core/Events';

class MWSpellManaCost extends SpellManaCost {
  currentBuffs: Set<number> = new Set();
  hasChiji: boolean = false;
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
    const chijiMultiplier =
      this.hasChiji && spellID === TALENTS_MONK.ENVELOPING_MIST_TALENT.id
        ? 1 -
          this.selectedCombatant.getBuffStacks(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.id) /
            MAX_CHIJI_STACKS
        : 1;
    const yulonMultiplier =
      !this.hasChiji &&
      spellID === TALENTS_MONK.ENVELOPING_MIST_TALENT.id &&
      this.selectedCombatant.hasBuff(SPELLS.INVOKE_YULON_BUFF.id)
        ? 1 - YULON_REDUCTION
        : 1;
    const manaTeaMultiplier = this.selectedCombatant.hasBuff(SPELLS.MANA_TEA_BUFF.id)
      ? 1 - MANA_TEA_REDUCTION
      : 1;
    return manaTeaMultiplier * chijiMultiplier * yulonMultiplier;
  }
}

export default MWSpellManaCost;
