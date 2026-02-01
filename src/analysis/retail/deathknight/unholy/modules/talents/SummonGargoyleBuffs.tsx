import SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const GARGOYLE_DURATION_MS = 25000;

class SummonGargoyleBuffs extends Analyzer {
  private totalGargoyleCasts = 0;
  private currentGargoyleRunicPower = 0;
  private totalGargoyleRunicPower = 0;
  private gargoyleActive = false;
  private gargoyleEnd = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.SUMMON_GARGOYLE_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.DEATH_COIL, SPELLS.EPIDEMIC]),
      this.onBuffCast,
    );

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.SUMMON_GARGOYLE, SPELLS.DARK_ARBITER_TALENT_GLYPH]),
      this.onGargCast,
    );
  }

  get averageBuffAmount() {
    if (this.totalGargoyleCasts === 0) {
      return 0;
    }
    return Math.round(this.totalGargoyleRunicPower / this.totalGargoyleCasts);
  }

  get averageDamageIncrease() {
    return this.averageBuffAmount;
  }

  onBuffCast(event: CastEvent) {
    if (!this.gargoyleActive) {
      return;
    }
    if (event.timestamp > this.gargoyleEnd) {
      this.gargoyleActive = false;
      this.totalGargoyleRunicPower += this.currentGargoyleRunicPower;
      this.currentGargoyleRunicPower = 0;
      this.totalGargoyleCasts += 1;
    } else {
      this.currentGargoyleRunicPower += 30;
    }
  }

  onGargCast(event: CastEvent) {
    this.gargoyleActive = true;
    this.gargoyleEnd = event.timestamp + GARGOYLE_DURATION_MS;
    this.totalGargoyleCasts += 1;
    this.totalGargoyleRunicPower += this.currentGargoyleRunicPower;
    this.currentGargoyleRunicPower = 0;
  }

  statistic() {
    return (
      <Statistic
        tooltip={`The Gargoyle gains 1% increased damage for every Runic Power you spend while it's active. It always critically strikes. On summon, it also instantly Putrefies 2 Lesser Ghouls at 100% effectiveness.`}
        position={STATISTIC_ORDER.CORE(6)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.SUMMON_GARGOYLE}>
          <>
            {this.totalGargoyleCasts} <small>Gargoyle(s)</small>
            <br />
            {this.averageBuffAmount} <small>avg RP spent ({this.averageDamageIncrease}% dmg)</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SummonGargoyleBuffs;
