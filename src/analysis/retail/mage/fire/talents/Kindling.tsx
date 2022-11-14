import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const REDUCTION_MS = 1000;
const COMBUST_REDUCTION_SPELLS = [
  SPELLS.FIREBALL,
  TALENTS.PYROBLAST_TALENT,
  SPELLS.FIRE_BLAST,
  SPELLS.PHOENIX_FLAMES_DAMAGE,
];

class Kindling extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  cooldownReduction = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.KINDLING_TALENT.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(COMBUST_REDUCTION_SPELLS),
      this.onCritDamage,
    );
  }

  //Look for crit damage events to reduce the cooldown on Kindling
  onCritDamage(event: DamageEvent) {
    const combustionOnCD = this.spellUsable.isOnCooldown(TALENTS.COMBUSTION_TALENT.id);
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    if (combustionOnCD) {
      this.cooldownReduction += this.spellUsable.reduceCooldown(
        TALENTS.COMBUSTION_TALENT.id,
        REDUCTION_MS,
      );
    }
  }

  get cooldownReductionSeconds() {
    return this.cooldownReduction / 1000;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringSpellValueText spellId={TALENTS.KINDLING_TALENT.id}>
          <>
            {formatNumber(this.cooldownReductionSeconds)}s{' '}
            <small>Combustion Cooldown Reduction</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Kindling;
