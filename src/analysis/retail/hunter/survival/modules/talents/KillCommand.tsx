import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/hunter';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

/**
 * Give the command to kill, causing your pet to savagely deal [Attack power * 0.6 * (1 + Versatility)] Physical damage to the enemy.
 * Has a 25% chance to immediately reset its cooldown.
 * Generates 15 Focus
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/dHcVrvbMX39xNAC8#fight=3&type=auras&source=66&ability=259285
 */
class KillCommand extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
    globalCooldown: GlobalCooldown,
  };

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;
  protected globalCooldown!: GlobalCooldown;

  private resets: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.KILL_COMMAND_SURVIVAL_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FLANKERS_ADVANTAGE),
      this.onFlankersProc,
    );
  }

  onFlankersProc(event: ApplyBuffEvent) {
    if (!this.spellUsable.isOnCooldown(TALENTS.KILL_COMMAND_SURVIVAL_TALENT.id)) {
      return;
    }
    this.resets += 1;
    const globalCooldown = this.globalCooldown.getGlobalCooldownDuration(event.ability.guid);
    const expectedCooldownDuration = this.abilities.getExpectedCooldownDuration(
      TALENTS.KILL_COMMAND_SURVIVAL_TALENT.id,
    );
    if (expectedCooldownDuration) {
      this.spellUsable.reduceCooldown(
        TALENTS.KILL_COMMAND_SURVIVAL_TALENT.id,
        expectedCooldownDuration - globalCooldown,
      );
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.KILL_COMMAND_SURVIVAL_TALENT}>
          <>
            {this.resets} <small>{this.resets === 1 ? 'reset' : 'resets'}</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default KillCommand;
