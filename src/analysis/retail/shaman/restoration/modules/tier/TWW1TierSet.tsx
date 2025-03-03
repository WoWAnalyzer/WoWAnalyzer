import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent, CastEvent } from 'parser/core/Events';
import { SHAMAN_TWW1_ID } from 'common/ITEMS/dragonflight';
import { SpellLink } from 'interface';
import ItemSetLink from 'interface/ItemSetLink';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import { formatNumber } from 'common/format';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Combatants from 'parser/shared/modules/Combatants';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ItemManaGained from 'parser/ui/ItemManaGained';

const TIDAL_WAVES_BUFF_MINIMAL_ACTIVE_TIME = 100; // Minimal duration for which you must have tidal waves. Prevents it from counting a HS/HW as buffed when you cast a riptide at the end.

const TWW1_TIER_2PC_BONUS = 0.1; // 2pc bonus Tidal Waves bonus spell power : +10%
const TWW1_TIER_4PC_MANACOST_REDUCTION = 0.08; // 4pc bonus Tidal Waves mana cost reduction : 8%

/**
 * **Resto Shaman T32 (Nerub'Ar Palace)**
 *
 * 2pc: Tidal Waves increases the healing of affected spells by 10%.
 *
 * 4pc : Tidal Waves is 80% more effective and reduces the mana cost of affected spells by 8%.
 * Note : Only mana cost is considered for 4pc, since increased crit rate and cast rate have benefits that are hard to quantify.
 */

export default class TWW1TierSet extends Analyzer {
  static AFFECTED_SPELLS = [
    SPELLS.HEALING_SURGE,
    TALENTS_SHAMAN.CHAIN_HEAL_TALENT,
    SPELLS.HEALING_WAVE,
  ];
  protected combatants!: Combatants;
  has4pc: boolean;
  tidalWaves2pcBonusHealing: number = 0;
  tidalWaves2pcOverHealing: number = 0;
  tidalWaves4pcSavedMana: number = 0;
  tidalWavesBuffedCastNumber: number = 0;

  constructor(options: Options) {
    super(options);

    this.active =
      this.selectedCombatant.has2PieceByTier(TIERS.TWW1) &&
      this.selectedCombatant.hasTalent(TALENTS_SHAMAN.TIDAL_WAVES_TALENT);
    this.has4pc = this.selectedCombatant.has4PieceByTier(TIERS.TWW1);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TWW1TierSet.AFFECTED_SPELLS),
      this.onCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TWW1TierSet.AFFECTED_SPELLS),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    // Check if player has been under Tidal Waves for at least 100ms to prevent misattributions in case of a Riptide at the end of a cast
    // Ignore ticks of healing
    if (
      !this.selectedCombatant.hasBuff(
        SPELLS.TIDAL_WAVES_BUFF.id,
        event.timestamp,
        0,
        TIDAL_WAVES_BUFF_MINIMAL_ACTIVE_TIME,
      )
    ) {
      return;
    }

    // If the caster is under Tidal Waves, tally the amount attributed to the 2pc bonus
    this.tidalWaves2pcBonusHealing += calculateEffectiveHealing(event, TWW1_TIER_2PC_BONUS);
    this.tidalWaves2pcOverHealing += calculateOverhealing(event, TWW1_TIER_2PC_BONUS);
  }

  onCast(event: CastEvent) {
    // Check if player has been under Tidal Waves for at least 100ms to prevent misattributions in case of a Riptide at the end of a cast
    if (
      !this.selectedCombatant.hasBuff(
        SPELLS.TIDAL_WAVES_BUFF.id,
        event.timestamp,
        0,
        TIDAL_WAVES_BUFF_MINIMAL_ACTIVE_TIME,
      )
    ) {
      return;
    }

    this.tidalWavesBuffedCastNumber += 1;

    if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
      return;
    }

    if (!event.resourceCost) {
      return;
    }

    if (this.has4pc) {
      // 4pc bonus reduces mana cost by 8%
      const baseCost = event.resourceCost[RESOURCE_TYPES.MANA.id];
      this.tidalWaves4pcSavedMana += baseCost * TWW1_TIER_4PC_MANACOST_REDUCTION;
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <p>
              {formatNumber(this.tidalWavesBuffedCastNumber)} casts buffed with{' '}
              <SpellLink spell={SPELLS.TIDAL_WAVES_BUFF} /> were improved by the 2-piece bonus,
              resulting in <strong>{formatNumber(this.tidalWaves2pcBonusHealing)}</strong> bonus
              healing ({formatNumber(this.tidalWaves2pcOverHealing)} overhealing)
              <br />
            </p>
            <p>
              The 4-piece bonus also reduces further the cast time of your next{' '}
              <SpellLink spell={TALENTS_SHAMAN.CHAIN_HEAL_TALENT} /> or{' '}
              <SpellLink spell={SPELLS.HEALING_WAVE} /> and improves the critical rate of your next{' '}
              <SpellLink spell={SPELLS.HEALING_SURGE} /> but these bonuses are not yet accounted
              for.
            </p>
          </>
        }
      >
        <div className="pad boring-text">
          <label>
            <ItemSetLink id={SHAMAN_TWW1_ID}>
              <>
                Waves of the Forgotten Reservoir
                <br />
                (T32 Tier Set)
              </>
            </ItemSetLink>
          </label>
          <div className="value">
            <h4>2 Piece</h4>
            <ItemHealingDone amount={this.tidalWaves2pcBonusHealing} />
          </div>
          <hr />
          {this.has4pc && (
            <div className="value">
              <h4>4 Piece</h4>
              <ItemManaGained amount={this.tidalWaves4pcSavedMana} />
            </div>
          )}
        </div>
      </Statistic>
    );
  }
}
