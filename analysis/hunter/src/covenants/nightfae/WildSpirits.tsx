import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { WILD_MARK_DAMAGE_AMP } from '../../constants';

/**
 * TODO Revisit this when Blizzard is done messing with this changing it constantly.
 */
class WildSpirits extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    enemies: Enemies,
  };

  damage: number = 0;
  ampDamage: number = 0;

  protected abilities!: Abilities;
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);

    if (!this.active) {
      return;
    }

    (options.abilities as Abilities).add({
      spell: SPELLS.WILD_SPIRITS.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: 120,
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.9,
      },
    });

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.WILD_SPIRITS_DAMAGE, SPELLS.WILD_SPIRITS_DAMAGE_AOE]),
      this.onWildSpiritsDamage,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onWildSpiritsDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy?.hasBuff(SPELLS.WILD_MARK.id)) {
      return;
    }
    this.ampDamage += calculateEffectiveDamage(event, WILD_MARK_DAMAGE_AMP);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spellId={SPELLS.WILD_SPIRITS.id}>
          <>
            <img src="/img/sword.png" alt="Damage" className="icon" /> {formatNumber(this.damage)}{' '}
            <small> direct damage</small>
            <br />
            <img src="/img/sword.png" alt="Damage" className="icon" />{' '}
            {formatNumber(this.ampDamage)} <small> Wild Mark damage</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WildSpirits;
