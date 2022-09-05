import { NESINGWARY_FOCUS_GAIN_MULTIPLIER } from 'analysis/retail/hunter';
import { SV_KILL_COMMAND_FOCUS_GAIN } from 'analysis/retail/hunter-survival/constants';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ResourceChangeEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

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

  resets = 0;

  additionalFocusFromNesingwary = 0;
  possibleAdditionalFocusFromNesingwary = 0;

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;
  protected globalCooldown!: GlobalCooldown;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FLANKERS_ADVANTAGE),
      this.onFlankersProc,
    );
    this.selectedCombatant.hasLegendary(SPELLS.NESINGWARYS_TRAPPING_APPARATUS_EFFECT) &&
      this.addEventListener(
        Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.KILL_COMMAND_CAST_SV),
        this.checkNesingwaryFocusGain,
      );
  }

  onFlankersProc(event: ApplyBuffEvent) {
    if (!this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND_CAST_SV.id)) {
      return;
    }
    this.resets += 1;
    const globalCooldown = this.globalCooldown.getGlobalCooldownDuration(event.ability.guid);
    const expectedCooldownDuration = this.abilities.getExpectedCooldownDuration(
      SPELLS.KILL_COMMAND_CAST_SV.id,
    );
    if (expectedCooldownDuration) {
      this.spellUsable.reduceCooldown(
        SPELLS.KILL_COMMAND_CAST_SV.id,
        expectedCooldownDuration - globalCooldown,
      );
    }
  }

  checkNesingwaryFocusGain(event: ResourceChangeEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.NESINGWARYS_TRAPPING_APPARATUS_ENERGIZE.id)) {
      this.additionalFocusFromNesingwary +=
        event.resourceChange * (1 - 1 / NESINGWARY_FOCUS_GAIN_MULTIPLIER) - event.waste;
      this.possibleAdditionalFocusFromNesingwary += SV_KILL_COMMAND_FOCUS_GAIN;
    }
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL(1)} size="flexible">
        <BoringSpellValueText spellId={SPELLS.KILL_COMMAND_CAST_SV.id}>
          <>
            {this.resets} <small>{this.resets === 1 ? 'reset' : 'resets'}</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default KillCommand;
