import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';

// Each Demonic Core consumed by Demonbolt reduces Summon Doomguard's cooldown by 3 seconds
const CDR_PER_CORE_MS = 3000;

class SummonDoomguard extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  effectiveCdrMs = 0;
  wastedCdrMs = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.SUMMON_DOOMGUARD_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEMONBOLT),
      this.onDemonboltCast,
    );
  }

  onDemonboltCast(_event: CastEvent) {
    if (!this.selectedCombatant.getBuff(SPELLS.DEMONIC_CORE_BUFF.id)) return;

    const actualReduction = this.deps.spellUsable.reduceCooldown(
      TALENTS.SUMMON_DOOMGUARD_TALENT.id,
      CDR_PER_CORE_MS,
    );

    this.effectiveCdrMs += actualReduction;
    this.wastedCdrMs += CDR_PER_CORE_MS - actualReduction;
  }
}

export default SummonDoomguard;
