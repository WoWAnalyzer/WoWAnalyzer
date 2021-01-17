import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { PHOENIX_FLAMES_MAX_CHARGES } from 'parser/mage/shared/constants';
import { Trans } from '@lingui/macro';

const debug = false;

class CombustionCharges extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };
  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;

  hasFlameOn: boolean;
  lowPhoenixFlamesCharges = 0;
  lowFireBlastCharges = 0;
  badCast = false;

  constructor(options: Options) {
    super(options);
    this.hasFlameOn = this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION), this.onCombustion);
  }

  //When Combustion is cast, check to see how many charges of Fire Blast and Phoenix Flames are available. If there is less than (Max Charges - 1) then its a bad Combustion cast.
  onCombustion(event: CastEvent) {
    const fireBlastCharges = this.spellUsable.chargesAvailable(SPELLS.FIRE_BLAST.id);
    const phoenixFlamesCharges = (this.spellUsable.chargesAvailable(SPELLS.PHOENIX_FLAMES.id) || 0);
    const FIRE_BLAST_THRESHOLD = this.hasFlameOn ? 2 : 1;
    this.badCast = false;

    if (fireBlastCharges < FIRE_BLAST_THRESHOLD) {
      this.lowFireBlastCharges += 1;
      this.badCast = true;
      debug && this.log("Fire Blast Charges: " + fireBlastCharges + " Target: " + FIRE_BLAST_THRESHOLD);
    }

    if (phoenixFlamesCharges < PHOENIX_FLAMES_MAX_CHARGES - 1) {
      this.lowPhoenixFlamesCharges += 1;
      this.badCast = true;
      debug && this.log("Phoenix Flames Charges: " + phoenixFlamesCharges);
    }

    if (this.badCast) {
      this.flagTimeline(event);
    }
  }

  flagTimeline(event: CastEvent) {
    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason = `This Combustion was cast with a low amount of Fire Blast and/or Phoenix Flames charges. In order to get the most out of your Combustion casts, ensure that you have at least ${this.hasFlameOn ? '2' : '1' } Fire Blast charges and 2 Phoenix Flames charges. `;
  }

  get phoenixFlamesChargeUtil() {
    return 1 - (this.lowPhoenixFlamesCharges / this.abilityTracker.getAbility(SPELLS.COMBUSTION.id).casts);
  }

  get fireBlastChargeUtil() {
    return 1 - (this.lowFireBlastCharges / this.abilityTracker.getAbility(SPELLS.COMBUSTION.id).casts);
  }

  get phoenixFlamesThresholds() {
    return {
      actual: this.phoenixFlamesChargeUtil,
      isLessThan: {
        minor: 1,
        average: .65,
        major: .45,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get fireBlastThresholds() {
    return {
      actual: this.fireBlastChargeUtil,
      isLessThan: {
        minor: 1,
        average: .65,
        major: .45,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.phoenixFlamesThresholds)
    .addSuggestion((suggest, actual, recommended) => suggest(<>You cast <SpellLink id={SPELLS.COMBUSTION.id} /> {this.lowPhoenixFlamesCharges} times with less than 2 charges of <SpellLink id={SPELLS.PHOENIX_FLAMES.id} />. Make sure you are saving at least 2 charges while Combustion is on cooldown so you can get as many <SpellLink id={SPELLS.HOT_STREAK.id} /> procs as possible before Combustion ends.</>)
        .icon(SPELLS.COMBUSTION.icon)
        .actual(<Trans id="mage.fire.suggestions.combustionCharges.phoenixFlames.utilization">{formatPercentage(this.phoenixFlamesChargeUtil)}% Utilization</Trans>)
        .recommended(`${formatPercentage(recommended)} is recommended`));
    when(this.fireBlastThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You cast <SpellLink id={SPELLS.COMBUSTION.id} /> {this.lowFireBlastCharges} times with less than {this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? '2' : '1' } charges of <SpellLink id={SPELLS.FIRE_BLAST.id} />. Make sure you are saving at least {this.selectedCombatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) ? '2' : '1' } charges while Combustion is on cooldown so you can get as many <SpellLink id={SPELLS.HOT_STREAK.id} /> procs as possible before Combustion ends.</>)
          .icon(SPELLS.COMBUSTION.icon)
          .actual(<Trans id="mage.fire.suggestions.combustionCharges.flameOn.utilization">{formatPercentage(this.fireBlastChargeUtil)}% Utilization</Trans>)
          .recommended(`${formatPercentage(recommended)} is recommended`));
  }
}
export default CombustionCharges;
