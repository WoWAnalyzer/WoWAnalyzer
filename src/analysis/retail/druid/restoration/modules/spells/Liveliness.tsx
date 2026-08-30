import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import {
  calculateEffectiveDamage,
  calculateEffectiveHealing,
  calculateOverhealing,
} from 'parser/core/EventCalculateLib';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import { formatNumber } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellLink } from 'interface';
import {
  LIVELINESS_INCREASED_DAMAGE_RATE,
  LIVELINESS_INCREASED_RATE,
} from 'analysis/retail/druid/restoration/constants';
import Photosynthesis from 'analysis/retail/druid/restoration/modules/spells/Photosynthesis';

const LIVELINESS_HEALING_RATE_INCREASE = 0.05;
const LIVELINESS_DAMAGE_RATE_INCREASE = 0.25;
/** Share of observed Photosynthesis outcomes attributable to the extra HoT ticks from Liveliness */
const LIVELINESS_PHOTO_FRACTION =
  LIVELINESS_HEALING_RATE_INCREASE / (1 + LIVELINESS_HEALING_RATE_INCREASE);

/**
 * **Liveliness**
 * Spec Talent
 *
 * Your damage over time effects deal their damage 25% faster, and your healing over time effects heal 5% faster.
 *
 * Faster HoT ticks also cause more Photosynthesis procs (and thus more Everbloom /
 * Verdancy from those blooms). That contribution is estimated as a share of
 * Photosynthesis healing.
 */
export default class Liveliness extends Analyzer {
  static dependencies = {
    photosynthesis: Photosynthesis,
  };

  protected photosynthesis!: Photosynthesis;

  /** Healing from faster HoT tick rate */
  tickHealing = 0;
  tickOverhealing = 0;
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.LIVELINESS_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(LIVELINESS_INCREASED_RATE),
      this.onHotHeal,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(LIVELINESS_INCREASED_DAMAGE_RATE),
      this.onDamage,
    );
  }

  onHotHeal(event: HealEvent) {
    if (!event.tick) {
      return;
    }
    this.tickHealing += calculateEffectiveHealing(event, LIVELINESS_HEALING_RATE_INCREASE);
    this.tickOverhealing += calculateOverhealing(event, LIVELINESS_HEALING_RATE_INCREASE);
  }

  onDamage(event: DamageEvent) {
    if (!event.tick) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, LIVELINESS_DAMAGE_RATE_INCREASE);
  }

  /** Estimated Photosynthesis healing from extra HoT ticks (blooms + splash + Verdancy) */
  get photosynthesisHealing(): number {
    if (!this.photosynthesis.active) {
      return 0;
    }
    return this.photosynthesis.totalHealing * LIVELINESS_PHOTO_FRACTION;
  }

  get photosynthesisOverhealing(): number {
    if (!this.photosynthesis.active) {
      return 0;
    }
    return this.photosynthesis.totalOverhealing * LIVELINESS_PHOTO_FRACTION;
  }

  get healing(): number {
    return this.tickHealing + this.photosynthesisHealing;
  }

  get overhealing(): number {
    return this.tickOverhealing + this.photosynthesisOverhealing;
  }

  statistic() {
    const hasEverbloomSplash =
      this.photosynthesis.active && this.photosynthesis.everbloomSplashHealing > 0;
    const hasVerdancy = this.photosynthesis.active && this.photosynthesis.verdancyHealing > 0;

    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(9)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <strong>Liveliness healing breakdown</strong>
            <ul>
              <li>
                Faster HoT ticks: <strong>{formatNumber(this.tickHealing)}</strong>
              </li>
              {this.photosynthesis.active && (
                <li>
                  Extra <SpellLink spell={TALENTS_DRUID.PHOTOSYNTHESIS_TALENT} /> blooms from faster
                  ticks: <strong>{formatNumber(this.photosynthesisHealing)}</strong>
                  {(hasEverbloomSplash || hasVerdancy) && (
                    <em>
                      {' '}
                      (includes
                      {hasEverbloomSplash && (
                        <>
                          {' '}
                          <SpellLink spell={TALENTS_DRUID.EVERBLOOM_2_RESTORATION_TALENT} /> splash
                        </>
                      )}
                      {hasEverbloomSplash && hasVerdancy && ' and'}
                      {hasVerdancy && (
                        <>
                          {' '}
                          <SpellLink spell={TALENTS_DRUID.VERDANCY_TALENT} />
                        </>
                      )}{' '}
                      from those blooms)
                    </em>
                  )}
                </li>
              )}
            </ul>
            Estimated bonus DPS from faster DoT ticks:
            <br />
            <ItemPercentDamageDone amount={this.damage} />
            <br />
            <strong>Overhealing: {formatOverhealing(this.overhealing, this.healing)}</strong>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DRUID.LIVELINESS_TALENT}>
          <ItemPercentHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
