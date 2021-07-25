import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, RemoveBuffEvent } from 'parser/core/Events';
import Haste from 'parser/shared/modules/Haste';

const RAVENOUS_FRENZY_HASTE_PER_STACK = 0.02;

const DEBUG = true;

/**
 * **Sinful Hysteria**
 * Runecarving Legendary - Venthyr
 *
 * Each time Ravenous Frenzy is applied its duration is increased by 0.2 sec.
 * Additionally, Ravenous Frenzy lingers and will not overcome you for 5 sec after it ends.
 */
class SinfulHysteria extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

  protected haste!: Haste;

  /*
   * No user facing display yet - this is just concerned with handling for the dynamic
   * haste buff procced, which cannot be handled by the Haste module because the strength of the buff
   * depends on the stacks of another buff.
   */

  lastHighestStack: number = 0;
  lastLingerHaste: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.SINFUL_HYSTERIA.bonusID);

    this.lastLingerHaste = 0;

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.RAVENOUS_FRENZY),
      this.onFrenzyBuffStack,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SINFUL_HYSTERIA_BUFF),
      this.onLingerBuffApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SINFUL_HYSTERIA_BUFF),
      this.onLingerBuffRemove,
    );
  }

  onFrenzyBuffStack(event: ApplyBuffStackEvent) {
    this.lastHighestStack = event.stack;
  }

  onLingerBuffApply(event: ApplyBuffEvent) {
    this.lastLingerHaste = this.lastHighestStack * RAVENOUS_FRENZY_HASTE_PER_STACK;
    this.haste._applyHasteGain(event, this.lastLingerHaste);
    DEBUG &&
      console.log(
        `Applied custom haste buff @ ${this.owner.formatTimestamp(
          event.timestamp,
        )} from Sinful Hysteria: ${this.lastLingerHaste}`,
      );
  }

  onLingerBuffRemove(event: RemoveBuffEvent) {
    this.haste._applyHasteLoss(event, this.lastLingerHaste);
    DEBUG &&
      console.log(
        `Removed custom haste buff @ ${this.owner.formatTimestamp(
          event.timestamp,
        )} from Sinful Hysteria: ${this.lastLingerHaste}`,
      );
  }
}

export default SinfulHysteria;
