import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { SpellLink } from 'interface';
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
import { formatNumber, formatPercentage } from 'common/format';
import { isCastFromEB } from 'analysis/retail/evoker/shared/modules/normalizers/EssenceBurstCastLinkNormalizer';
import TalentSpellText from 'parser/ui/TalentSpellText';

class TitansGift extends Analyzer {
  //Blossom
  healingAddedToBlossoms = 0;
  totalBlossomsCasted = 0;
  buffedBlossoms = 0;
  lastBlossomCast: CastEvent | null = null;
  totalBlossomHealing = 0;
  totalBlossomRawHealing = 0;
  blossomHealingOnBuffedCasts = 0;
  blossomRawHealingOnBuffedCasts = 0;
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
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.EMERALD_BLOSSOM, SPELLS.FLUTTERING_SEEDLINGS_HEAL]),
      this.emeraldBlossomHeal,
    );

    //Track echo heals
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.DREAM_BREATH_ECHO,
          SPELLS.REVERSION_ECHO,
          SPELLS.LIVING_FLAME_HEAL,
          SPELLS.VERDANT_EMBRACE_HEAL,
          SPELLS.EMERALD_BLOSSOM_ECHO,
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
  onBlossomCasts(event: CastEvent) {
    this.totalBlossomsCasted += 1;
    this.lastBlossomCast = event;
    if (isCastFromEB(event)) {
      this.buffedBlossoms += 1;
    }
  }

  onEchoCasts(event: CastEvent) {
    this.totalEchoesCasted += 1;
    if (isCastFromEB(event)) {
      this.buffedEchoes += 1;
    }
  }

  private getBlossomCastForEvent(event: HealEvent): CastEvent | null {
    const linkedCast = getBlossomCast(event);
    if (linkedCast) {
      return linkedCast;
    }

    if (this.lastBlossomCast && event.timestamp - this.lastBlossomCast.timestamp <= 2500) {
      return this.lastBlossomCast;
    }

    return null;
  }

  //Track blossom healing added
  emeraldBlossomHeal(event: HealEvent) {
    const blossomCast = this.getBlossomCastForEvent(event);
    const effectiveHealing = (event.amount || 0) + (event.absorbed || 0);
    const rawHealing = effectiveHealing + (event.overheal || 0);
    this.totalBlossomHealing += effectiveHealing;
    this.totalBlossomRawHealing += rawHealing;

    if (!blossomCast || !isCastFromEB(blossomCast)) {
      return;
    }

    this.blossomHealingOnBuffedCasts += effectiveHealing;
    this.blossomRawHealingOnBuffedCasts += rawHealing;
    this.healingAddedToBlossoms += calculateEffectiveHealing(event, TITANS_GIFT_INC);
  }

  //Track echo healing added
  echoHeal(event: HealEvent | ApplyBuffEvent | RefreshBuffEvent) {
    const echoApplication = getEchoAplication(event);
    if (!echoApplication || !isCastFromEB(echoApplication)) {
      return;
    }

    if (event.type === EventType.Heal) {
      this.healingAddedToEcho += calculateEffectiveHealing(event, TITANS_GIFT_INC);
      return;
    }

    const spellId = event.ability.guid;
    if (
      spellId === TALENTS_EVOKER.DREAM_BREATH_TALENT.id ||
      spellId === SPELLS.DREAM_BREATH_ECHO.id
    ) {
      const dbHealing = getDreamBreathHealing(event);
      this.healingAddedToEcho += dbHealing.reduce(
        (prev, cur) => prev + calculateEffectiveHealing(cur, TITANS_GIFT_INC),
        0,
      );
    } else if (
      spellId === TALENTS_EVOKER.REVERSION_TALENT.id ||
      spellId === SPELLS.REVERSION_ECHO.id
    ) {
      const revHealing = getReversionHealing(event);
      this.healingAddedToEcho += revHealing.reduce(
        (prev, cur) => prev + calculateEffectiveHealing(cur, TITANS_GIFT_INC),
        0,
      );
    }
  }

  statistic() {
    const percentBuffedBlossoms =
      this.totalBlossomsCasted !== 0 ? this.buffedBlossoms / this.totalBlossomsCasted : 0;
    const percentBuffedEchoes =
      this.totalEchoesCasted !== 0 ? this.buffedEchoes / this.totalEchoesCasted : 0;
    const totalHealing = this.healingAddedToBlossoms + this.healingAddedToEcho;
    const blossomHealingShare =
      this.totalBlossomHealing > 0
        ? this.blossomHealingOnBuffedCasts / this.totalBlossomHealing
        : 0;
    const attributedShareOfBuffedHealing =
      this.blossomHealingOnBuffedCasts > 0
        ? this.healingAddedToBlossoms / this.blossomHealingOnBuffedCasts
        : 0;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <div>
              <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> +{' '}
              <SpellLink spell={TALENTS_EVOKER.FLUTTERING_SEEDLINGS_TALENT} />:{' '}
              {formatNumber(this.healingAddedToBlossoms)} (buffed casts: {this.buffedBlossoms}/
              {this.totalBlossomsCasted}, {formatPercentage(percentBuffedBlossoms)}%)
            </div>
            <div>Raw Blossom/Seedling healing: {formatNumber(this.totalBlossomRawHealing)}</div>
            <div>
              Effective healing on Blossom/Seedling hits: {formatNumber(this.totalBlossomHealing)}
            </div>
            <div>
              Raw healing on buffed Blossom/Seedling hits:{' '}
              {formatNumber(this.blossomRawHealingOnBuffedCasts)} (
              {formatPercentage(blossomHealingShare)}% of all Blossom/Seedling hits)
            </div>
            <div>
              Effective healing on buffed Blossom/Seedling hits:{' '}
              {formatNumber(this.blossomHealingOnBuffedCasts)}
            </div>
            <div>
              Titans Gift attributed bonus on buffed Blossom/Seedling hits:{' '}
              {formatPercentage(attributedShareOfBuffedHealing)}% of buffed healing
            </div>
            <div>
              <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} />:{' '}
              {formatNumber(this.healingAddedToEcho)} (buffed casts: {this.buffedEchoes}/
              {this.totalEchoesCasted}, {formatPercentage(percentBuffedEchoes)}%)
            </div>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.TITANS_GIFT_TALENT}>
          <ItemHealingDone amount={totalHealing} />
        </TalentSpellText>
        <div className="pad">
          <div>
            <small>
              <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> +{' '}
              <SpellLink spell={TALENTS_EVOKER.FLUTTERING_SEEDLINGS_TALENT} />:{' '}
              {formatNumber(this.healingAddedToBlossoms)}
            </small>
          </div>
          <div>
            <small>
              <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} />:{' '}
              {formatNumber(this.healingAddedToEcho)}
            </small>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default TitansGift;
