import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemCooldownReduction from 'parser/ui/ItemCooldownReduction';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SpellLink from 'interface/SpellLink';

const PASSING_SEASONS_CDR_MS = 15_000;

/**
 * **Passing Seasons**
 * Spec Talent
 *
 * Nature's Swiftness's cooldown is reduced by 15 sec.
 */
export default class PassingSeasons extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  private previousCastTimestamp: number | null = null;
  private effectiveCdrMs = 0;
  private wastedCdrMs = 0;
  /** Full cooldown duration of Nature's Swiftness (with the talent), used to estimate extra casts */
  private fullCooldownMs = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.PASSING_SEASONS_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.NATURES_SWIFTNESS),
      this.onNaturesSwiftnessCast,
    );
  }

  private onNaturesSwiftnessCast(event: CastEvent) {
    const fullCooldownWithTalent = this.spellUsable.fullCooldownDuration(
      SPELLS.NATURES_SWIFTNESS.id,
    );
    this.fullCooldownMs = fullCooldownWithTalent;

    if (this.previousCastTimestamp !== null) {
      const fullCooldownWithoutTalent = fullCooldownWithTalent + PASSING_SEASONS_CDR_MS;
      const castWithoutPassingSeasonsTimestamp =
        this.previousCastTimestamp + fullCooldownWithoutTalent;

      const effectiveCdr = Math.max(
        0,
        Math.min(PASSING_SEASONS_CDR_MS, castWithoutPassingSeasonsTimestamp - event.timestamp),
      );

      this.effectiveCdrMs += effectiveCdr;
      this.wastedCdrMs += PASSING_SEASONS_CDR_MS - effectiveCdr;
    }

    this.previousCastTimestamp = event.timestamp;
  }

  /** Estimated number of extra Nature's Swiftness casts gained from the effective CDR */
  get extraCasts(): number {
    return this.fullCooldownMs > 0 ? this.effectiveCdrMs / this.fullCooldownMs : 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(4)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <SpellLink spell={TALENTS_DRUID.PASSING_SEASONS_TALENT} /> is treated as the first 15s
            reduction to <SpellLink spell={SPELLS.NATURES_SWIFTNESS} />
            's base cooldown; other cooldown reductions (such as{' '}
            <SpellLink spell={TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT} />) are attributed after
            that.
            <br />
            The effective cooldown reduction is equivalent to approximately{' '}
            <strong>{this.extraCasts.toFixed(1)}</strong> extra{' '}
            <SpellLink spell={SPELLS.NATURES_SWIFTNESS} /> cast
            {this.extraCasts > 1 ? 's' : ''} over the course of the fight.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.PASSING_SEASONS_TALENT}>
          <ItemCooldownReduction
            effective={this.effectiveCdrMs}
            waste={this.wastedCdrMs > 0 ? this.wastedCdrMs : undefined}
          />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
