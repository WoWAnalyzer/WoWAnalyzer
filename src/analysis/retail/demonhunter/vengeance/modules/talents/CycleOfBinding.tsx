import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/demonhunter';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { ApplyDebuffEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import cycleOfBindingNormalizer from './cycleOfBindingImports';
import {
  getElysianDecreeSpell,
  getSigilOfChainsSpell,
  getSigilOfFlameSpell,
  getSigilOfMiserySpell,
  getSigilOfSilenceSpell,
} from 'analysis/retail/demonhunter/shared';
import Spell from 'common/SPELLS/Spell';
import React from 'react';
import CycleOfBindingStatistic from './CycleOfBindingStatistic';

const CDR = 3000;

const deps = {
  spellUsable: SpellUsable,
};
export default class CycleOfBinding extends Analyzer.withDependencies(deps) {
  private sigilSpells: Spell[];
  private sigilCdr: Record<number, number> = {};

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CYCLE_OF_BINDING_TALENT);

    const sigilOfFlameSpell = getSigilOfFlameSpell(this.selectedCombatant);
    const sigilOfMiserySpell = getSigilOfMiserySpell(this.selectedCombatant);
    const elysianDecreeSpell = getElysianDecreeSpell(this.selectedCombatant);
    const sigilOfSilenceSpell = getSigilOfSilenceSpell(this.selectedCombatant);
    const sigilOfChainsSpell = getSigilOfChainsSpell(this.selectedCombatant);
    this.sigilSpells = [
      sigilOfFlameSpell,
      sigilOfMiserySpell,
      elysianDecreeSpell,
      sigilOfSilenceSpell,
      sigilOfChainsSpell,
    ];

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(sigilOfFlameSpell), (event) =>
      this.onEvent(event, cycleOfBindingNormalizer.getTargetsAffectedBySigilOfFlame),
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(sigilOfMiserySpell), (event) =>
      this.onEvent(event, cycleOfBindingNormalizer.getTargetsAffectedBySigilOfMisery),
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(elysianDecreeSpell), (event) =>
      this.onEvent(event, cycleOfBindingNormalizer.getTargetsAffectedByElysianDecree),
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(sigilOfSilenceSpell), (event) =>
      this.onEvent(event, cycleOfBindingNormalizer.getTargetsAffectedBySigilOfSilence),
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(sigilOfChainsSpell), (event) =>
      this.onEvent(event, cycleOfBindingNormalizer.getTargetsAffectedBySigilOfChains),
    );
  }

  statistic(): React.ReactNode {
    return (
      <CycleOfBindingStatistic
        selectedCombatant={this.selectedCombatant}
        sigilCdr={this.sigilCdr}
      />
    );
  }

  private onEvent(
    event: CastEvent,
    getAffectedByFn: (event: CastEvent) => Array<ApplyDebuffEvent | DamageEvent>,
  ) {
    const affectedBy = getAffectedByFn(event);
    if (affectedBy.length === 0) {
      return;
    }
    this.reduceSigilCooldowns();
  }

  private reduceSigilCooldowns() {
    for (const sigil of this.sigilSpells) {
      const existingCdr = this.sigilCdr[sigil.id] ?? 0;
      const cdrForSigil = this.deps.spellUsable.reduceCooldown(sigil.id, CDR);
      this.sigilCdr[sigil.id] = existingCdr + cdrForSigil;
    }
  }
}
