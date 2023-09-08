import SPELLS from 'common/SPELLS';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { ApplyBuffStackEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { TALENTS_MONK } from 'common/TALENTS';
import {
  CF_BUFF_PER_STACK,
  MANA_TEA_REDUCTION,
  MAX_CHIJI_STACKS,
  YULON_REDUCTION,
} from '../../constants';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';

const CF_SPELLS: Set<number> = new Set([SPELLS.VIVIFY.id, TALENTS_MONK.ENVELOPING_MIST_TALENT.id]);

class MWSpellManaCost extends SpellManaCost {
  currentBuffs: Set<number> = new Set();
  hasCF: boolean = false;
  hasChiji: boolean = false;
  cfStacks: number = 0;
  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.CLOUDED_FOCUS_BUFF),
      this.onCfApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.CLOUDED_FOCUS_BUFF),
      this.onCfRemove,
    );
    this.hasChiji = this.selectedCombatant.hasTalent(
      TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT,
    );
    this.hasCF = this.selectedCombatant.hasTalent(TALENTS_MONK.CLOUDED_FOCUS_TALENT);
  }

  onCfApply(event: ApplyBuffStackEvent) {
    this.cfStacks = event.stack - 1;
  }

  onCfRemove(event: RemoveBuffEvent) {
    this.cfStacks = 0;
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
    const cloudedFocusMultiplier =
      this.hasCF && CF_SPELLS.has(spellID) ? 1 - this.cfStacks * CF_BUFF_PER_STACK : 1;
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
        ? YULON_REDUCTION
        : 1;
    const manaTeaMultiplier = this.selectedCombatant.hasBuff(SPELLS.MANA_TEA_BUFF.id)
      ? MANA_TEA_REDUCTION
      : 1;
    return manaTeaMultiplier * cloudedFocusMultiplier * chijiMultiplier * yulonMultiplier;
  }
}

export default MWSpellManaCost;
