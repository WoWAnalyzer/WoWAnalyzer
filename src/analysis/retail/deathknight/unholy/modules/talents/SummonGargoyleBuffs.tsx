import { t } from '@lingui/macro';
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

  totalGargoyleCasts = 0; // Number of fully completed gargoyles used
  currentGargoyleRunicPower = 0; // Keeps track of Runic Power used on current active Gargoyle
  totalGargoyleRunicPower = 0; // Total Runic Power spend on all fully completed Gargoyles
  gargoyleActive = false; // Boolean to keep track of Gargoyle being active or not

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
        .spell([SPELLS.SUMMON_GARGOYLE, SPELLS.DARK_ARBITER_TALENT_GLYPH]),
      this.onGargCast,
    );
  }

  onBuffCast(event: CastEvent) {
    if (
      this.gargoyleActive === true &&
      this.spellUsable.cooldownRemaining(SPELLS.SUMMON_GARGOYLE.id, event.timestamp) < 155000
    ) {
      /* Gargoyle is active and cooldown is less than 2min35 seconds ->
		A full Gargoyle has just ended. Add temporary Runic Power to total,
		set gargoyleActive to false iterate number of Gargoyle casts by one
		and reset the current Gargoyle Runic Power counter.*/
      this.gargoyleActive = false;
      this.totalGargoyleRunicPower += this.currentGargoyleRunicPower;
      this.currentGargoyleRunicPower = 0;
      this.totalGargoyleCasts += 1;
    }
    if (this.gargoyleActive === true) {
      this.currentGargoyleRunicPower += 30;
    }
  }

  onGargCast(event: CastEvent) {
    this.gargoyleActive = true;
  }

  suggestions(when: When) {
    console.log(this.totalGargoyleCasts);
    console.log(this.totalGargoyleRunicPower);
    const averageBuffAmount = Number(
      (this.totalGargoyleRunicPower / this.totalGargoyleCasts).toFixed(1),
    );
    // Buffing the gargoyle by at least 350 Runic Power on average is recommended
    when(averageBuffAmount)
      .isLessThan(400)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            You are buffing <SpellLink id={SPELLS.SUMMON_GARGOYLE.id} /> with too few{' '}
            <SpellLink id={SPELLS.DEATH_COIL.id} />
            s. Try to prioritise generating Runic Power and spending it on as many{' '}
            <SpellLink id={SPELLS.DEATH_COIL.id} />s as possible once{' '}
            <SpellLink id={SPELLS.SUMMON_GARGOYLE.id} /> has been used!
          </span>,
        )
          .icon(SPELLS.SUMMON_GARGOYLE.icon)
          .actual(
            t({
              id: 'deathknight.unholy.suggestions.summongargoyle.buffing',
              message: `Gargoyle was buffed with an average ${averageBuffAmount} Runic Power`,
            }),
          )
          .recommended(`${recommended} is recommended`)
          .regular(recommended - 60)
          .major(recommended - 120),
      );
  }

  statistic() {
    const averageBuffAmount = Number(
      (this.totalGargoyleRunicPower / this.totalGargoyleCasts).toFixed(1),
    );
    return (
      <Statistic
        tooltip={`You buffed ${this.totalGargoyleCasts} Gargoyle(s) with an average of ${averageBuffAmount} Runic Power.`}
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
      >
        <BoringSpellValueText spellId={SPELLS.SUMMON_GARGOYLE.id}>
          <>
            {averageBuffAmount} <small>average Runic Power buffed</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SummonGargoyleBuffs;
