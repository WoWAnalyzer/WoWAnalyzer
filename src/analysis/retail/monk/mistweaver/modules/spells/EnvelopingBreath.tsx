import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffEvent, CastEvent, DeathEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const ENVELOPING_BREATH_INCREASE = 0.1;
const debug = false;

class EnvelopingBreath extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  envsDuringCelestial: number = 0;
  envBreathsApplied: number = 0;
  chijiActive: boolean = false;
  envBIncrease: number = 0;
  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleEnvelopingBreathHeal);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH_HEAL),
      this.handleEnvelopingBreathCount,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.handleEnvelopingMist,
    );
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT)) {
      this.addEventListener(Events.death.to(SELECTED_PLAYER_PET), this.handleChijiDeath);
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT),
        this.handleChijiSummon,
      );
    }
  }

  get averageEnvBPerEnv() {
    return this.envBreathsApplied / this.envsDuringCelestial || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.averageEnvBPerEnv,
      isLessThan: {
        minor: 5,
        average: 4,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  handleEnvelopingBreathHeal(event: HealEvent) {
    const targetId = event.targetID;
    const sourceId = event.sourceID;

    if (this.combatants.players[targetId]) {
      if (
        this.combatants.players[targetId].hasBuff(
          SPELLS.ENVELOPING_BREATH_HEAL.id,
          event.timestamp,
          0,
          0,
          sourceId,
        )
      ) {
        this.envBIncrease += calculateEffectiveHealing(event, ENVELOPING_BREATH_INCREASE);
      }
    }
  }

  handleEnvelopingMist(event: CastEvent) {
    if (
      this.chijiActive ||
      this.selectedCombatant.hasBuff(TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id)
    ) {
      this.envsDuringCelestial += 1;
    }
  }

  handleEnvelopingBreathCount(event: ApplyBuffEvent) {
    this.envBreathsApplied += 1;
  }

  handleChijiSummon(event: CastEvent) {
    this.chijiActive = true;
    debug && console.log('Chiji summoned');
  }

  handleChijiDeath(event: DeathEvent) {
    this.chijiActive = false;
    debug && console.log('Chiji Died');
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are not utilizing <SpellLink id={SPELLS.ENVELOPING_BREATH_HEAL.id} /> effectively.
          Make sure you are choosing good targets for your{' '}
          <SpellLink id={TALENTS_MONK.ENVELOPING_MIST_TALENT.id} /> during your Celestial cooldowns
          to apply the maximum number of <SpellLink id={SPELLS.ENVELOPING_BREATH_HEAL.id} />{' '}
          possible.
        </>,
      )
        .icon(SPELLS.ENVELOPING_BREATH_HEAL.icon)
        .actual(
          `${this.averageEnvBPerEnv.toFixed(
            2,
          )} Enveloping Breaths per Enveloping Mist during Celestial`,
        )
        .recommended(`${recommended} Enveloping Breaths are recommended per cast`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(0)}
        size="flexible"
        category={STATISTIC_CATEGORY.THEORYCRAFT}
        tooltip={<>This is the effective healing contributed by the Enveloping Breath buff.</>}
      >
        <BoringSpellValueText spellId={SPELLS.ENVELOPING_BREATH_HEAL.id}>
          <>
            {formatNumber(this.envBIncrease)} <small>healing contributed by the buff</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EnvelopingBreath;
