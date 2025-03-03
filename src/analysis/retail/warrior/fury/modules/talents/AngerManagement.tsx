import { RAGE_SCALE_FACTOR } from 'analysis/retail/warrior/shared/modules/normalizers/rage/constants';
import SPELLS from 'common/SPELLS/warrior';
import TALENTS from 'common/TALENTS/warrior';
import { formatDuration, formatThousands } from 'common/format';
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

// Example log: https://www.warcraftlogs.com/reports/NcjYVmHktFQ9L6CK/#fight=109&source=654
class AngerManagement extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  private totalRageSpent = 0;
  private recklessnessCDR = {
    effective: 0,
    wasted: 0,
  };
  private ravagerCDR = {
    effective: 0,
    wasted: 0,
  };
  private bladestormCDR = {
    effective: 0,
    wasted: 0,
  };

  private talentAngerManagement: boolean = false;
  private talentRecklessness: boolean = false;
  private talentRavager: boolean = false;
  private talentBladestorm: boolean = false;

  constructor(options: Options) {
    super(options);

    this.talentAngerManagement = this.selectedCombatant.hasTalent(TALENTS.ANGER_MANAGEMENT_TALENT);
    this.talentRecklessness = this.selectedCombatant.hasTalent(TALENTS.RECKLESSNESS_TALENT);
    this.talentRavager = this.selectedCombatant.hasTalent(TALENTS.RAVAGER_TALENT);
    this.talentBladestorm = this.selectedCombatant.hasTalent(TALENTS.BLADESTORM_TALENT);

    this.active =
      this.talentAngerManagement &&
      (this.talentRecklessness || this.talentRavager || this.talentBladestorm);

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

    const rageSpent = rage.cost * RAGE_SCALE_FACTOR;
    this.totalRageSpent += rageSpent;
    const reduction = (rageSpent / RAGE_NEEDED_FOR_PROC) * CDR_PER_PROC;

    if (this.talentRavager) {
      const effectiveReduction = this.deps.spellUsable.reduceCooldown(
        TALENTS.RAVAGER_TALENT.id,
        reduction,
      );
      this.ravagerCDR.effective += effectiveReduction;
      this.ravagerCDR.wasted += reduction - effectiveReduction;
    }

    if (this.talentRecklessness) {
      const effectiveReduction = this.deps.spellUsable.reduceCooldown(
        TALENTS.RECKLESSNESS_TALENT.id,
        reduction,
      );
      this.recklessnessCDR.effective += effectiveReduction;
      this.recklessnessCDR.wasted += reduction - effectiveReduction;
    }

    if (this.talentBladestorm) {
      const effectiveReduction = this.deps.spellUsable.reduceCooldown(
        SPELLS.BLADESTORM.id,
        reduction,
      );
      this.bladestormCDR.effective += effectiveReduction;
      this.bladestormCDR.wasted += reduction - effectiveReduction;
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
      this.deps.spellUsable.fullCooldownDuration(TALENTS.RECKLESSNESS_TALENT.id),
      this.recklessnessCDR.effective,
    );

  private extraRavagerCasts = () =>
    this.extraCasts(
      this.deps.spellUsable.fullCooldownDuration(TALENTS.RAVAGER_TALENT.id),
      this.ravagerCDR.effective,
    );

  private extraBladestormCasts = () =>
    this.extraCasts(
      this.deps.spellUsable.fullCooldownDuration(SPELLS.BLADESTORM.id),
      this.bladestormCDR.effective,
    );

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Spent total of <strong>{formatThousands(this.totalRageSpent)} rage</strong>, resulting
            in a total cooldown reduction of{' '}
            {formatDuration(
              this.recklessnessCDR.effective +
                this.recklessnessCDR.wasted +
                this.ravagerCDR.effective +
                this.ravagerCDR.wasted +
                this.bladestormCDR.effective +
                this.bladestormCDR.wasted,
            )}{' '}
            of which{' '}
            {formatDuration(
              this.recklessnessCDR.wasted + this.ravagerCDR.wasted + this.bladestormCDR.wasted,
            )}{' '}
            was wasted.
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
                      <SpellLink spell={TALENTS.RECKLESSNESS_TALENT.id} />
                    </td>
                    <td>{formatDuration(this.recklessnessCDR.effective)}</td>
                    <td>{formatDuration(this.recklessnessCDR.wasted)}</td>
                  </tr>
                )}
                {this.talentRavager && (
                  <tr>
                    <td>
                      <SpellLink spell={TALENTS.RAVAGER_TALENT.id} />
                    </td>
                    <td>{formatDuration(this.ravagerCDR.effective)}</td>
                    <td>{formatDuration(this.ravagerCDR.wasted)}</td>
                  </tr>
                )}
                {this.talentBladestorm && (
                  <tr>
                    <td>
                      <SpellLink spell={TALENTS.BLADESTORM_TALENT.id} />
                    </td>
                    <td>{formatDuration(this.bladestormCDR.effective)}</td>
                    <td>{formatDuration(this.bladestormCDR.wasted)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.ANGER_MANAGEMENT_TALENT}>
          {this.talentRecklessness && (
            <div>
              <SpellLink spell={TALENTS.RECKLESSNESS_TALENT.id} style={{ fontSize: 16 }} />
              <br />
              {this.extraRecklessnessCasts()} <small>extra casts</small>
            </div>
          )}
          {this.talentRavager && (
            <div>
              <SpellLink spell={TALENTS.RAVAGER_TALENT.id} style={{ fontSize: 16 }} />
              <br />
              {this.extraRavagerCasts()} <small>extra casts</small>
            </div>
          )}
          {this.talentBladestorm && (
            <div>
              <SpellLink spell={TALENTS.BLADESTORM_TALENT.id} style={{ fontSize: 16 }} />
              <br />
              {this.extraBladestormCasts()} <small>extra casts</small>
            </div>
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AngerManagement;
