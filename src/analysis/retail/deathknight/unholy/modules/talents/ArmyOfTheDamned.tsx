import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import CooldownIcon from 'interface/icons/Cooldown';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, FightEndEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const AOTD_ARMY_REDUCTION_MS = 5000;

class ArmyOfTheDamned extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  totalArmyReductionMs: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.ARMY_OF_THE_DAMNED_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.DEATH_COIL, SPELLS.EPIDEMIC]),
      this.onCdrCast,
    );
  }

  onCdrCast(event: CastEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.ARMY_OF_THE_DEAD.id)) {
      this.spellUsable.reduceCooldown(
        SPELLS.ARMY_OF_THE_DEAD.id,
        AOTD_ARMY_REDUCTION_MS,
        event.timestamp,
      );
      this.totalArmyReductionMs += AOTD_ARMY_REDUCTION_MS;
    }
  }

  endCooldowns(event: FightEndEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.ARMY_OF_THE_DEAD.id)) {
      this.spellUsable.endCooldown(SPELLS.ARMY_OF_THE_DEAD.id);
    }
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spellId={TALENTS.ARMY_OF_THE_DAMNED_TALENT.id}>
          <>
            <CooldownIcon /> {this.totalArmyReductionMs / 1000}s{' '}
            <small> of Army of the Dead CDR</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArmyOfTheDamned;
