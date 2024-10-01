import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { SpellLink, TooltipElement } from 'interface';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, EventType, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import {
  getBlossomCast,
  getDreamBreathHealing,
  getReversionHealing,
  getEchoAplication,
  getHealEvents,
} from '../../normalizers/EventLinking/helpers';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { TITANS_GIFT_INC } from '../../normalizers/EventLinking/constants';
import { formatPercentage } from 'common/format';
import { isCastFromEB } from 'analysis/retail/evoker/shared/modules/normalizers/EssenceBurstCastLinkNormalizer';

/**
 * CURRENTLY DISABLED
 * Lifebind healing is not implemented. The amount transfered by lifebind gets increased with the strength of the echo used to apply it so Titans Gift echoes do stronger lifebind,
 * this is severly underreporting the strength of the talent for echo builds that lean heavily into lifebind at the moment.
 * There also used to be a bug where Emerald Blossoms caused by Field of Dreams with Essence Burst active would benefit from Titans Gift, the bug was reported as fixed but needs
 * testing. Emerald Blossoms released from a Stasis with Essence Burst active should also benefit from the talent but this isn't implemented either.
 */

class TitansGift extends Analyzer {
  //Blossom
  healingAddedToBlossoms: number = 0;
  totalBlossomsCasted: number = 0;
  buffedBlossoms: number = 0;
  //Echo
  healingAddedToEcho: number = 0;
  totalEchoesCasted: number = 0;
  buffedEchoes: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.TITANS_GIFT_TALENT);

    //Count total casts
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EMERALD_BLOSSOM_CAST),
      this.onBlossomCasts,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.ECHO_TALENT),
      this.onEchoCasts,
    );

    //Track blossom heals
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EMERALD_BLOSSOM),
      this.emeraldBlossomHeal,
    );

    //Track echo heals
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.DREAM_BREATH_ECHO,
          SPELLS.EMERALD_BLOSSOM_ECHO,
          SPELLS.LIVING_FLAME_HEAL,
          SPELLS.SPIRITBLOOM_SPLIT,
          SPELLS.SPIRITBLOOM_FONT,
          SPELLS.SPIRITBLOOM,
          SPELLS.VERDANT_EMBRACE_HEAL,
        ]),
      this.echoHeal,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.REVERSION_ECHO, SPELLS.DREAM_BREATH_ECHO]),
      this.echoHeal,
    );

    this.addEventListener(
      Events.refreshbuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.REVERSION_ECHO, SPELLS.DREAM_BREATH_ECHO]),
      this.echoHeal,
    );
  }

  //Count total casts
  onBlossomCasts() {
    this.totalBlossomsCasted += 1;
  }

  onEchoCasts() {
    this.totalEchoesCasted += 1;
  }

  //Track blossom healing added
  emeraldBlossomHeal(event: HealEvent) {
    const blossomCast = getBlossomCast(event);
    if (blossomCast && isCastFromEB(blossomCast)) {
      this.buffedBlossoms += 1;
      const blossomHeals = getHealEvents(event);
      for (const blossomHeal of blossomHeals) {
        this.healingAddedToBlossoms += calculateEffectiveHealing(blossomHeal, TITANS_GIFT_INC);
      }
    }
  }

  //Track echo healing added
  echoHeal(event: HealEvent | ApplyBuffEvent | RefreshBuffEvent) {
    const echoApplication = getEchoAplication(event);
    if (echoApplication && isCastFromEB(echoApplication)) {
      this.buffedEchoes += 1;
      if (event.type === EventType.Heal) {
        this.healingAddedToEcho += calculateEffectiveHealing(event, TITANS_GIFT_INC);
      } else {
        if (event.ability.name === TALENTS_EVOKER.DREAM_BREATH_TALENT.name) {
          const dbHealing = getDreamBreathHealing(event);
          this.healingAddedToEcho += dbHealing.reduce(
            (prev, cur) => calculateEffectiveHealing(cur, TITANS_GIFT_INC) + prev,
            0,
          );
        } else if (event.ability.name === TALENTS_EVOKER.REVERSION_TALENT.name) {
          const revHealing = getReversionHealing(event);
          this.healingAddedToEcho += revHealing.reduce(
            (prev, cur) => calculateEffectiveHealing(cur, TITANS_GIFT_INC) + prev,
            0,
          );
        }
      }
    }
  }

  statistic() {
    const percentBuffedBlossoms =
      this.totalBlossomsCasted !== 0 ? this.buffedBlossoms / this.totalBlossomsCasted : 0;
    const percentBuffedEchoes =
      this.totalEchoesCasted !== 0 ? this.buffedEchoes / this.totalEchoesCasted : 0;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS_EVOKER.TITANS_GIFT_TALENT} />
          </label>
          <div className="value">
            <div>
              <small>
                <SpellLink spell={SPELLS.EMERALD_BLOSSOM} />
              </small>
              <br />
              <TooltipElement
                content={
                  <>
                    {this.buffedBlossoms} casts buffed ({formatPercentage(percentBuffedBlossoms)}%)
                  </>
                }
              >
                <ItemHealingDone amount={this.healingAddedToBlossoms} />
              </TooltipElement>
            </div>
            <div>
              <small>
                <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} />
              </small>
              <br />
              <TooltipElement
                content={
                  <>
                    {this.buffedEchoes} casts buffed ({formatPercentage(percentBuffedEchoes)}%)
                  </>
                }
              >
                <ItemHealingDone amount={this.healingAddedToEcho} />
              </TooltipElement>
            </div>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default TitansGift;
