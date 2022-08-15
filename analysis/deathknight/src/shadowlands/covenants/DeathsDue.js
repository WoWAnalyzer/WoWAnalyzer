import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import SPECS from 'game/SPECS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EventType } from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const MAX_STACKS = 4;
const GROUND_EFFECT_DURATION = 10000;

class DeathsDue extends Analyzer {
  //for stack trackers
  stacks = [];
  lastStack = 0;
  lastStackUpdate = this.owner.fight.start_time;

  //for window trackers
  stacksGained = 0;
  casts = 0;
  groundEffectEnd = this.owner.fight.start_time;
  wastedCasts = 0;

  strPerStack = 0.02; // 2% str buff per stack, overridden in constructor if legendary

  constructor(...args) {
    super(...args);
    const active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);
    this.active = active;
    if (!active) {
      return;
    }

    if (this.selectedCombatant.hasLegendary(SPELLS.RAMPANT_TRANSFERENCE)) {
      this.strPerStack = 0.05;
    }

    this.stacks = Array.from({ length: MAX_STACKS + 1 }, (x) => []);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DEATHS_DUE_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.DEATHS_DUE_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DEATHS_DUE_BUFF),
      this.handleStacks,
    );
    this.addEventListener(Events.fightend, this.handleStacks);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEATHS_DUE),
      this.handleWindow,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEFILE_TALENT),
      this.handleWindow,
    );
    this.addEventListener(Events.fightend, this.handleWindow);
  }

  handleStacks(event) {
    this.stacks[this.lastStack].push(event.timestamp - this.lastStackUpdate);
    if (event.type === EventType.FightEnd) {
      return;
    }

    this.lastStackUpdate = event.timestamp;
    this.lastStack = currentStacks(event);
  }

  handleWindow(event) {
    //if you do not get full DD window due to fight ending, remove the previous window from the counter and don't worry about preparing next
    if (this.groundEffectEnd > this.owner.fight.end_time) {
      this.casts -= 1;
      return;
    }

    //calculate previous cast
    if (this.casts !== 0) {
      //don't calculate previous window if this is the first cast
      let stackGain = this.selectedCombatant.getBuffStacks(
        SPELLS.DEATHS_DUE_BUFF.id,
        this.groundEffectEnd,
      );
      this.wastedCasts += stackGain === 0;
      this.stacksGained += stackGain;
    }

    //get stuff set up for the current cast, if this is a cast
    if (event.type === EventType.Cast) {
      this.casts += 1;
      this.groundEffectEnd = event.timestamp + GROUND_EFFECT_DURATION;
    }
  }

  get averageStacks() {
    let avgStacks = 0;
    this.stacks.forEach((elem, index) => {
      avgStacks += (elem.reduce((a, b) => a + b, 0) / this.owner.fightDuration) * index;
    });
    return avgStacks;
  }

  get averageStrength() {
    return this.averageStacks * this.strPerStack;
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.DEATHS_DUE_BUFF.id) / this.owner.fightDuration
    ); //most useful for blood
  }

  get avgStackPerCast() {
    return this.stacksGained / this.casts; //most useful for Frost/Unholy
  }

  get buffSpellLinks() {
    if (this.selectedCombatant.spec === SPECS.BLOOD_DEATH_KNIGHT) {
      return (
        <Trans id="deathknight.shared.covenants.deathsDue.buffSpellLinks.blood">
          for <SpellLink id={SPELLS.HEART_STRIKE.id} />
        </Trans>
      );
    }

    if (this.selectedCombatant.spec === SPECS.FROST_DEATH_KNIGHT) {
      return (
        <Trans id="deathknight.shared.covenants.deathsDue.buffSpellLinks.frost">
          for <SpellLink id={SPELLS.OBLITERATE_CAST.id} />
        </Trans>
      );
    }

    if (this.selectedCombatant.hasTalent(SPELLS.CLAWING_SHADOWS_TALENT.id)) {
      return (
        <Trans id="deathknight.shared.covenants.deathsDue.buffSpellLinks.clawingShadows">
          and up to four <SpellLink id={SPELLS.FESTERING_WOUND.id} /> for{' '}
          <SpellLink id={SPELLS.CLAWING_SHADOWS.id} />
        </Trans>
      );
    }

    return (
      <Trans id="deathknight.shared.covenants.deathsDue.buffSpellLinks.default">
        and up to four <SpellLink id={SPELLS.FESTERING_WOUND.id} /> for{' '}
        <SpellLink id={SPELLS.SCOURGE_STRIKE.id} />
      </Trans>
    );
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  get wastedCastsSuggestionThresholds() {
    return {
      actual: this.wastedCasts / this.casts,
      isGreaterThan: {
        minor: 0,
        average: 0.1,
        major: 0.2,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    if (this.selectedCombatant.spec === SPECS.BLOOD_DEATH_KNIGHT) {
      when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
        suggest(
          <Trans id="deathknight.shared.covenants.deathsDue.suggestion.blood.suggestion">
            Your Death's Due uptime can be improved. Try to keep it up at all times even if you have
            to hard-cast <SpellLink id={SPELLS.DEATHS_DUE.id} /> without a{' '}
            <SpellLink id={SPELLS.CRIMSON_SCOURGE.id} /> proc.
          </Trans>,
        )
          .icon(SPELLS.DEATHS_DUE.icon)
          .actual(
            <Trans id="deathknight.shared.covenants.deathsDue.suggestion.blood.actual">
              {formatPercentage(actual)}% Death's Due uptime
            </Trans>,
          )
          .recommended(
            <Trans id="deathknight.shared.covenants.deathsDue.suggestion.blood.recommended">
              &gt;{formatPercentage(recommended)}% is recommended
            </Trans>,
          ),
      );
    }
    when(this.wastedCastsSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="deathknight.shared.covenants.deathsDue.suggestion.default.suggestion">
          You had wasted <SpellLink id={SPELLS.DEATHS_DUE.id} /> casts without any strength gain.
          Consider pooling up to three runes {this.buffSpellLinks} casts before the Death's Due
          window.
          <br /> Additionally, try to cast <SpellLink id={SPELLS.DEATHS_DUE.id} /> when you expect
          minimal movement for the next ~10 seconds
        </Trans>,
      )
        .icon(SPELLS.DEATHS_DUE.icon)
        .actual(
          <Trans id="deathknight.shared.covenants.deathsDue.suggestion.default.actual">
            {this.wastedCasts} out of {this.casts} casts were wasted
          </Trans>,
        )
        .recommended(
          <Trans id="deathknight.shared.covenants.deathsDue.suggestion.default.recommended">
            {recommended} recommended
          </Trans>,
        ),
    );
  }
  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.COVENANTS}
        size="flexible"
        tooltip={
          <Trans id="deathknight.shared.covenants.deathsDue.statistic.tooltip">
            <strong>Uptime: </strong> {formatPercentage(this.uptime)}% <br />
            <strong>Avg Stacks Throughout Encounter: </strong> {this.averageStacks.toFixed(1)}
            <br />
            <strong>Avg Stacks Per Cast: </strong> {this.avgStackPerCast.toFixed(1)}
          </Trans>
        }
      >
        <BoringSpellValueText spellId={SPELLS.DEATHS_DUE.id}>
          <Trans id="deathknight.shared.covenants.deathsDue.statistic.value">
            {formatPercentage(this.averageStrength)} % <small>Average Strength</small>
          </Trans>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DeathsDue;
