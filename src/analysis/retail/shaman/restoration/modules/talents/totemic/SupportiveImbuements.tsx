import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import {
  healingIncreases,
  SPELL_DURATIONS,
  ABILITIES_AFFECTED_BY_HEALING_INCREASES,
} from '../../../constants';
import { SpellLink } from 'interface';

export default class SupportiveImbuements extends Analyzer {
  extraHealingDone = 0;
  durationAttributedHealing = 0;
  streamTotemHealingDone = 0;
  tidecallersHealingIncrease =
    healingIncreases.TIDECALLERS_GUARD_HEALING_INCREASE *
    (this.selectedCombatant.hasTalent(TALENTS.ENHANCED_IMBUES_TALENT)
      ? SPELL_DURATIONS.ENHANCED_IMBUES_MODIFIER
      : 1);
  //Figure out how many extra seconds is Tidecallers adding to the totems
  tidecallersBonusTotemDuration =
    SPELL_DURATIONS.TIDECALLERS_GUARD_DURATION_EXTENSION *
    (this.selectedCombatant.hasTalent(TALENTS.ENHANCED_IMBUES_TALENT)
      ? SPELL_DURATIONS.ENHANCED_IMBUES_MODIFIER
      : 1);
  //Calculate the total duration of healing totems
  healingTotemDuration =
    SPELL_DURATIONS.HEALING_STREAM_TOTEM_DURATION +
    (this.selectedCombatant.hasTalent(TALENTS.TOTEMIC_FOCUS_TALENT)
      ? SPELL_DURATIONS.TOTEMIC_FOCUS_HEALING_TOTEM_DURATION
      : 0) +
    this.tidecallersBonusTotemDuration;
  //What percentage of the total totem duration is Tidecallers Guard adding
  tidecallersTotemsPercentageIncrease =
    this.tidecallersBonusTotemDuration / this.healingTotemDuration;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SUPPORTIVE_IMBUEMENTS_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER | SELECTED_PLAYER_PET)
        .spell(ABILITIES_AFFECTED_BY_HEALING_INCREASES),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    this.extraHealingDone += calculateEffectiveHealing(event, this.tidecallersHealingIncrease);

    if (
      event.ability.guid === SPELLS.HEALING_STREAM_TOTEM_HEAL.id ||
      event.ability.guid === SPELLS.STORMSTREAM_TOTEM_HEAL.id
    ) {
      this.streamTotemHealingDone += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    this.durationAttributedHealing =
      this.streamTotemHealingDone * this.tidecallersTotemsPercentageIncrease;
    const totalHealingAttributed = this.extraHealingDone + this.durationAttributedHealing;

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <p>
              The bonus healing done can be less than what the talent says because of the way
              effective healing is calculated, if a spell overheals then healing increases are
              deducted before the baseline healing of the ability.
            </p>
            <p>
              The extra healing done from duration extensions on{' '}
              <SpellLink spell={TALENTS.HEALING_STREAM_TOTEM_RESTORATION_TALENT} /> and{' '}
              <SpellLink spell={SPELLS.STORMSTREAM_TOTEM} /> is an approximation. We sum the total
              healing done by the totems over their duration and then extract a percentage of this
              equal to the duration <SpellLink spell={TALENTS.SUPPORTIVE_IMBUEMENTS_TALENT} /> added
              to them.
            </p>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.SUPPORTIVE_IMBUEMENTS_TALENT}>
          <ItemHealingDone amount={totalHealingAttributed} />
          <hr />
          <div>
            <small>Bonus Healing Done</small>
          </div>
          <div>
            <ItemHealingDone amount={this.extraHealingDone} />
          </div>
          <div>
            <small>Healing Totem Duration Extension</small>
          </div>
          <div>
            <ItemHealingDone amount={this.durationAttributedHealing} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}
