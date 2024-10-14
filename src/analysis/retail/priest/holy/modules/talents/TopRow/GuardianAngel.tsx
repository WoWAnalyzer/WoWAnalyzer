import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { GS_BASE_COOLDOWN_TIME, GS_MODIFIED_COOLDOWN_TIME } from '../../../constants';

// Example Log: /report/mFarpncVW9ALwTq4/7-Mythic+Zek'voz+-+Kill+(8:52)/14-Praydien
class GuardianAngel extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  guardianSpiritRemovalCount = 0;
  guardianSpiritHealCount = 0;
  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.GUARDIAN_ANGEL_TALENT);

    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.GUARDIAN_SPIRIT_TALENT),
      this._parseGsRemove,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.GUARDIAN_SPIRIT_TALENT),
      this._parseGsHeal,
    );
  }

  get guardianSpiritCastCount() {
    return this.abilityTracker.getAbility(TALENTS.GUARDIAN_SPIRIT_TALENT.id).casts;
  }

  get guardianSpiritRefreshCount() {
    return this.guardianSpiritRemovalCount - this.guardianSpiritHealCount;
  }

  get baseGuardianSpiritCastsPossible() {
    return Math.floor(this.owner.fightDuration / GS_BASE_COOLDOWN_TIME);
  }

  get gsGuardianSpiritCastsPossible() {
    return Math.floor(this.owner.fightDuration / GS_MODIFIED_COOLDOWN_TIME);
  }

  get gsValue() {
    const castDelta = this.guardianSpiritCastCount - this.baseGuardianSpiritCastsPossible;
    return castDelta >= 0 ? castDelta : 0;
  }

  _parseGsRemove() {
    this.guardianSpiritRemovalCount += 1;
  }

  _parseGsHeal() {
    this.guardianSpiritHealCount += 1;
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            You casted Guardian Spirit {this.gsValue} more times than you would have been able to
            without Guardian Angel.
            <br />
            You could have theoretically cast Guardian Spirit{' '}
            {this.gsGuardianSpiritCastsPossible - this.guardianSpiritCastCount} more times.
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(3)}
      >
        <BoringSpellValueText spell={TALENTS.GUARDIAN_ANGEL_TALENT}>
          {this.guardianSpiritRefreshCount} <small>Guardian Spirit resets</small>
          <br />
          {this.guardianSpiritHealCount} <small>Guardian Spirits consumed</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GuardianAngel;
