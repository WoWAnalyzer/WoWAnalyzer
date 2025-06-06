import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import SpellIcon from 'interface/SpellIcon';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ItemCooldownReduction from 'parser/ui/ItemCooldownReduction';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { VALIANCE_REDUCTION } from '../../../constants';

class Valiance extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  effectiveHolyArmamentsReductionMs = 0;
  wastedHolyArmamentsReductionMs = 0;

  constructor(args: Options) {
    super(args);
    this.active = this.selectedCombatant.hasTalent(TALENTS.VALIANCE_TALENT);

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.FLASH_OF_LIGHT, SPELLS.HOLY_LIGHT, SPELLS.JUDGMENT_CAST_HOLY]),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.INFUSION_OF_LIGHT.id)) {
      return;
    }

    const effectiveCdr = this.spellUsable.reduceCooldown(
      TALENTS.HOLY_ARMAMENTS_TALENT.id,
      VALIANCE_REDUCTION,
    );
    const wastedCdr = VALIANCE_REDUCTION - effectiveCdr;

    this.effectiveHolyArmamentsReductionMs += effectiveCdr;
    this.wastedHolyArmamentsReductionMs += wastedCdr;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS.VALIANCE_TALENT}>
          <div>
            <SpellIcon spell={TALENTS.HOLY_ARMAMENTS_TALENT} />{' '}
            <ItemCooldownReduction
              effective={this.effectiveHolyArmamentsReductionMs}
              {...(this.wastedHolyArmamentsReductionMs > 0 && {
                waste: this.wastedHolyArmamentsReductionMs,
              })}
            />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Valiance;
