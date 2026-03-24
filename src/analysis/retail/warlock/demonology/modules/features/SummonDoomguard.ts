import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
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

  currentDemonicCoreStacks = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.SUMMON_DOOMGUARD_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CORE_BUFF),
      this.onCoreApply,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CORE_BUFF),
      this.onCoreStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CORE_BUFF),
      this.onCoreRemove,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEMONBOLT),
      this.onDemonboltCast,
    );
  }

  onCoreApply(_event: ApplyBuffEvent) {
    this.currentDemonicCoreStacks = 1;
  }

  onCoreStack(event: ApplyBuffStackEvent) {
    this.currentDemonicCoreStacks = event.stack;
  }

  onCoreRemove(_event: RemoveBuffEvent) {
    this.currentDemonicCoreStacks = 0;
  }

  onDemonboltCast(_event: CastEvent) {
    if (this.currentDemonicCoreStacks <= 0) return;

    this.currentDemonicCoreStacks -= 1;

    const actualReduction = this.deps.spellUsable.reduceCooldown(
      TALENTS.SUMMON_DOOMGUARD_TALENT.id,
      CDR_PER_CORE_MS,
    );

    this.effectiveCdrMs += actualReduction;
    this.wastedCdrMs += CDR_PER_CORE_MS - actualReduction;
  }
}

export default SummonDoomguard;
