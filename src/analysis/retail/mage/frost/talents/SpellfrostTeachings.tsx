import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { formatDurationMillisMinSec } from 'common/format';
import { SpellLink } from 'interface';
import React from 'react';

const REDUCTION_MS = 250;

class SpellfrostTeachings extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  totalReduction = 0;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SPELLFROST_TEACHINGS_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FROST_SPLINTER),
      this.onSplinterDamage,
    );
  }

  onSplinterDamage() {
    if (this.spellUsable.isOnCooldown(TALENTS.FROZEN_ORB_TALENT.id)) {
      this.totalReduction += this.spellUsable.reduceCooldown(
        TALENTS.FROZEN_ORB_TALENT.id,
        REDUCTION_MS,
      );
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.UNIMPORTANT()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <TalentSpellText talent={TALENTS.SPELLFROST_TEACHINGS_TALENT}>
          {formatDurationMillisMinSec(this.totalReduction)}{' '}
          <small>
            <SpellLink spell={TALENTS.FROZEN_ORB_TALENT} /> CDR
          </small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SpellfrostTeachings;
