import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import * as React from 'react';

export const BASE_REDUCTION_TIME = 1000; // ms, per talent point
const SECOND = 1000;
/**
 * Shield of the Righteous reduces the remaining cooldown on Divine Shield and Ardent Defender by 1 seconds.
 */
class ResoluteDefender extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  divineShieldReduced: number = 0;
  divineShieldWasted: number = 0;
  ardentDefenderReduced: number = 0;
  ardentDefenderWasted: number = 0;
  reductionTime: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RESOLUTE_DEFENDER_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_OF_THE_RIGHTEOUS),
      this.onCast,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WORD_OF_GLORY), this.onCast);
    this.reductionTime = this.REDUCTION_TIME(this.selectedCombatant);
  }

  REDUCTION_TIME(combatant: Combatant): number {
    return combatant.getTalentRank(TALENTS.RESOLUTE_DEFENDER_TALENT) * BASE_REDUCTION_TIME;
  }

  onCast(event: CastEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.DIVINE_SHIELD.id)) {
      const reduction = this.spellUsable.reduceCooldown(
        SPELLS.DIVINE_SHIELD.id,
        this.reductionTime,
      );
      this.divineShieldReduced += reduction;
      this.divineShieldWasted += this.reductionTime - reduction;
    } else {
      this.divineShieldWasted += this.reductionTime;
    }

    if (this.spellUsable.isOnCooldown(TALENTS.ARDENT_DEFENDER_TALENT.id)) {
      const reduction = this.spellUsable.reduceCooldown(
        TALENTS.ARDENT_DEFENDER_TALENT.id,
        this.reductionTime,
      );
      this.ardentDefenderReduced += reduction;
      this.ardentDefenderWasted += this.reductionTime - reduction;
    } else {
      this.ardentDefenderWasted += this.reductionTime;
    }
    // Handles CooldownGraphSection in Guide
    this.spellUsable.reduceCooldown(SPELLS.DIVINE_SHIELD.id, this.reductionTime, event.timestamp);
    this.spellUsable.reduceCooldown(
      TALENTS.ARDENT_DEFENDER_TALENT.id,
      this.reductionTime,
      event.timestamp,
    );
  }

  statistic(): React.ReactNode {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.RESOLUTE_DEFENDER_TALENT}>
          <SpellIcon spell={TALENTS.ARDENT_DEFENDER_TALENT} />{' '}
          {formatNumber(this.ardentDefenderReduced / SECOND)}s{' '}
          <small>CD Reduction ({formatNumber(this.ardentDefenderWasted / SECOND)}s wasted)</small>
          <br />
          <SpellIcon spell={SPELLS.DIVINE_SHIELD} />{' '}
          {formatNumber(this.divineShieldReduced / SECOND)}s{' '}
          <small>CD Reduction ({formatNumber(this.divineShieldWasted / SECOND)}s wasted)</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ResoluteDefender;
