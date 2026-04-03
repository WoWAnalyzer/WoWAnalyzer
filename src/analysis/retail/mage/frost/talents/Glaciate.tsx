import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import React from 'react';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatDurationMillisMinSec } from 'common/format';
import { SpellLink } from 'interface';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import IceLance from 'analysis/retail/mage/frost/core/IceLance';

const MS_PER_FREEZING_STACK = 100;

class Glaciate extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    iceLance: IceLance,
  };
  protected spellUsable!: SpellUsable;
  protected iceLance!: IceLance;

  totalReduction = 0;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasTalent(TALENTS.GLACIATE_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ICE_LANCE_DAMAGE),
      this.onIceLanceDamage,
    );
  }

  onIceLanceDamage(event: DamageEvent) {
    const linkedCast: CastEvent | undefined = GetRelatedEvent(event, 'SpellCast');
    if (!linkedCast) return;

    const shattered =
      this.iceLance.castsByTimestamp.get(linkedCast.timestamp)?.totalShatteredStacks ?? 0;

    if (shattered > 0 && this.spellUsable.isOnCooldown(TALENTS.RAY_OF_FROST_TALENT.id)) {
      this.totalReduction += this.spellUsable.reduceCooldown(
        TALENTS.RAY_OF_FROST_TALENT.id,
        MS_PER_FREEZING_STACK * shattered,
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
        <TalentSpellText talent={TALENTS.GLACIATE_TALENT}>
          {formatDurationMillisMinSec(this.totalReduction)}{' '}
          <small>
            <SpellLink spell={TALENTS.RAY_OF_FROST_TALENT} /> CDR
          </small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Glaciate;
