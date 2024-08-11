import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/demonhunter';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { ApplyDebuffEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import {
  getTargetsAffectedByElysianDecree,
  getTargetsAffectedBySigilOfChains,
  getTargetsAffectedBySigilOfFlame,
  getTargetsAffectedBySigilOfMisery,
  getTargetsAffectedBySigilOfSilence,
} from 'analysis/retail/demonhunter/vengeance/normalizers/CycleOfBindingNormalizer';
import {
  getSigilOfSpiteSpell,
  getSigilOfChainsSpell,
  getSigilOfFlameSpell,
  getSigilOfMiserySpell,
  getSigilOfSilenceSpell,
} from 'analysis/retail/demonhunter/shared';
import Spell from 'common/SPELLS/Spell';
import React from 'react';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import CooldownIcon from 'interface/icons/Cooldown';
import { formatDurationMillisMinSec } from 'common/format';
import SpellLink from 'interface/SpellLink';
import Abilities from 'analysis/retail/demonhunter/vengeance/modules/Abilities';

const CDR = 3000;

interface SigilSpellCdr {
  spellId: number;
  effectiveCdr: number;
  totalCdr: number;
}

const deps = {
  abilities: Abilities,
  spellUsable: SpellUsable,
};
export default class CycleOfBinding extends Analyzer.withDependencies(deps) {
  private readonly sigilSpells: Spell[];
  private readonly sigilCdr: Record<number, SigilSpellCdr> = {};

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CYCLE_OF_BINDING_TALENT);

    const sigilOfFlameSpell = getSigilOfFlameSpell(this.selectedCombatant);
    const sigilOfMiserySpell = getSigilOfMiserySpell(this.selectedCombatant);
    const elysianDecreeSpell = getSigilOfSpiteSpell(this.selectedCombatant);
    const sigilOfSilenceSpell = getSigilOfSilenceSpell(this.selectedCombatant);
    const sigilOfChainsSpell = getSigilOfChainsSpell(this.selectedCombatant);
    this.sigilSpells = [
      sigilOfFlameSpell,
      sigilOfMiserySpell,
      elysianDecreeSpell,
      sigilOfSilenceSpell,
      sigilOfChainsSpell,
    ].filter((sigil) => this.deps.abilities.getAbility(sigil.id)?.enabled);
    for (const sigil of this.sigilSpells) {
      this.sigilCdr[sigil.id] = {
        effectiveCdr: 0,
        spellId: sigil.id,
        totalCdr: 0,
      };
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(sigilOfFlameSpell), (event) =>
      this.onCast(event, getTargetsAffectedBySigilOfFlame),
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(sigilOfMiserySpell), (event) =>
      this.onCast(event, getTargetsAffectedBySigilOfMisery),
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(elysianDecreeSpell), (event) =>
      this.onCast(event, getTargetsAffectedByElysianDecree),
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(sigilOfSilenceSpell), (event) =>
      this.onCast(event, getTargetsAffectedBySigilOfSilence),
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(sigilOfChainsSpell), (event) =>
      this.onCast(event, getTargetsAffectedBySigilOfChains),
    );
  }

  statistic(): React.ReactNode {
    const totalCDR = Object.values(this.sigilCdr).reduce((acc, val) => acc + val.totalCdr, 0);

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Sigil</th>
                <th>Effective CDR</th>
                <th>Wasted CDR</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(this.sigilCdr).map((cdr) => (
                <tr key={cdr.spellId}>
                  <th>
                    <SpellLink spell={cdr.spellId} />
                  </th>
                  <td>{formatDurationMillisMinSec(cdr.effectiveCdr)}</td>
                  <td>{formatDurationMillisMinSec(cdr.totalCdr - cdr.effectiveCdr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <TalentSpellText talent={TALENTS.CYCLE_OF_BINDING_TALENT}>
          <CooldownIcon /> {formatDurationMillisMinSec(totalCDR)} <small>Sigil cooldown CDR</small>
        </TalentSpellText>
      </Statistic>
    );
  }

  private onCast(
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
      const existingCdr = this.sigilCdr[sigil.id] ?? {
        spellId: sigil.id,
        effectiveCdr: 0,
        totalCdr: 0,
      };
      const effectiveCdr = this.deps.spellUsable.reduceCooldown(sigil.id, CDR);
      this.sigilCdr[sigil.id] = {
        ...existingCdr,
        effectiveCdr: existingCdr.effectiveCdr + effectiveCdr,
        totalCdr: existingCdr.totalCdr + CDR,
      };
    }
  }
}
