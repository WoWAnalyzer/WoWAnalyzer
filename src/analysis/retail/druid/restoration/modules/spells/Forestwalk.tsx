import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import { getSourceBloom } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import Lifebloom from 'analysis/retail/druid/restoration/modules/spells/Lifebloom';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import { formatDuration, formatPercentage } from 'common/format';

const FORESTWALK_HEALING_INCREASE_PER_RANK = 0.08;

/**
 * **Forestwalk**
 * Spec Talent
 *
 * Casting Regrowth increases your movement speed and healing received by 8%/16% for 6 sec.
 *
 * Attributes all healing received while the buff is up, plus Everbloom splash to others when a
 * self-Lifebloom bloom was amplified by Forestwalk (splash scales from that bloom).
 */
export default class Forestwalk extends Analyzer {
  static dependencies = {
    lifebloom: Lifebloom,
  };

  protected lifebloom!: Lifebloom;

  private healingIncrease = 0;

  healing = 0;
  overhealing = 0;
  /** Breakdown: Everbloom splash to others from Forestwalk-amplified self-Lifebloom blooms */
  everbloomSplashHealing = 0;
  everbloomSplashOverhealing = 0;

  constructor(options: Options) {
    super(options);
    const ranks = this.selectedCombatant.getTalentRank(TALENTS_DRUID.FORESTWALK_TALENT);
    this.active = ranks > 0;
    this.healingIncrease = FORESTWALK_HEALING_INCREASE_PER_RANK * ranks;

    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EVERBLOOM_SPLASH_HEAL),
      this.onEverbloomSplash,
    );
  }

  private onHeal(event: HealEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.FORESTWALK_BUFF.id, event.timestamp)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, this.healingIncrease);
    this.overhealing += calculateOverhealing(event, this.healingIncrease);
  }

  /**
   * Everbloom splash is a % of the Lifebloom bloom heal. When that bloom is on yourself with
   * Forestwalk up, the bloom (and therefore the splash) is larger. Attribute that cascade for
   * heals to other targets only: splash on yourself is already counted via {@link onHeal}.
   */
  private onEverbloomSplash(event: HealEvent) {
    if (event.targetID === this.selectedCombatant.id) {
      return;
    }
    if (!this.isSplashFromForestwalkSelfBloom(event)) {
      return;
    }

    const effective = calculateEffectiveHealing(event, this.healingIncrease);
    const overheal = calculateOverhealing(event, this.healingIncrease);

    this.healing += effective;
    this.overhealing += overheal;
    this.everbloomSplashHealing += effective;
    this.everbloomSplashOverhealing += overheal;
  }

  private isSplashFromForestwalkSelfBloom(event: HealEvent): boolean {
    const sourceBloom = getSourceBloom(event);
    if (sourceBloom) {
      return (
        sourceBloom.targetID === this.selectedCombatant.id &&
        this.selectedCombatant.hasBuff(SPELLS.FORESTWALK_BUFF.id, sourceBloom.timestamp)
      );
    }
    return (
      this.lifebloom.activeLifebloomTarget === this.selectedCombatant.id &&
      this.selectedCombatant.hasBuff(SPELLS.FORESTWALK_BUFF.id, event.timestamp)
    );
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FORESTWALK_BUFF.id);
  }

  get buffUptimePercent() {
    return this.buffUptime / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Extra healing received while Forestwalk was active
            {this.everbloomSplashHealing > 0 && (
              <>
                , plus{' '}
                <strong>{this.owner.formatItemHealingDone(this.everbloomSplashHealing)}</strong>{' '}
                from Everbloom splash scaled by self-Lifebloom blooms
              </>
            )}
            .
            <br />
            Buff uptime: <strong>{formatDuration(this.buffUptime)}</strong> (
            <strong>{formatPercentage(this.buffUptimePercent, 1)}%</strong>)
            <br />
            <strong>Overhealing: {formatOverhealing(this.overhealing, this.healing)}</strong>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DRUID.FORESTWALK_TALENT}>
          <ItemPercentHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
