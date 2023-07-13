import { t } from '@lingui/macro';
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

const damagingCasts = [
  SPELLS.FIRE_ELEMENTAL_METEOR,
  SPELLS.FIRE_ELEMENTAL_IMMOLATE,
  SPELLS.FIRE_ELEMENTAL_FIRE_BLAST,
];

class PrimalFireElemental extends Analyzer {
  meteorCasts = 0;
  PFEcasts = 0;

  usedCasts: { [key: number]: boolean };

  damageGained = 0;
  maelstromGained = 0;

  constructor(options: Options) {
    super(options);
    this.usedCasts = {
      [SPELLS.FIRE_ELEMENTAL_METEOR.id]: false,
      [SPELLS.FIRE_ELEMENTAL_IMMOLATE.id]: false,
      [SPELLS.FIRE_ELEMENTAL_FIRE_BLAST.id]: false,
    };
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.PRIMAL_ELEMENTALIST_TALENT) &&
      !this.selectedCombatant.hasTalent(TALENTS.STORM_ELEMENTAL_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(damagingCasts),
      this.onDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.FIRE_ELEMENTAL_TALENT),
      this.onFECast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER_PET).spell(damagingCasts),
      this.onDamagingCast,
    );
  }

  get missedMeteorCasts() {
    return this.PFEcasts - this.meteorCasts;
  }

  onDamage(event: DamageEvent) {
    this.damageGained += event.amount + (event.absorbed || 0);
  }

  onFECast(event: CastEvent) {
    this.PFEcasts += 1;
  }

  onDamagingCast(event: CastEvent) {
    this.usedCasts[event.ability.guid] = true;
  }

  get unusedSpells() {
    return Object.keys(this.usedCasts).filter((spellId) => !this.usedCasts[Number(spellId)]);
  }

  get unusedSpellsSuggestionTresholds() {
    return {
      actual: this.unusedSpells.length,
      isGreaterThanOrEqual: {
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get missedMeteorSuggestionTresholds() {
    return {
      actual: this.unusedSpells.length,
      isGreaterThanOrEqual: {
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    const unusedSpellsString = this.unusedSpells
      .map((spellId) => SPELLS[Number(spellId)].name)
      .join(', ');
    when(this.unusedSpellsSuggestionTresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          {' '}
          Your Fire Elemental is not using all of it's spells. Check if immolate and Fire Blast are
          set to autocast and you are using Meteor.
        </span>,
      )
        .icon(TALENTS.FIRE_ELEMENTAL_TALENT.icon)
        .actual(
          t({
            id: 'shaman.elemental.suggestions.primalFireElemental.unusedSpells',
            message: `${formatNumber(
              this.unusedSpells.length,
            )} spell/-s not used by your Fire Elemental (${unusedSpellsString})`,
          }),
        )
        .recommended(`You should be using all spells of your Fire Elemental.`)
        .major(recommended + 1),
    );

    when(this.missedMeteorSuggestionTresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          You are not using <SpellLink spell={SPELLS.FIRE_ELEMENTAL_METEOR} /> every time you cast{' '}
          <SpellLink spell={TALENTS.FIRE_ELEMENTAL_TALENT} /> if you are using{' '}
          <SpellLink spell={TALENTS.PRIMAL_ELEMENTALIST_TALENT} />. Only wait with casting meteor if
          you wait for adds to spawn.
        </span>,
      )
        .icon(TALENTS.FIRE_ELEMENTAL_TALENT.icon)
        .actual(
          t({
            id: 'shaman.elemental.suggestions.primalFireElemental.meteorCastsMissed',
            message: `${formatNumber(this.missedMeteorCasts)} missed Meteor Casts.`,
          }),
        )
        .recommended(`You should cast Meteor every time you summon your Fire Elemental `)
        .major(recommended + 1),
    );
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL()} size="flexible">
        <>
          <BoringSpellValueText spell={TALENTS.FIRE_ELEMENTAL_TALENT}>
            <ItemDamageDone amount={this.damageGained} />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default PrimalFireElemental;
