import talents from 'common/TALENTS/warrior';
import { formatDuration } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateMaxCasts } from 'parser/core/EventCalculateLib';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import SpellUsable from '../features/SpellUsable';

const RAGE_NEEDED_FOR_PROC = 20;
const CDR_PER_PROC = 1000; // ms

// Example log: https://www.warcraftlogs.com/reports/RVwcm3bNzJaXAMqW/#fight=4&source=17
class AngerManagement extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  private totalRageSpent = 0;
  private recklessnessCDR = {
    effective: 0,
    wasted: 0,
  };
  private ravagerCDR = {
    effective: 0,
    wasted: 0,
  };

  private talentAngerManagement: boolean = false;
  private talentRecklessness: boolean = false;
  private talentRavager: boolean = false;

  constructor(options: Options) {
    super(options);

    this.talentAngerManagement = this.selectedCombatant.hasTalent(talents.ANGER_MANAGEMENT_TALENT);
    this.talentRecklessness = this.selectedCombatant.hasTalent(talents.RECKLESSNESS_TALENT);
    this.talentRavager = this.selectedCombatant.hasTalent(talents.RAVAGER_TALENT);

    this.active = this.talentAngerManagement && (this.talentRecklessness || this.talentRavager);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onPlayerCast);
  }

  onPlayerCast(event: CastEvent) {
    if (!event || !event.classResources || !event.classResources[0].cost) {
      return;
    }

    const rage = event.classResources.find((e) => e.type === RESOURCE_TYPES.RAGE.id);
    if (!rage || !rage.cost) {
      return;
    }

    const rageSpent = rage.cost / 10;
    this.totalRageSpent += rageSpent;
    const reduction = (rageSpent / RAGE_NEEDED_FOR_PROC) * CDR_PER_PROC;

    if (this.talentRavager) {
      const effectiveReduction = this.spellUsable.reduceCooldown(
        talents.RAVAGER_TALENT.id,
        reduction,
      );
      this.ravagerCDR.effective += effectiveReduction;
      this.ravagerCDR.wasted += reduction - effectiveReduction;
    }

    if (this.talentRecklessness) {
      const effectiveReduction = this.spellUsable.reduceCooldown(
        talents.RECKLESSNESS_TALENT.id,
        reduction,
      );
      this.recklessnessCDR.effective += effectiveReduction;
      this.recklessnessCDR.wasted += reduction - effectiveReduction;
    }
  }

  private extraCasts(
    /** In ms */
    baseCooldown: number,
    /** In ms */
    cooldownReduction: number,
  ) {
    const baseCasts = calculateMaxCasts(baseCooldown / 1000, this.owner.fightDuration);
    const reducedCasts = calculateMaxCasts(
      baseCooldown / 1000,
      this.owner.fightDuration + cooldownReduction,
    );
    return Math.floor(reducedCasts - baseCasts);
  }

  private extraRecklessnessCasts = () =>
    this.extraCasts(
      this.spellUsable.fullCooldownDuration(talents.RECKLESSNESS_TALENT.id),
      this.recklessnessCDR.effective,
    );

  private extraRavagerCasts = () =>
    this.extraCasts(
      this.spellUsable.fullCooldownDuration(talents.RAVAGER_TALENT.id),
      this.ravagerCDR.effective,
    );

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Spent total of <strong>{this.totalRageSpent} rage</strong>, resulting in a total
            cooldown reduction of{' '}
            {formatDuration(
              this.recklessnessCDR.effective +
                this.recklessnessCDR.wasted +
                this.ravagerCDR.effective +
                this.ravagerCDR.wasted,
            )}{' '}
            of which {formatDuration(this.recklessnessCDR.wasted + this.ravagerCDR.wasted)} was
            wasted.
            <br />
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Ability</th>
                  <th>Effective Reduction</th>
                  <th>Wasted Reduction</th>
                </tr>
              </thead>
              <tbody>
                {this.talentRecklessness && (
                  <tr>
                    <td>
                      <SpellLink spell={talents.RECKLESSNESS_TALENT.id} />
                    </td>
                    <td>{formatDuration(this.recklessnessCDR.effective)}</td>
                    <td>{formatDuration(this.recklessnessCDR.wasted)}</td>
                  </tr>
                )}
                {this.talentRavager && (
                  <tr>
                    <td>
                      <SpellLink spell={talents.RAVAGER_TALENT.id} />
                    </td>
                    <td>{formatDuration(this.ravagerCDR.effective)}</td>
                    <td>{formatDuration(this.ravagerCDR.wasted)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spell={talents.ANGER_MANAGEMENT_TALENT}>
          {this.talentRecklessness && (
            <div>
              <SpellLink spell={talents.RECKLESSNESS_TALENT.id} />
              <br />
              {this.extraRecklessnessCasts()} <small>extra casts.</small>
            </div>
          )}
          {this.talentRavager && (
            <div>
              <SpellLink spell={talents.RAVAGER_TALENT.id} />
              <br />
              {this.extraRavagerCasts()} <small>extra casts.</small>
            </div>
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AngerManagement;
