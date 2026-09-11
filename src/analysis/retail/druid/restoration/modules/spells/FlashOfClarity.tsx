import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import { getHardcast } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { buffedByClearcast } from 'analysis/retail/druid/restoration/normalizers/ClearcastingNormalizer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import { SpellLink } from 'interface';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';

const FLASH_OF_CLARITY_HEALING_INCREASE = 0.4;

/**
 * **Flash of Clarity**
 * Spec Talent
 *
 * Omen of Clarity increases Regrowth's direct healing by 40%.
 * Only the direct (non-tick) heal is buffed - the HoT ticks are not affected.
 */
class FlashOfClarity extends Analyzer {
  /** Direct Regrowth healing attributable to Flash of Clarity */
  directHealing = 0;
  /** Direct Regrowth overhealing attributable to Flash of Clarity */
  directOverhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.FLASH_OF_CLARITY_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onRegrowthHeal,
    );
  }

  onRegrowthHeal(event: HealEvent) {
    // Flash of Clarity only buffs the direct heal, not the HoT ticks.
    if (event.tick) {
      return;
    }
    const cast = getHardcast(event);
    if (cast && buffedByClearcast(cast)) {
      this.directHealing += calculateEffectiveHealing(event, FLASH_OF_CLARITY_HEALING_INCREASE);
      this.directOverhealing += calculateOverhealing(event, FLASH_OF_CLARITY_HEALING_INCREASE);
    }
  }

  get totalHealing() {
    return this.directHealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(4)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            This is the extra healing from the {FLASH_OF_CLARITY_HEALING_INCREASE * 100}% Regrowth
            healing increase while consuming <SpellLink spell={SPELLS.CLEARCASTING_BUFF} />. Only
            the direct heal is buffed; the HoT ticks are not affected.
            <br />
            <strong>
              Overhealing: {formatOverhealing(this.directOverhealing, this.directHealing)}
            </strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.FLASH_OF_CLARITY_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FlashOfClarity;
