import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/demonhunter';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { CastEvent } from 'parser/core/Events';
import {
  getTargetsAffectedByElysianDecree,
  getTargetsAffectedBySigilOfChains,
  getTargetsAffectedBySigilOfFlame,
  getTargetsAffectedBySigilOfMisery,
  getTargetsAffectedBySigilOfSilence,
} from 'analysis/retail/demonhunter/vengeance/normalizers/CycleOfBindingNormalizer';
import {
  getElysianDecreeSpell,
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
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import { isTalent } from 'common/TALENTS/types';
import SpellLink from 'interface/SpellLink';

const CDR = 3000;

type SigilSpellIdCdrEntry = [number, number];
type SigilCdrEntry = [Spell, number];

const isSigilCdrEntry = (entry: [Spell | undefined, number]): entry is SigilCdrEntry =>
  Boolean(entry[0]);
const toSigilSpellIdCdrEntry = ([spellId, cdr]: [string, number]): SigilSpellIdCdrEntry => [
  Number(spellId),
  cdr,
];
const toSigilCdrEntry = ([spellId, cdr]: SigilSpellIdCdrEntry): [Spell | undefined, number] => [
  maybeGetTalentOrSpell(spellId),
  cdr,
];

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

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(sigilOfFlameSpell),
      this.onSigilOfFlameCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(sigilOfMiserySpell),
      this.onSigilOfMiseryCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(elysianDecreeSpell),
      this.onElysianDecreeCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(sigilOfSilenceSpell),
      this.onSigilOfSilenceCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(sigilOfChainsSpell),
      this.onSigilOfChainsCast,
    );
  }

  statistic(): React.ReactNode {
    const totalCDR = Object.values(this.sigilCdr).reduce((acc, val) => acc + val, 0);
    const sigils = Object.entries(this.sigilCdr)
      .map(toSigilSpellIdCdrEntry)
      .map(toSigilCdrEntry)
      .filter(isSigilCdrEntry)
      .filter(([sigil]) => !isTalent(sigil) || this.selectedCombatant.hasTalent(sigil));

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Sigil</th>
                <th>CDR</th>
              </tr>
            </thead>
            <tbody>
              {sigils.map(([sigil, cdr]) => (
                <tr key={sigil.id}>
                  <th>
                    <SpellLink spell={sigil} />
                  </th>
                  <td>{formatDurationMillisMinSec(cdr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <TalentSpellText talent={TALENTS.CYCLE_OF_BINDING_TALENT}>
          <CooldownIcon /> {formatDurationMillisMinSec(totalCDR)}{' '}
          <small>of Sigil cooldown CDR</small>
        </TalentSpellText>
      </Statistic>
    );
  }

  private onSigilOfFlameCast(event: CastEvent) {
    const affectedBy = getTargetsAffectedBySigilOfFlame(event);
    if (affectedBy.length === 0) {
      return;
    }
    this.reduceSigilCooldowns();
  }

  private onSigilOfMiseryCast(event: CastEvent) {
    const affectedBy = getTargetsAffectedBySigilOfMisery(event);
    if (affectedBy.length === 0) {
      return;
    }
    this.reduceSigilCooldowns();
  }

  private onElysianDecreeCast(event: CastEvent) {
    const affectedBy = getTargetsAffectedByElysianDecree(event);
    if (affectedBy.length === 0) {
      return;
    }
    this.reduceSigilCooldowns();
  }

  private onSigilOfSilenceCast(event: CastEvent) {
    const affectedBy = getTargetsAffectedBySigilOfSilence(event);
    if (affectedBy.length === 0) {
      return;
    }
    this.reduceSigilCooldowns();
  }

  private onSigilOfChainsCast(event: CastEvent) {
    const affectedBy = getTargetsAffectedBySigilOfChains(event);
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
