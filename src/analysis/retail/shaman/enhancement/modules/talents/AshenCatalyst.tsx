import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/shaman';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber } from 'common/format';
import UptimeIcon from 'interface/icons/Uptime';

const ASHEN_CATALYST_COOLDOWN_REDUCTION_MS = 500;
const DAMAGE_AMP_PER_STACK = 0.12;

class AshenCatalyst extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  protected damageGained = 0;
  protected effectiveCooldownReduction = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.ASHEN_CATALYST_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FLAME_SHOCK),
      this.onDotTick,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.LAVA_LASH_TALENT),
      this.onLavaLash,
    );
  }

  onDotTick(event: DamageEvent) {
    if (!event.tick) {
      return;
    }
    this.effectiveCooldownReduction += this.spellUsable.reduceCooldown(
      TALENTS.LAVA_LASH_TALENT.id,
      ASHEN_CATALYST_COOLDOWN_REDUCTION_MS,
    );
  }

  onLavaLash(event: DamageEvent) {
    const stacks = this.selectedCombatant.getBuffStacks(SPELLS.ASHEN_CATALYST_BUFF.id);
    this.damageGained += calculateEffectiveDamage(event, stacks * DAMAGE_AMP_PER_STACK);
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
            <ItemDamageDone amount={this.damageGained} />
            <br />
            <UptimeIcon /> {formatNumber(this.effectiveCooldownReduction / 1000)}{' '}
            <small>sec cooldown reduction</small>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default AshenCatalyst;
