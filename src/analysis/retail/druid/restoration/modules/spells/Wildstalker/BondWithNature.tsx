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
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

const BOND_WITH_NATURE_HEALING_INCREASE = 0.04;

/**
 * **Bond with Nature**
 * Hero Talent - Wildstalker
 *
 * Healing you receive is increased by 4%.
 *
 * Card main value = own HPS contribution (self-heal amp + Everbloom splash from
 * self-Lifebloom blooms). External healing received is tooltip-only.
 * {@link healing} remains the full talent value (self + external + splash) for the
 * hero-tree total.
 */
export default class BondWithNature extends Analyzer {
  static dependencies = {
    lifebloom: Lifebloom,
  };

  protected lifebloom!: Lifebloom;

  /** Full talent value — hero-tree total (self + external + everbloom splash) */
  healing = 0;
  overhealing = 0;
  /** Amp on healing you deal to yourself */
  selfHealing = 0;
  selfOverhealing = 0;
  /** Amp on healing received from sources other than yourself */
  externalHealing = 0;
  externalOverhealing = 0;
  /**
   * Everbloom splash to others attributable because Bond with Nature
   * amplified the Lifebloom bloom on yourself.
   */
  everbloomSplashHealing = 0;
  everbloomSplashOverhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.BOND_WITH_NATURE_TALENT);

    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EVERBLOOM_SPLASH_HEAL),
      this.onEverbloomSplash,
    );
  }

  private onHeal(event: HealEvent) {
    const effective = calculateEffectiveHealing(event, BOND_WITH_NATURE_HEALING_INCREASE);
    const overheal = calculateOverhealing(event, BOND_WITH_NATURE_HEALING_INCREASE);

    this.healing += effective;
    this.overhealing += overheal;

    if (event.sourceID !== this.selectedCombatant.id) {
      this.externalHealing += effective;
      this.externalOverhealing += overheal;
    } else {
      this.selfHealing += effective;
      this.selfOverhealing += overheal;
    }
  }

  /**
   * Everbloom splash is a % of the Lifebloom bloom heal. When that bloom is on
   * yourself, Bond with Nature increases the bloom — and therefore the splash.
   * Attribute that cascade for heals to other targets only: splash on yourself
   * is already counted via {@link onHeal} (receive amp).
   */
  private onEverbloomSplash(event: HealEvent) {
    if (event.targetID === this.selectedCombatant.id) {
      return;
    }
    if (!this.isSplashFromSelfBloom(event)) {
      return;
    }

    const effective = calculateEffectiveHealing(event, BOND_WITH_NATURE_HEALING_INCREASE);
    const overheal = calculateOverhealing(event, BOND_WITH_NATURE_HEALING_INCREASE);

    this.healing += effective;
    this.overhealing += overheal;
    this.everbloomSplashHealing += effective;
    this.everbloomSplashOverhealing += overheal;
  }

  private isSplashFromSelfBloom(event: HealEvent): boolean {
    const sourceBloom = getSourceBloom(event);
    if (sourceBloom) {
      return sourceBloom.targetID === this.selectedCombatant.id;
    }
    return this.lifebloom.activeLifebloomTarget === this.selectedCombatant.id;
  }

  /** Own HPS contribution shown on the card (excludes external healing received) */
  get ownHealing() {
    return this.selfHealing + this.everbloomSplashHealing;
  }

  get ownOverhealing() {
    return this.selfOverhealing + this.everbloomSplashOverhealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(2)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
        tooltip={
          <>
            Own HPS contribution (self-heal amp + Everbloom splash). External healing received is
            listed separately and is not in the main value.
            <ul>
              <li>
                Self-heal amp: <strong>{this.owner.formatItemHealingDone(this.selfHealing)}</strong>
              </li>
              {this.everbloomSplashHealing > 0 && (
                <li>
                  Everbloom splash to others (from self-Lifebloom blooms):{' '}
                  <strong>{this.owner.formatItemHealingDone(this.everbloomSplashHealing)}</strong>
                </li>
              )}
              {this.externalHealing > 0 && (
                <li>
                  Healing received from others (not in main value):{' '}
                  <strong>{this.owner.formatItemHealingDone(this.externalHealing)}</strong>
                </li>
              )}
            </ul>
            <strong>Overhealing: {formatOverhealing(this.ownOverhealing, this.ownHealing)}</strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.BOND_WITH_NATURE_TALENT}>
          <ItemPercentHealingDone amount={this.ownHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
