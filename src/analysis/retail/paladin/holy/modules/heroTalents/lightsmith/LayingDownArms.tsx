import { getLayOnHandsSpell } from 'analysis/retail/paladin/shared/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import SpellIcon from 'interface/SpellIcon';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { RemoveBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ItemCooldownReduction from 'parser/ui/ItemCooldownReduction';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { LAYING_DOWN_ARMS_REDUCTION } from '../../../constants';

class LayingDownArms extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  effectiveLayOnHandsReductionMs = 0;
  wastedLayOnHandsReductionMs = 0;

  constructor(args: Options) {
    super(args);
    this.active = this.selectedCombatant.hasTalent(TALENTS.LAYING_DOWN_ARMS_TALENT);

    this.addEventListener(
      Events.removebuff
        .to(SELECTED_PLAYER)
        .spell([SPELLS.HOLY_BULWARK_BUFF, SPELLS.SACRED_WEAPON_BUFF]),
      this.removeBuff,
    );
  }

  removeBuff(event: RemoveBuffEvent) {
    const effectiveCdr = this.spellUsable.reduceCooldown(
      getLayOnHandsSpell(this.selectedCombatant).id,
      LAYING_DOWN_ARMS_REDUCTION,
    );
    const wastedCdr = LAYING_DOWN_ARMS_REDUCTION - effectiveCdr;

    this.effectiveLayOnHandsReductionMs += effectiveCdr;
    this.wastedLayOnHandsReductionMs += wastedCdr;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS.LAYING_DOWN_ARMS_TALENT}>
          <div>
            <SpellIcon spell={TALENTS.LAY_ON_HANDS_TALENT} />{' '}
            <ItemCooldownReduction
              effective={this.effectiveLayOnHandsReductionMs}
              {...(this.wastedLayOnHandsReductionMs > 0 && {
                waste: this.wastedLayOnHandsReductionMs,
              })}
            />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default LayingDownArms;
