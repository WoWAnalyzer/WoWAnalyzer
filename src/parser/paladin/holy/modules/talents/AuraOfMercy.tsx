import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

class AuraOfMercy extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected readonly abilityTracker!: AbilityTracker;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.AURA_OF_MERCY_TALENT.id);
  }

  get healing() {
    const abilityTracker = this.abilityTracker;
    const getAbility = (spellId: number) => abilityTracker.getAbility(spellId);

    return (
      getAbility(SPELLS.AURA_OF_MERCY_HEAL.id).healingEffective +
      getAbility(SPELLS.AURA_OF_MERCY_HEAL.id).healingAbsorbed
    );
  }
  get hps() {
    return (this.healing / this.owner.fightDuration) * 1000;
  }

  get suggestionThresholds() {
    return {
      actual: this.hps,
      isLessThan: {
        minor: 2500,
        average: 2000,
        major: 1500,
      },
    };
  }

  suggestions(when: any) {
    when(this.suggestionThresholds).addSuggestion((suggest: any, actual: any, recommended: any) => {
      return suggest(
        <Trans>
          The healing done by your <SpellLink id={SPELLS.AURA_OF_MERCY_TALENT.id} /> is low. Try to
          find a better moment to cast it or consider changing to{' '}
          <SpellLink id={SPELLS.DEVOTION_AURA_TALENT.id} /> which can be more reliable and generally
          offers more throughput.
        </Trans>,
      )
        .icon(SPELLS.AURA_OF_MERCY_TALENT.icon)
        .actual(<Trans>{formatNumber(actual)} HPS</Trans>)
        .recommended(<Trans>&gt;{formatNumber(recommended)} HPS is recommended</Trans>);
    });
  }
  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL(60)} size="small">
        <BoringSpellValue
          spell={SPELLS.AURA_OF_MERCY_TALENT}
          value={<Trans>{formatNumber(this.hps)} HPS</Trans>}
          label={<Trans>Healing done</Trans>}
        />
      </Statistic>
    );
  }
}

export default AuraOfMercy;
