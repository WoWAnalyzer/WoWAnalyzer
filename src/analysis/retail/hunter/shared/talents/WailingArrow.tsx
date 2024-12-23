import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_HUNTER } from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class WailingArrow extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.WAILING_ARROW_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.WAILING_ARROW_DAMAGE_FOCUS),
      this.onWailingDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.WAILING_ARROW_DAMAGE),
      this.onWailingDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WAILING_ARROW_DAMAGE_FOCUS),
      this.onWailingCast,
    );
  }

  //Readiness grants Wailing Arrow the ability to reset the cooldown of Rapid Fire and 2 charges of Aimed Shot
  onWailingCast(event: CastEvent) {
    if (this.selectedCombatant.hasTalent(TALENTS.READINESS_TALENT)) {
      this.spellUsable.endCooldown(SPELLS.RAPID_FIRE.id, event.timestamp);
      this.spellUsable.endCooldown(
        TALENTS_HUNTER.AIMED_SHOT_TALENT.id,
        event.timestamp,
        true,
        true,
      );
    }
  }

  onWailingDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.WAILING_ARROW_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WailingArrow;
