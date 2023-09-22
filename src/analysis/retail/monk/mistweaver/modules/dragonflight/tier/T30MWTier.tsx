import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { TIERS } from 'game/TIERS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent, ResourceChangeEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const FOUR_PIECE_BONUS = 0.4;
const FOUR_PIECE_SPELLS = [SPELLS.RENEWING_MIST_HEAL, SPELLS.VIVIFY];

class T30TierSet extends Analyzer {
  has2Piece: boolean = true;
  has4Piece: boolean = true;
  vivHealing: number = 0;
  renewingMistHealing: number = 0;
  manaGain: number = 0;
  wastedManaGain: number = 0;

  constructor(options: Options) {
    super(options);
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.T30);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.T30) && this.has2Piece;
    this.active = this.has2Piece;
    if (!this.active) {
      return;
    }
    // 2pc do energized for mana gain value and show uptime
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.SOULFANG_INFUSION),
      this.handle2pcMana,
    );
    //4pc do uptime and effective healing increase
    if (this.has4Piece) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(FOUR_PIECE_SPELLS),
        this.handle4PcHeal,
      );
    }
  }

  get total4PieceHealing() {
    return this.renewingMistHealing + this.vivHealing;
  }

  get twoSetUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.SOULFANG_INFUSION.id) / this.owner.fightDuration
    );
  }

  get fourSetUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.SOULFANG_VITALITY.id) / this.owner.fightDuration
    );
  }

  handle2pcMana(event: ResourceChangeEvent) {
    if (event.resourceChangeType !== RESOURCE_TYPES.MANA.id) {
      return;
    }
    this.manaGain += event.resourceChange - event.waste;
    this.wastedManaGain += event.waste;
  }

  handle4PcHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    if (this.selectedCombatant.hasBuff(SPELLS.SOULFANG_VITALITY.id)) {
      const healing = calculateEffectiveHealing(event, FOUR_PIECE_BONUS);
      spellId === SPELLS.RENEWING_MIST_HEAL.id
        ? (this.renewingMistHealing += healing)
        : (this.vivHealing += healing);
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <ul>
            <li>
              <strong>{formatNumber(this.renewingMistHealing)}</strong> extra{' '}
              <SpellLink spell={SPELLS.RENEWING_MIST_HEAL} /> healing
            </li>
            <li>
              <strong>{formatNumber(this.vivHealing)}</strong> extra{' '}
              <SpellLink spell={SPELLS.VIVIFY} /> healing
            </li>
            <li>
              <strong>{formatNumber(this.wastedManaGain)}</strong> mana wasted from overcapping
            </li>
          </ul>
        }
      >
        <BoringValueText label="Fangs of Forged Vermillion (T30 Set Bonus)">
          <h4>2 Piece</h4>
          <ItemManaGained amount={this.manaGain} useAbbrev />
          <br />
          {formatPercentage(this.twoSetUptime)}%<small> uptime</small>
          <hr />
          {this.has4Piece && (
            <>
              <h4>4 Piece</h4>
              <ItemHealingDone amount={this.total4PieceHealing} />
              <br />
              {formatPercentage(this.fourSetUptime)}%<small> uptime</small>
            </>
          )}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default T30TierSet;
