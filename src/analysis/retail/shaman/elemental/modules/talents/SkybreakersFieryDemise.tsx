import TALENTS, { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import HIT_TYPES from 'game/HIT_TYPES';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber, formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import UptimeIcon from 'interface/icons/Uptime';

class SkybreakersFieryDemise extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  private readonly spellUsable!: SpellUsable;
  private effectiveCdr: number = 0;
  private wastedCdr: number = 0;
  private readonly elementalSpellId: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SKYBREAKERS_FIERY_DEMISE_TALENT);

    if (!this.active) {
      return;
    }

    this.elementalSpellId = this.selectedCombatant.hasTalent(TALENTS.STORM_ELEMENTAL_TALENT)
      ? TALENTS.STORM_ELEMENTAL_TALENT.id
      : TALENTS.FIRE_ELEMENTAL_TALENT.id;
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FLAME_SHOCK),
      this.onFlameShockDamage,
    );
  }

  onFlameShockDamage(event: DamageEvent) {
    if (event.tick && event.hitType === HIT_TYPES.CRIT) {
      if (this.spellUsable.isOnCooldown(this.elementalSpellId)) {
        const cdr = this.spellUsable.reduceCooldown(this.elementalSpellId, 1000, event.timestamp);
        this.effectiveCdr += cdr;
        this.wastedCdr += 1000 - cdr;
      } else {
        this.wastedCdr += 1000;
      }
    }
  }

  get reduction() {
    return (this.wastedCdr + this.effectiveCdr) / 1000;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <TalentSpellText talent={TALENTS_SHAMAN.SKYBREAKERS_FIERY_DEMISE_TALENT}>
          <>
            <p>
              <UptimeIcon /> {formatNumber(this.effectiveCdr / 1000)} sec <br />
              <small> total effective reduction</small>
            </p>
            <p>
              <UptimeIcon /> {formatNumber(this.wastedCdr / 1000)} sec (
              {formatPercentage(this.wastedCdr / 1000 / this.reduction)}%) <br />
              <small>wasted reduction.</small>
            </p>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SkybreakersFieryDemise;
