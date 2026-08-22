/** TherazanesResilience
 * Earth Shield and Water Shield no longer lose charges and are 115% effective.
 */
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import CooldownThroughputTracker from '../features/CooldownThroughputTracker';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TooltipElement } from 'interface/Tooltip';
import SpellLink from 'interface/SpellLink';
import TalentSpellText from 'parser/ui/TalentSpellText';

const THERAZANES_RESILIENCE_HEALING_INCREASE = 0.15;
const EARTH_SHIELD_BASE_CHARGES = 9;
const EARTHEN_COMMUNION_BONUS_CHARGES = 3;

export default class TherazanesResilience extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };

  protected combatants!: Combatants;
  protected cooldownThroughputTracker!: CooldownThroughputTracker;

  baseBonusHealing = 0;
  orbitBonusHealing = 0;

  earthShieldHealTicks = 0;
  earthShieldCasts = 0;

  get bonusHealing() {
    return this.baseBonusHealing + this.orbitBonusHealing;
  }

  get earthShieldChargesPerCast() {
    return (
      EARTH_SHIELD_BASE_CHARGES +
      (this.selectedCombatant.hasTalent(TALENTS.EARTHEN_COMMUNION_TALENT)
        ? EARTHEN_COMMUNION_BONUS_CHARGES
        : 0)
    );
  }

  get gcdsSaved() {
    const castsNeededWithoutTalent = Math.floor(
      this.earthShieldHealTicks / this.earthShieldChargesPerCast,
    );
    return Math.max(0, castsNeededWithoutTalent - Math.max(0, this.earthShieldCasts - 1));
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.THERAZANES_RESILIENCE_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL),
      this.onEarthShieldHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.EARTH_SHIELD_TALENT),
      this.onEarthShieldCast,
    );
  }

  onEarthShieldHeal(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    if (!combatant) {
      return;
    }

    this.earthShieldHealTicks += 1;

    const bonus = calculateEffectiveHealing(event, THERAZANES_RESILIENCE_HEALING_INCREASE);

    if (combatant.hasBuff(SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id, event.timestamp)) {
      this.orbitBonusHealing += bonus;
    } else if (combatant.hasBuff(TALENTS.EARTH_SHIELD_TALENT.id, event.timestamp)) {
      this.baseBonusHealing += bonus;
    }
  }

  onEarthShieldCast(event: CastEvent) {
    this.earthShieldCasts += 1;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        tooltip={
          <>
            <strong>{this.earthShieldHealTicks}</strong> observed heal ticks and{' '}
            <strong>{this.earthShieldChargesPerCast}</strong> charges per (re-)cast.{' '}
            {this.selectedCombatant.hasTalent(TALENTS.EARTHEN_COMMUNION_TALENT) &&
              ' (including the +3 from Earthen Communion)'}
            Actual <SpellLink spell={TALENTS.EARTH_SHIELD_TALENT} /> casts this fight:{' '}
            <strong>{this.earthShieldCasts}</strong>{' '}
            <small>
              Without <SpellLink spell={TALENTS.THERAZANES_RESILIENCE_TALENT} />,{' '}
              <SpellLink spell={TALENTS.EARTH_SHIELD_TALENT} /> loses a charges and must be recast
              once its charges run out. This estimates how many of those recasts were avoided.
            </small>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.THERAZANES_RESILIENCE_TALENT}>
          <>
            <div className="pad">
              <div className="value">
                <TooltipElement content="Estimated number of Earth Shield recasts avoided due to Therazane's Resilience.">
                  {this.gcdsSaved}
                </TooltipElement>{' '}
                casts not spend on maintaining Earth Shield
              </div>
            </div>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}
