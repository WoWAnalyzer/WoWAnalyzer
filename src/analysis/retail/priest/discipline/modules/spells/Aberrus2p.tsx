import { PRIEST_T30_ID } from 'common/ITEMS/dragonflight/tier';
import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { TIERS } from 'game/TIERS';
import { SpellLink } from 'interface';
import ItemSetLink from 'interface/ItemSetLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import { getDamageEvent, hasAtonementDamageEvent } from '../../normalizers/AtonementTracker';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { formatNumber } from 'common/format';
import ItemHealingDone from 'parser/ui/ItemHealingDone';

/*
  Shadow Word: Pain damage increased by 25%. Power Word: Radiance healing increased by 15%.
*/

const RADIANCE_BONUS_HEALING = 0.15;
const DOT_BONUS_INCREASE = 0.25;

class Aberrus2p extends Analyzer {
  bonusDoTHealing = 0;
  bonusRadianceHealing = 0;
  bonusDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T30);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT),
      this.onRadianceHealing,
    );

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ATONEMENT_HEAL_CRIT, SPELLS.ATONEMENT_HEAL_NON_CRIT]),
      this.onAtonementHeal,
    );

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.SHADOW_WORD_PAIN,
          TALENTS_PRIEST.PURGE_THE_WICKED_TALENT,
          SPELLS.PURGE_THE_WICKED_BUFF,
        ]),
      this.onDotDamage,
    );
  }

  onRadianceHealing(event: HealEvent) {
    this.bonusRadianceHealing += calculateEffectiveHealing(event, RADIANCE_BONUS_HEALING);
  }

  onAtonementHeal(event: HealEvent) {
    if (!hasAtonementDamageEvent(event)) {
      return;
    }

    const damageEvent = getDamageEvent(event);
    const damageSpellId = damageEvent.ability.guid;

    if (
      damageSpellId === SPELLS.SHADOW_WORD_PAIN.id ||
      damageSpellId === TALENTS_PRIEST.PURGE_THE_WICKED_TALENT.id ||
      damageSpellId === SPELLS.PURGE_THE_WICKED_BUFF.id
    ) {
      this.bonusDoTHealing += calculateEffectiveHealing(event, DOT_BONUS_INCREASE);
    }
  }

  onDotDamage(event: DamageEvent) {
    this.bonusDamage += calculateEffectiveDamage(event, DOT_BONUS_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <SpellLink
              id={
                this.selectedCombatant.hasTalent(TALENTS_PRIEST.PURGE_THE_WICKED_TALENT)
                  ? TALENTS_PRIEST.PURGE_THE_WICKED_TALENT.id
                  : SPELLS.SHADOW_WORD_PAIN.id
              }
            />{' '}
            bonus <SpellLink id={SPELLS.ATONEMENT_BUFF} /> healing:{' '}
            {formatNumber(this.bonusDoTHealing)} <br />
            <SpellLink id={TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT} /> bonus healing:{' '}
            {formatNumber(this.bonusRadianceHealing)}
          </>
        }
      >
        <>
          <div className="pad boring-text">
            <label>
              <ItemSetLink id={PRIEST_T30_ID}>
                <>
                  The Furnace Seraph's Verdict
                  <br />
                  (Aberrus Tier)
                </>
              </ItemSetLink>
            </label>
            <div className="value">
              <ItemHealingDone amount={this.bonusDoTHealing + this.bonusRadianceHealing} /> <br />
              <ItemDamageDone amount={this.bonusDamage} />
            </div>
          </div>
        </>
      </Statistic>
    );
  }
}

export default Aberrus2p;
