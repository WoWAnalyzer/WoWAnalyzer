import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, EventType, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import {
  getBlossomCast,
  getDreamBreathHealing,
  getReversionHealing,
  getEchoAplication,
  getHealEvents,
  isCastFromBurst,
} from '../../normalizers/EventLinking/helpers';

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
      this.countBlossomCasts,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.ECHO_TALENT),
      this.countEchoCasts,
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
  countBlossomCasts() {
    this.totalBlossomsCasted += 1;
  }

  countEchoCasts() {
    this.totalEchoesCasted += 1;
  }

  //Track blossom healing added
  emeraldBlossomHeal(event: HealEvent) {
    const BlossomCast = getBlossomCast(event);
    if (BlossomCast && isCastFromBurst(BlossomCast)) {
      this.buffedBlossoms += 1;
      const BlossomHeals = getHealEvents(event);
      for (const BlossomHeal of BlossomHeals) {
        this.healingAddedToBlossoms += (BlossomHeal.amount + (BlossomHeal.absorbed ?? 0)) / 5;
      }
    }
  }

  //Track echo healing added
  echoHeal(event: HealEvent | ApplyBuffEvent | RefreshBuffEvent) {
    const EchoApplication = getEchoAplication(event);
    if (EchoApplication && isCastFromBurst(EchoApplication)) {
      this.buffedEchoes += 1;
      if (event.type === EventType.Heal) {
        this.healingAddedToEcho += (event.amount + (event.absorbed ?? 0)) / 5;
      } else {
        if (event.ability.name === TALENTS_EVOKER.DREAM_BREATH_TALENT.name) {
          const DbHealing = getDreamBreathHealing(event);
          for (const DbHeal of DbHealing) {
            this.healingAddedToEcho += (DbHeal.amount + (DbHeal.absorbed ?? 0)) / 5;
          }
        } else if (event.ability.name === TALENTS_EVOKER.REVERSION_TALENT.name) {
          const RevHealing = getReversionHealing(event);
          for (const RevHeal of RevHealing) {
            this.healingAddedToEcho += (RevHeal.amount + (RevHeal.absorbed ?? 0)) / 5;
          }
        }
      }
    }
  }

  statistic() {
    const PercentBuffedBlossoms =
      this.totalBlossomsCasted !== 0 ? (this.buffedBlossoms * 100) / this.totalBlossomsCasted : 0;
    const PercentBuffedEchoes =
      this.totalEchoesCasted !== 0 ? (this.buffedEchoes * 100) / this.totalEchoesCasted : 0;

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
              <ItemHealingDone amount={this.healingAddedToBlossoms} />
              <br />
              <small>
                {this.buffedBlossoms} casts buffed ({Math.trunc(PercentBuffedBlossoms)}%)
              </small>
            </div>
            <div>
              <small>
                <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} />
              </small>
              <br />
              <ItemHealingDone amount={this.healingAddedToEcho} />
              <br />
              <small>
                {this.buffedEchoes} casts buffed ({Math.trunc(PercentBuffedEchoes)}%)
              </small>
            </div>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default TitansGift;
