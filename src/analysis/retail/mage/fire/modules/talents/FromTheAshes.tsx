import { FIRE_DIRECT_DAMAGE_SPELLS } from 'analysis/retail/mage/shared';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const MS_REDUCTION = 1000;

class FromTheAshes extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  cooldownReduction = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FROM_THE_ASHES_TALENT.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(FIRE_DIRECT_DAMAGE_SPELLS),
      this.onCritDamage,
    );
  }

  //Look for crit damage events to reduce the cooldown on Kindling
  onCritDamage(event: DamageEvent) {
    if (
      !this.spellUsable.isOnCooldown(SPELLS.PHOENIX_FLAMES.id) ||
      event.hitType !== HIT_TYPES.CRIT
    ) {
      return;
    }
    this.cooldownReduction += this.spellUsable.reduceCooldown(
      SPELLS.PHOENIX_FLAMES.id,
      MS_REDUCTION,
    );
  }

  get cooldownReductionSeconds() {
    return this.cooldownReduction / 1000;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringSpellValueText spellId={SPELLS.FROM_THE_ASHES_TALENT.id}>
          <>
            {formatNumber(this.cooldownReductionSeconds)}s{' '}
            <small>Phoenix Flames Cooldown Reduction</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FromTheAshes;
