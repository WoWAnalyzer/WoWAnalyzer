import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from '../../../../parser/ui/BoringSpellValueText';

const TRANSLUCENT_IMAGE_DAMAGE_REDUCTION = 0.1;

class TranslucentImage extends Analyzer {
  damageReduced = 0;
  damageDuringTranslucentImage = 0;

  constructor(options: Options) {
    super(options);

    if (!this.selectedCombatant.hasTalent(TALENTS.TRANSLUCENT_IMAGE_TALENT)) {
      this.active = false;
      return;
    }
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onDamageTaken(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.FADE.id)) {
      return;
    }
    this.damageDuringTranslucentImage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const fightDuration = this.owner.fightDuration;
    this.damageReduced = this.damageDuringTranslucentImage * TRANSLUCENT_IMAGE_DAMAGE_REDUCTION;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <>
          <BoringSpellValueText spellId={TALENTS.TRANSLUCENT_IMAGE_TALENT.id}>
            {formatNumber(this.damageReduced)} <small> damage reduced </small> <br />
            {formatNumber((this.damageReduced / fightDuration) * 1000)} DRPS <br />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default TranslucentImage;
