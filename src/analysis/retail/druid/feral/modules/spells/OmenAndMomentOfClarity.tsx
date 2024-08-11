import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import {
  BRUTAL_SLASH_ENERGY,
  INCARN_ENERGY_MULT,
  SHRED_ENERGY,
  SWIPE_ENERGY,
  THRASH_ENERGY,
} from 'analysis/retail/druid/feral/constants';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, CastEvent } from 'parser/core/Events';
import getResourceSpent from 'parser/core/getResourceSpent';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { Icon, SpellLink } from 'interface';

const CC_SPELL_TO_BASE_COST = {
  [SPELLS.SHRED.id]: SHRED_ENERGY,
  [SPELLS.THRASH_FERAL.id]: THRASH_ENERGY,
  [SPELLS.SWIPE_CAT.id]: SWIPE_ENERGY,
  [TALENTS_DRUID.BRUTAL_SLASH_TALENT.id]: BRUTAL_SLASH_ENERGY,
};

/**
 * **Omen of Clarity**
 * Spec Talent
 *
 * Your auto attacks have a chance to cause a Clearcasting state, making your next Shred, Thrash,
 * or Swipe (Brutal Slash) cost no energy.
 *
 * ----------------------------------------------------------------------------
 *
 * **Moment of Clarity**
 * Spec Talent
 *
 * Omen of Clarity now triggers 30% more often, can accumulate up to 2 charges, and increases the
 * damage of your next Shred, Thrash, or Swipe (Brutal Slash) by 15%.
 */
export default class OmenAndMomentOfClarity extends Analyzer {
  // TODO also track the MoC damage boost (it will be very small)
  hasMoc: boolean;

  totalEnergy: number = 0;
  procsUsed: number = 0;
  procsGained: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.OMEN_OF_CLARITY_FERAL_TALENT);
    this.hasMoc = this.selectedCombatant.hasTalent(TALENTS_DRUID.MOMENT_OF_CLARITY_TALENT);

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.SHRED,
          SPELLS.THRASH_FERAL,
          SPELLS.SWIPE_CAT,
          TALENTS_DRUID.BRUTAL_SLASH_TALENT,
        ]),
      this.onClearcastUse,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_FERAL),
      this.onClearcastGain,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_FERAL),
      this.onClearcastGain,
    );
  }

  onClearcastUse(event: CastEvent) {
    if (getResourceSpent(event, RESOURCE_TYPES.ENERGY) === 0) {
      // only reason these can be free is Clearcast
      this.procsUsed += 1;
      const incarnMult = this.selectedCombatant.hasBuff(
        TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT.id,
      )
        ? INCARN_ENERGY_MULT
        : 1;
      const baseCost = CC_SPELL_TO_BASE_COST[event.ability.guid];
      if (baseCost) {
        this.totalEnergy += baseCost * incarnMult;
      } else {
        // TODO log issue with map
      }
    }
  }

  onClearcastGain(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    this.procsGained += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {this.hasMoc &&
              'This is the combined energy saved from Omen of Clarity and Mark of Clarity.'}
            <ul>
              <li>
                Gained Procs per Minute:{' '}
                <strong>{this.owner.getPerMinute(this.procsGained).toFixed(1)}</strong>
              </li>
              <li>
                Used Procs per Minute:{' '}
                <strong>{this.owner.getPerMinute(this.procsUsed).toFixed(1)}</strong>
              </li>
              <li>
                Avg. Energy Saved per Used Proc:{' '}
                <strong>{(this.totalEnergy / this.procsUsed || 0).toFixed(1)}</strong>
              </li>
            </ul>
          </>
        }
      >
        <div className="pad boring-text">
          <label>
            <SpellLink spell={TALENTS_DRUID.OMEN_OF_CLARITY_FERAL_TALENT} />{' '}
            {this.hasMoc && (
              <>
                {' '}
                / <SpellLink spell={TALENTS_DRUID.MOMENT_OF_CLARITY_TALENT} />
              </>
            )}
          </label>
          <div className="value">
            <Icon icon="spell_shadow_shadowworddominate" />{' '}
            {this.owner.getPerMinute(this.totalEnergy).toFixed(1)}
            <small> energy per minute</small>
          </div>
        </div>
      </Statistic>
    );
  }
}
