import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { PRIEST_TWW1_ID } from 'common/ITEMS/dragonflight';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
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

const SHADOW_TWW_TIER_1_DAMAGE_MULTIPLIER = 0.02; //2% damage increase per stack

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

  timeDP = 0;
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.TWW1);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.TWW1);
    this.active = this.has2Piece;

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DEVOURING_PLAGUE_TALENT),
      this.onDevouringPlague,
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    const amp =
      this.selectedCombatant.getBuffStacks(SPELLS.SHADOW_PRIEST_TWW_TIER_1_4_SET_BUFF.id) *
      SHADOW_TWW_TIER_1_DAMAGE_MULTIPLIER;
    this.damage += calculateEffectiveDamage(event, amp);
  }

  onDevouringPlague() {
    this.timeDP += 1;
  }

  statistic() {
    if (this.has2Piece) {
      return (
        <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
          <BoringItemSetValueText setId={PRIEST_TWW1_ID} title="Shards of Living Luster">
            {' '}
          </BoringItemSetValueText>
          <BoringSpellValueText spell={TALENTS.DEVOURING_PLAGUE_TALENT}>
            <UptimeIcon /> {this.timeDP}s <small>increased duration</small>
          </BoringSpellValueText>
          {this.has4Piece ? (
            <>
              <BoringSpellValueText spell={SPELLS.SHADOW_PRIEST_TWW_TIER_1_4_SET_BUFF}>
                <ItemDamageDone amount={this.damage} />
              </BoringSpellValueText>
            </>
          ) : null}
        </Statistic>
      );
    }
  }
}
export default ShadowTierTWWS1;
