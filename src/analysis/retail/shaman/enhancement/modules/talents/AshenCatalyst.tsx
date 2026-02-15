import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from '../core/SpellUsable';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { UptimeIcon } from 'interface/icons';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

const ASHEN_CATALYST_COOLDOWN_REDUCTION_MS = 2000;

class AshenCatalyst extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
  enemies: Enemies,
}) {
  protected effectiveCooldownReduction = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.ASHEN_CATALYST_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.LAVA_LASH_TALENT),
      this.onLavaLash,
    );
  }

  onLavaLash(event: DamageEvent) {
    const enemy = this.deps.enemies.getEntity(event);
    if (!enemy) {
      return false;
    }
    if (enemy.hasBuff(SPELLS.FLAME_SHOCK.id, event.timestamp)) {
      this.effectiveCooldownReduction += this.deps.spellUsable.reduceCooldown(
        TALENTS.LAVA_LASH_TALENT.id,
        ASHEN_CATALYST_COOLDOWN_REDUCTION_MS,
      );
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <TalentSpellText talent={TALENTS.ASHEN_CATALYST_TALENT}>
          <>
            <UptimeIcon /> {formatNumber(this.effectiveCooldownReduction / 1000)}{' '}
            <small>sec cooldown reduction</small>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default AshenCatalyst;
