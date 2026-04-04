import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { SpellLink, TooltipElement } from 'interface';
import SPELLS from 'common/SPELLS';
import Events, {
  ApplyBuffEvent,
  EventType,
  HealEvent,
  CastEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import {
  getBlossomCast,
  getDreamBreathHealing,
  getReversionHealing,
  getEchoAplication,
} from '../../normalizers/EventLinking/helpers';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { TITANS_GIFT_INC } from '../../normalizers/EventLinking/constants';
import { formatPercentage } from 'common/format';
import { isCastFromEB } from 'analysis/retail/evoker/shared/modules/normalizers/EssenceBurstCastLinkNormalizer';

class TitansGift extends Analyzer {
  //Blossom
  healingAddedToBlossoms = 0;
  totalBlossomsCasted = 0;
  buffedBlossoms = 0;
  lastCast = 0;
  //Echo
  healingAddedToEcho = 0;
  totalEchoesCasted = 0;
  buffedEchoes = 0;

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
        .spell([SPELLS.DREAM_BREATH_ECHO, SPELLS.LIVING_FLAME_HEAL, SPELLS.VERDANT_EMBRACE_HEAL]),
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
  onBlossomCasts(event: CastEvent) {
    this.totalBlossomsCasted += 1;
  }

  onEchoCasts() {
    this.totalEchoesCasted += 1;
  }

  //Track blossom healing added
  emeraldBlossomHeal(event: HealEvent) {
    const blossomCast = getBlossomCast(event);
    if (blossomCast && isCastFromEB(blossomCast)) {
      if (this.lastCast != blossomCast.timestamp) {
        this.buffedBlossoms += 1;
        this.lastCast = blossomCast.timestamp;
      }
      this.healingAddedToBlossoms += calculateEffectiveHealing(event, TITANS_GIFT_INC);
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
    //const percentBuffedEchoes = this.totalEchoesCasted !== 0 ? this.buffedEchoes / this.totalEchoesCasted : 0;
    // Titans Gift for Blossom is way more important right now to match guides, Echo attribution needs more work still so im leaving it for later
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
              <div>
                <TooltipElement
                  content={
                    <>
                      {this.buffedBlossoms} casts buffed ({formatPercentage(percentBuffedBlossoms)}
                      %)
                    </>
                  }
                >
                  <ItemHealingDone amount={this.healingAddedToBlossoms} />
                </TooltipElement>
              </div>
            </div>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default TitansGift;
