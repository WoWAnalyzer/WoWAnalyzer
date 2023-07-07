import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const damagingCasts = [SPELLS.EYE_OF_THE_STORM, SPELLS.WIND_GUST, SPELLS.CALL_LIGHTNING];
const CALL_LIGHTNING_BUFF_DURATION = 15000;

class PrimalStormElemental extends Analyzer {
  eotsCasts = 0;
  pseCasts = 0;
  lastCLCastTimestamp = 0;

  usedCasts: { [key: number]: boolean };

  damageGained = 0;
  maelstromGained = 0;
  badCasts = 0;

  constructor(options: Options) {
    super(options);
    this.usedCasts = {
      [SPELLS.EYE_OF_THE_STORM.id]: false,
      [SPELLS.WIND_GUST.id]: false,
      [SPELLS.CALL_LIGHTNING.id]: false,
    };
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.PRIMAL_ELEMENTALIST_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS.STORM_ELEMENTAL_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER_PET).spell(damagingCasts), this.onPetCast);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(damagingCasts),
      this.onPetDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.STORM_ELEMENTAL_TALENT),
      this.onPSECast,
    );
  }

  get unusedSpells() {
    return Object.keys(this.usedCasts).filter((spellId) => !this.usedCasts[Number(spellId)]);
  }

  get unusedSpellsSuggestionTresholds() {
    return {
      actual: this.unusedSpells.length,
      isGreaterThanOrEqual: {
        minor: 1,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get badCastsSuggestionTresholds() {
    return {
      actual: this.unusedSpells.length,
      isGreaterThanOrEqual: {
        minor: 1,
        major: 5,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  onPSECast(event: CastEvent) {
    this.pseCasts += 1;
  }

  onPetCast(event: CastEvent) {
    this.usedCasts[event.ability.guid] = true;
  }

  onPetDamage(event: DamageEvent) {
    this.damageGained += event.amount + (event.absorbed || 0);

    if (event.ability.guid !== SPELLS.CALL_LIGHTNING.id) {
      if (event.timestamp > this.lastCLCastTimestamp + CALL_LIGHTNING_BUFF_DURATION) {
        this.badCasts += 1;
      }
    }
  }

  suggestions(when: When) {
    const unusedSpellsString = this.unusedSpells
      .map((spellId) => SPELLS[Number(spellId)].name)
      .join(', ');

    when(this.unusedSpellsSuggestionTresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          {' '}
          Your Storm Elemental is not using all of it's spells. Check if Wind Gust and Call
          Lightning are set to autocast and you are using Eye Of The Storm.
        </span>,
      )
        .icon(TALENTS.STORM_ELEMENTAL_TALENT.icon)
        .actual(
          `${formatNumber(actual)} spells not used by your Storm Elemental (${unusedSpellsString})`,
        )
        .recommended(`You should be using all spells of your Storm Elemental.`),
    );

    when(this.badCastsSuggestionTresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          You are not using <SpellLink spell={SPELLS.CALL_LIGHTNING} /> on cooldown.
        </span>,
      )
        .icon(TALENTS.STORM_ELEMENTAL_TALENT.icon)
        .actual(
          `${formatNumber(
            actual,
          )} casts done by your Storm Elemental without the "Call Lightning"-Buff.}`,
        )
        .recommended(`You should be recasting "Call Lightning" before the buff drops off.`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        tooltip={
          <>
            Your Storm Elemental cast {formatNumber(this.badCasts)} spells without{' '}
            <SpellLink spell={SPELLS.CALL_LIGHTNING} />
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.STORM_ELEMENTAL_TALENT.id}>
          <ItemDamageDone amount={this.damageGained} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PrimalStormElemental;
