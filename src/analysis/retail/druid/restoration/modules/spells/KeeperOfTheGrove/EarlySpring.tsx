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

const CDR_PER_CAST_MS = 1000;

type SpellCdrData = {
  previousCastTimestamp: number | null;
  effectiveCdrMs: number;
  wastedCdrMs: number;
};

/**
 * **Early Spring**
 * Hero Talent - Keeper of the Grove
 *
 * Swiftmend and Wild Growth cooldowns reduced by 1 sec.
 */
export default class EarlySpring extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  private swiftmendData: SpellCdrData = {
    previousCastTimestamp: null,
    effectiveCdrMs: 0,
    wastedCdrMs: 0,
  };

  private wildGrowthData: SpellCdrData = {
    previousCastTimestamp: null,
    effectiveCdrMs: 0,
    wastedCdrMs: 0,
  };

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.EARLY_SPRING_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND),
      this.onSwiftmendCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
      this.onWildGrowthCast,
    );
  }

  private trackSpellCdr(event: CastEvent, spellId: number, data: SpellCdrData) {
    if (data.previousCastTimestamp !== null) {
      const fullCooldownWithTalent = this.spellUsable.fullCooldownDuration(spellId);
      const fullCooldownWithoutTalent = fullCooldownWithTalent + CDR_PER_CAST_MS;
      const castDurationMs = event.channel?.duration ?? 0;
      const castWithoutEarlySpringTimestamp =
        data.previousCastTimestamp + fullCooldownWithoutTalent + castDurationMs;

      const effectiveCdr = Math.max(
        0,
        Math.min(CDR_PER_CAST_MS, castWithoutEarlySpringTimestamp - event.timestamp),
      );

      data.effectiveCdrMs += effectiveCdr;
      data.wastedCdrMs += CDR_PER_CAST_MS - effectiveCdr;
    }

    data.previousCastTimestamp = event.timestamp;
  }

  private onSwiftmendCast(event: CastEvent) {
    this.trackSpellCdr(event, SPELLS.SWIFTMEND.id, this.swiftmendData);
  }

  private onWildGrowthCast(event: CastEvent) {
    this.trackSpellCdr(event, SPELLS.WILD_GROWTH.id, this.wildGrowthData);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <SpellLink spell={TALENTS_DRUID.EARLY_SPRING_TALENT} /> is treated as the first 1s
            reduction to base cooldowns; other cooldown reductions are attributed after that.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.EARLY_SPRING_TALENT}>
          <SpellLink spell={SPELLS.SWIFTMEND} />{' '}
          <ItemCooldownReduction
            effective={this.swiftmendData.effectiveCdrMs}
            waste={this.swiftmendData.wastedCdrMs}
          />
          <br />
          <SpellLink spell={SPELLS.WILD_GROWTH} />{' '}
          <ItemCooldownReduction
            effective={this.wildGrowthData.effectiveCdrMs}
            waste={this.wildGrowthData.wastedCdrMs}
          />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
