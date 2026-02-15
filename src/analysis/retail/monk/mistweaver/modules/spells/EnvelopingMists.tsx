import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import {
  ABILITIES_AFFECTED_BY_HEALING_INCREASES,
  ENVELOPING_MIST_INCREASE,
  MISTWRAP_INCREASE,
} from '../../constants';
import { isFromEnvelopingMist } from '../../normalizers/CastLinkNormalizer';
import HotTrackerMW from '../core/HotTrackerMW';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { TooltipElement } from 'interface/Tooltip';
import SpellLink from 'interface/SpellLink';

const UNAFFECTED_SPELLS: number[] = [TALENTS_MONK.ENVELOPING_MIST_TALENT.id];

class EnvelopingMists extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    hotTracker: HotTrackerMW,
  };
  healing = 0;
  mistyPeaksHealing = 0;
  casts = 0;
  healingIncreaseFromHardcast = 0;
  healingIncreaseFromMistyPeaks = 0;
  healingIncrease = 0;
  evmHealingIncrease = 0;
  gustsHealing = 0;
  protected combatants!: Combatants;
  protected hotTracker!: HotTrackerMW;

  constructor(options: Options) {
    super(options);
    this.evmHealingIncrease = this.selectedCombatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT)
      ? ENVELOPING_MIST_INCREASE + MISTWRAP_INCREASE
      : ENVELOPING_MIST_INCREASE;
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.onCast,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleEnvelopingMistBuff);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.handleEnvelopingMist,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.masteryEnvelopingMist,
    );
  }

  onCast(event: CastEvent) {
    this.casts += 1;
  }

  masteryEnvelopingMist(event: HealEvent) {
    if (isFromEnvelopingMist(event)) {
      this.gustsHealing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  handleEnvelopingMist(event: HealEvent) {
    const hot = this.hotTracker.getHot(event, TALENTS_MONK.ENVELOPING_MIST_TALENT.id);
    if (!hot) return;
    if (this.hotTracker.fromMistyPeaks(hot)) {
      this.mistyPeaksHealing += (event.amount || 0) + (event.absorbed || 0);
    }

    if (this.hotTracker.fromHardcast(hot)) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  handleEnvelopingMistBuff(event: HealEvent) {
    const hot = this.hotTracker.getHot(event, TALENTS_MONK.ENVELOPING_MIST_TALENT.id);
    if (
      UNAFFECTED_SPELLS.includes(event.ability.guid) ||
      !ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(event.ability.guid) ||
      !hot
    ) {
      return;
    }
    if (this.hotTracker.fromMistyPeaks(hot)) {
      this.healingIncreaseFromMistyPeaks += calculateEffectiveHealing(
        event,
        this.evmHealingIncrease,
      );
    }

    if (this.hotTracker.fromHardcast(hot)) {
      this.healingIncreaseFromHardcast += calculateEffectiveHealing(event, this.evmHealingIncrease);
    }

    this.healingIncrease += calculateEffectiveHealing(event, this.evmHealingIncrease);
  }

  get healingPerCast() {
    return (this.healing + this.healingIncreaseFromHardcast) / this.casts;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.THEORYCRAFT}
        tooltip={
          <>
            This is the effective healing contributed by the Enveloping Mist buff.
            <ul>
              <li>Direct healing from hardcasts: {formatNumber(this.healing)}</li>
              <li>
                Healing increase from hardcasts: {formatNumber(this.healingIncreaseFromHardcast)}
              </li>
              {this.selectedCombatant.hasTalent(TALENTS_MONK.MISTY_PEAKS_TALENT) && (
                <>
                  <li>
                    Direct healing from <SpellLink spell={TALENTS_MONK.MISTY_PEAKS_TALENT} />:{' '}
                    {formatNumber(this.mistyPeaksHealing)}
                  </li>
                  <li>
                    Healing increase from <SpellLink spell={TALENTS_MONK.MISTY_PEAKS_TALENT} />:{' '}
                    {formatNumber(this.healingIncreaseFromMistyPeaks)}
                  </li>
                </>
              )}
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.ENVELOPING_MIST_TALENT}>
          <div>
            <TooltipElement
              content={<>Average amount of direct healing and bonus healing gained per cast</>}
            >
              {formatNumber(this.healingPerCast)} <small>healing per cast</small>
            </TooltipElement>
            <br />
            {formatNumber(this.healingIncrease)} <small>total healing from the buff</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default EnvelopingMists;
