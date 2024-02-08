import { Options } from 'parser/core/Analyzer';
import { SpellUse } from 'parser/core/SpellUsage/core';
import { TIERS } from 'game/TIERS';
import { ReactNode } from 'react';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
import { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';

export default class ZealousPyreknightsArdor4p extends MajorCooldown<
  CooldownTrigger<ApplyBuffEvent | RefreshBuffEvent>
> {
  constructor(options: Options) {
    super({ spell: SPELLS.T31_RET_4P }, options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T31);
  }

  get guideSubsection(): ReactNode {
    return undefined;
  }

  description(): ReactNode {
    return (
      <p>
        The 4-piece bonus causes you to gain <SpellLink spell={SPELLS.ECHOES_OF_WRATH} /> when you
        proc <SpellLink spell={SPELLS.WRATHFUL_SANCTION} />.{' '}
        <SpellLink spell={SPELLS.ECHOES_OF_WRATH} /> then causes your next
        <SpellLink spell={TALENTS.FINAL_VERDICT_TALENT} /> or{' '}
        <SpellLink spell={TALENTS.DIVINE_STORM_TALENT} /> to echo their damage at 25% effectiveness.
        As a result, you should try to spend your <SpellLink spell={SPELLS.ECHOES_OF_WRATH} /> procs
        instead of refreshing them.
      </p>
    );
  }

  explainPerformance(cast: CooldownTrigger<ApplyBuffEvent | RefreshBuffEvent>): SpellUse {
    throw new Error('Unimplemented');
  }
}
