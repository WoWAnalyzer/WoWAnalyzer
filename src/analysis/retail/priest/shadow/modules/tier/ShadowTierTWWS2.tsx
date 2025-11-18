import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { PRIEST_TWW2_ID } from 'common/ITEMS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HasRelatedEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import BoringItemSetValueText from 'parser/ui/BoringItemSetValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import UptimeIcon from 'interface/icons/Uptime';
import { SpellLink } from 'interface';

const SHADOW_TWW_TIER_2_DAMAGE_MULTIPLIER_2P = 1.0; //100% damage increase from Jackpot
const SHADOW_TWW_TIER_2_DAMAGE_MULTIPLIER_4P = 0.1; //10% damage increase during PI

//Hitting a jackpot! does 2 things.  Launches a void bolt, and gives 5 seconds of PI.
//This special voidbolt does not have a cast event, but does have a damage event.
//So we look for voidbolt damage events that don't have cast event connected.
//The PI sometimes has a cast event, and its the same as a normal PI cast.
//We can just track the voidbolts without casts, and use that for everything.
//To do so, we can use an Event Normalizer, to link VB cast events to VB damage events, then check each damage event for the relationship.

//Also, duing PI you gain 10% increased damage to VB and MB

class ShadowTierTWWS1 extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    eventHistory: EventHistory,
    spellUsable: SpellUsable,
  };
  protected abilities!: Abilities;
  protected eventHistory!: EventHistory;
  protected spellUsable!: SpellUsable;

  has4Piece: boolean;
  has2Piece: boolean;

  castVB = 'VoidBoltDamageEventWithCast';

  freeCastVB = 0;
  damage2p = 0;

  timePI = 0;
  damage4p = 0;

  constructor(options: Options) {
    super(options);
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.TWW2);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.TWW2);
    this.active = this.has2Piece;

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_BLAST),
      this.onDamage,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.VOID_BOLT), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    if (event.ability.guid === SPELLS.VOID_BOLT.id) {
      //If this VB damage event does not have a linked Cast event, it was a JackPot!
      if (!HasRelatedEvent(event, this.castVB)) {
        this.freeCastVB += 1;
        this.damage2p += calculateEffectiveDamage(event, SHADOW_TWW_TIER_2_DAMAGE_MULTIPLIER_2P);
        this.timePI += 5; //gain 5 seconds of PI every Jackpot!
      }
    }

    //The 4 piece gives extra damage to these spells duing PI.
    if (this.has4Piece) {
      if (this.selectedCombatant.hasBuff(TALENTS.POWER_INFUSION_TALENT)) {
        this.damage4p += calculateEffectiveDamage(event, SHADOW_TWW_TIER_2_DAMAGE_MULTIPLIER_4P);
      }
    }
  }

  statistic() {
    if (this.has2Piece) {
      return (
        <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
          <BoringItemSetValueText setId={PRIEST_TWW2_ID} title="Confessor's Unshakable Virtue">
            {' '}
          </BoringItemSetValueText>

          <BoringSpellValueText spell={SPELLS.SHADOW_PRIEST_TWW_TIER_2_2_SET}>
            <div>
              {this.freeCastVB}{' '}
              <small>
                extra casts of <SpellLink spell={SPELLS.VOID_BOLT} />{' '}
              </small>
            </div>
            <ItemDamageDone amount={this.damage2p} />
          </BoringSpellValueText>

          {this.has4Piece && (
            <BoringSpellValueText spell={SPELLS.SHADOW_PRIEST_TWW_TIER_2_4_SET}>
              <div>
                <UptimeIcon /> {this.timePI}s{' '}
                <small>
                  {' '}
                  of <SpellLink spell={TALENTS.POWER_INFUSION_TALENT} />
                </small>
              </div>
              <ItemDamageDone amount={this.damage4p} />
            </BoringSpellValueText>
          )}
        </Statistic>
      );
    }
  }
}
export default ShadowTierTWWS1;
