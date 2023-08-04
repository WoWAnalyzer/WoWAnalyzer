import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { FIRE_DIRECT_DAMAGE_SPELLS } from '../../shared';

const REDUCTION_MS = 2500;

class UnleashedInferno extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  cooldownReduction = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.UNLEASHED_INFERNO_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(FIRE_DIRECT_DAMAGE_SPELLS),
      this.onDirectDamage,
    );
  }

  //Look for damage events to reduce the cooldown on Combustion via the Unleashed Inferno Talent
  onDirectDamage(event: DamageEvent) {
    const combustionOnCD = this.spellUsable.isOnCooldown(TALENTS.COMBUSTION_TALENT.id);
    if (!this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id) || !combustionOnCD) {
      return;
    }
    this.cooldownReduction += this.spellUsable.reduceCooldown(
      TALENTS.COMBUSTION_TALENT.id,
      REDUCTION_MS,
    );
  }

  get cooldownReductionSeconds() {
    return this.cooldownReduction / 1000;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringSpellValueText spellId={TALENTS.UNLEASHED_INFERNO_TALENT.id}>
          <>
            {formatNumber(this.cooldownReductionSeconds)}s{' '}
            <small>Combustion Cooldown Reduction</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default UnleashedInferno;
