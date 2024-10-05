import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class SummonGargoyleBuffs extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  private totalGargoyleCasts: number = 0; // Number of fully completed gargoyles used.
  private currentGargoyleRunicPower: number = 0; // Keeps track of Runic Power used on current active Gargoyle.
  private totalGargoyleRunicPower: number = 0; // Total Runic Power spend on all fully completed Gargoyles.
  private gargoyleActive: boolean = false; // Boolean to keep track of Gargoyle being active or not.
  private gargoyleEnd: number = 0; // Keeps track of when Gargoyle should end.

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.SUMMON_GARGOYLE_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.DEATH_COIL, SPELLS.EPIDEMIC, SPELLS.DEATH_STRIKE_HEAL]),
      this.onBuffCast,
    );

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([TALENTS.SUMMON_GARGOYLE_TALENT, SPELLS.DARK_ARBITER_TALENT_GLYPH]),
      this.onGargCast,
    );
  }

  get averageBuffAmount() {
    return Math.round(this.totalGargoyleRunicPower / this.totalGargoyleCasts);
  }

  onBuffCast(event: CastEvent) {
    if (!this.gargoyleActive) {
      return;
    }
    if (event.timestamp > this.gargoyleEnd) {
      /* Gargoyle is active and has been up for more than 25 seconds ->
  A full Gargoyle has just ended. Add temporary Runic Power to total,
  set gargoyleActive to false iterate number of Gargoyle casts by one
  and reset the current Gargoyle Runic Power counter.*/
      this.gargoyleActive = false;
      this.totalGargoyleRunicPower += this.currentGargoyleRunicPower;
      this.currentGargoyleRunicPower = 0;
      this.totalGargoyleCasts += 1;
    } else if (event.ability.guid === SPELLS.DEATH_STRIKE_HEAL.id) {
      this.currentGargoyleRunicPower += 45;
    } else {
      this.currentGargoyleRunicPower += 30;
    }
  }

  onGargCast(event: CastEvent) {
    this.gargoyleActive = true;
    this.gargoyleEnd = event.timestamp + 25000;
  }

  suggestions(when: When) {
    // Buffing the gargoyle by at least 350 Runic Power on average is recommended
    when(this.averageBuffAmount)
      .isLessThan(400)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            You are buffing <SpellLink spell={TALENTS.SUMMON_GARGOYLE_TALENT} /> with too few{' '}
            <SpellLink spell={SPELLS.DEATH_COIL} />
            s. Try to prioritise generating Runic Power and spending it on as many{' '}
            <SpellLink spell={SPELLS.DEATH_COIL} />s as possible once{' '}
            <SpellLink spell={TALENTS.SUMMON_GARGOYLE_TALENT} /> has been used!
          </span>,
        )
          .icon(TALENTS.SUMMON_GARGOYLE_TALENT.icon)
          .actual(
            defineMessage({
              id: 'deathknight.unholy.suggestions.summongargoyle.buffing',
              message: `Gargoyle was buffed with an average ${this.averageBuffAmount} Runic Power`,
            }),
          )
          .recommended(`${recommended} is recommended`)
          .regular(recommended - 30)
          .major(recommended - 60),
      );
  }

  statistic() {
    return (
      <Statistic
        tooltip={`You buffed ${this.totalGargoyleCasts} Gargoyle(s) with an average of ${this.averageBuffAmount} Runic Power.`}
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.SUMMON_GARGOYLE_TALENT.id}>
          <>
            {this.averageBuffAmount} <small>Runic Power buffed on averge</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SummonGargoyleBuffs;
