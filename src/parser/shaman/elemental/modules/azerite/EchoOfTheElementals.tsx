import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, {
  SELECTED_PLAYER,
  SELECTED_PLAYER_PET,
} from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';
import Statistic from 'interface/statistics/Statistic';
import { formatNumber } from 'common/format';
import { Trans } from '@lingui/macro';

class EchoOfTheElementals extends Analyzer {
  protected procs = 0;
  protected damageGained = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(
      SPELLS.ECHO_OF_THE_ELEMENTALS.id,
    );

    let summonSpell = SPELLS.EMBER_ELEMENTAL_SUMMON;
    let damageSpells = [SPELLS.EMBER_BLAST];
    if (this.selectedCombatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id)) {
      summonSpell = SPELLS.SPARK_ELEMENTAL_SUMMON;
      damageSpells = [SPELLS.SHOCKING_BLAST];
    }
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(summonSpell),
      this.onSummon,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(damageSpells),
      this.onPetDamage,
    );
  }

  protected onSummon() {
    this.procs += 1;
  }

  protected onPetDamage(event: DamageEvent) {
    this.damageGained += event.amount;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL()} size="small">
        <BoringSpellValue
          spell={SPELLS.ECHO_OF_THE_ELEMENTALS.id}
          value={formatNumber(this.damageGained)}
          label={<Trans>Damage done</Trans>}
        />
      </Statistic>
    );
  }
}

export default EchoOfTheElementals;
