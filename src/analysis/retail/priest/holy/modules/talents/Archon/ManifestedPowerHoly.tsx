import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellLink from 'interface/SpellLink';
import { formatNumber } from 'common/format';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

import { TALENTS_PRIEST } from 'common/TALENTS';
import PRIEST_TALENTS from 'common/TALENTS/priest';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import {
  buffedBySurgeOfLight,
  getHealFromSurge,
  isSurgeOfLightFromHalo,
} from '../../../normalizers/CastLinkNormalizer';
/**
 * **Perfected Form**
 * Your healing done is increased by 10% while Apotheosis is active and for 20 sec after you cast Holy Word: Salvation.
 */

//https://www.warcraftlogs.com/reports/WT19GKp2VHqLarbD#fight=19``&type=auras&source=122
class ManifestedPowerHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  /**
   * Start:
   * These values can all be called directly and don't need a pass function
   * also check the call functions in case math needs to be done to transform
   * the results
   */
  surgeOfLightProcsSpent = 0;
  surgeOfLightProcsGainedTotal = 0;
  surgeOfLightProcsOverwritten = 0;
  surgeOfLightProcsOverwrittenByHalo = 0;
  surgeOfLightProcsGainedFromHalo = 0;

  constructor(options: Options) {
    super(options);

    //if the capstone is active, then all the analyzed hero talents will be active too
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.DIVINE_HALO_TALENT);

    //tracks spending of Surge of Light
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onSurgeOfLightHeal,
    );

    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onSurgeOfLightHeal,
    );

    //tracks gains of Surge of light, not just from manifested power
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onApplySurgeOfLight,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onApplySurgeOfLight,
    );
    //tracks wasted Surge of Lights
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onRefreshSurgeOfLight,
    );
  }

  onSurgeOfLightHeal(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    // linked heal event exists from surge of light consumption
    const healEvent = getHealFromSurge(event);

    if (healEvent) {
      if (buffedBySurgeOfLight(event)) {
        this.surgeOfLightProcsSpent += 1;
      }
    }
  }

  onRefreshSurgeOfLight(event: RefreshBuffEvent) {
    // surge of light used successfully (spending on 2 stacks counts as a refresh)
    if (1 === this.selectedCombatant.getBuffStacks(SPELLS.SURGE_OF_LIGHT_BUFF.id)) {
      return;
    }
    if (isSurgeOfLightFromHalo(event)) {
      this.surgeOfLightProcsOverwrittenByHalo += 1;
    } else {
      this.surgeOfLightProcsOverwritten += 1;
    }
  }

  onApplySurgeOfLight(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    // linked heal event exists
    if (isSurgeOfLightFromHalo(event)) {
      this.surgeOfLightProcsGainedFromHalo += 1;
    }
    this.surgeOfLightProcsGainedTotal += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <SpellLink spell={PRIEST_TALENTS.SURGE_OF_LIGHT_TALENT} /> procs and usage from ALL
            sources:
            <ul>
              <li>
                {formatNumber(this.surgeOfLightProcsGainedTotal)}
                {' gained total'}
              </li>
              <li>
                {formatNumber(this.surgeOfLightProcsSpent)}
                {' spent total'}
              </li>
              <li>
                {formatNumber(this.surgeOfLightProcsOverwritten)}
                {' overwritten'}
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.MANIFESTED_POWER_TALENT}>
          <div>
            {this.surgeOfLightProcsGainedFromHalo}
            <small> procs gained from Halo</small> <br />
            {this.surgeOfLightProcsOverwrittenByHalo}
            <small> overwritten procs from Halo</small> <br />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ManifestedPowerHoly;
