import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import React from 'react';
import Events, { ApplyBuffEvent, CastEvent, EventType, RefreshBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { AIMED_SHOT_FOCUS_COST, SECRETS_UNBLINKING_PROC_CHANCE } from 'parser/hunter/marksmanship/constants';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import SpellLink from 'common/SpellLink';

/**
 * When you gain the Trick Shots effect, you have a 50% chance for it to not be consumed by your next Aimed Shot or Rapid Fire.
 */

class SecretsOfTheUnblinkingVigil extends Analyzer {

  static dependencies = {
    spellUsable: SpellUsable,
  };

  aimedShotRefunds = 0;
  totalPossibleAimedShotRefunds = 0;
  focusSaved = 0;
  unblinkingRefreshes = 0;
  trickShotApplications = 0;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.SECRETS_OF_THE_UNBLINKING_VIGIL_EFFECT.bonusID);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SECRETS_OF_THE_UNBLINKING_VIGIL_BUFF), this.applyOrRefreshSecretsBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SECRETS_OF_THE_UNBLINKING_VIGIL_BUFF), this.applyOrRefreshSecretsBuff);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TRICK_SHOTS_BUFF), this.applyTrickShots);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TRICK_SHOTS_BUFF), this.applyTrickShots);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AIMED_SHOT), this.castAimedShot);
  }

  applyOrRefreshSecretsBuff(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.AIMED_SHOT.id)) {
      this.spellUsable.endCooldown(SPELLS.AIMED_SHOT.id, false, event.timestamp);
      this.aimedShotRefunds += 1;
    }
    this.totalPossibleAimedShotRefunds += 1;

    if (event.type === EventType.RefreshBuff) {
      this.unblinkingRefreshes += 1;
    }
  }

  applyTrickShots(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.trickShotApplications += 1;
  }

  castAimedShot(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SECRETS_OF_THE_UNBLINKING_VIGIL_BUFF.id)) {
      return;
    }
    const resource = event.classResources?.find(resource => resource.type === RESOURCE_TYPES.FOCUS.id);
    if (!resource) {
      return;
    }
    this.focusSaved += AIMED_SHOT_FOCUS_COST;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={(
          <>
            You refreshed the Unblinking Vigil buff {this.unblinkingRefreshes} {this.unblinkingRefreshes === 1 ? 'time' : 'times'}
          </>
        )}
        dropdown={(
          <>
            <div style={{ padding: '8px' }}>
              {plotOneVariableBinomChart(this.totalPossibleAimedShotRefunds, this.trickShotApplications, SECRETS_UNBLINKING_PROC_CHANCE)}
              <p>Likelihood of getting <em>exactly</em> as many procs as estimated on a fight given your number of <SpellLink id={SPELLS.TRICK_SHOTS_BUFF.id} /> applications.</p>
            </div>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.SECRETS_OF_THE_UNBLINKING_VIGIL_EFFECT}>
          {this.aimedShotRefunds}/{this.totalPossibleAimedShotRefunds} <small>Aimed Shot refunds</small>
          <br />
          {this.focusSaved} <small>Focus saved</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SecretsOfTheUnblinkingVigil;
