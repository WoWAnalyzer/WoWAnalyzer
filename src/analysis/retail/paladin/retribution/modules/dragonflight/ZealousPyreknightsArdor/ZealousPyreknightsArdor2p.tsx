import { Options } from 'parser/core/Analyzer';
import { SpellUse } from 'parser/core/SpellUsage/core';
import { TIERS } from 'game/TIERS';
import { ReactNode } from 'react';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/paladin';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
import { CastEvent } from 'parser/core/Events';

interface JudgmentCast extends CooldownTrigger<CastEvent> {
  hasExpurgation: boolean;
}

export default class ZealousPyreknightsArdor2p extends MajorCooldown<JudgmentCast> {
  constructor(options: Options) {
    super({ spell: SPELLS.T31_RET_4P }, options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T31);
  }

  get guideSubsection(): ReactNode {
    return undefined;
  }

  description(): ReactNode {
    return (
      <p>
        The 2-piece bonus incentivizes you to keep <SpellLink spell={SPELLS.EXPURGATION} /> up on
        your primary target due to <strong>30%</strong> increased damage as well as an AoE damage
        proc (<SpellLink spell={SPELLS.WRATHFUL_SANCTION} />) when the target is hit with{' '}
        <SpellLink spell={SPELLS.JUDGMENT_CAST} />.
      </p>
    );
  }

  explainPerformance(cast: JudgmentCast): SpellUse {
    throw new Error('Method not implemented.');
  }
}
