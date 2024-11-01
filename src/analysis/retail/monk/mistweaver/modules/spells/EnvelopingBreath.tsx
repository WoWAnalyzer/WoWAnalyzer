import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffEvent, CastEvent, DeathEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import HotTrackerMW from '../core/HotTrackerMW';
import {
  ABILITIES_AFFECTED_BY_HEALING_INCREASES,
  ENVELOPING_BREATH_INCREASE,
} from '../../constants';

const UNAFFECTED_SPELLS: number[] = [SPELLS.ENVELOPING_BREATH_HEAL.id];
const debug = false;

class EnvelopingBreath extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    hotTracker: HotTrackerMW,
  };
  envsDuringCelestial: number = 0;
  envBreathsApplied: number = 0;
  chijiActive: boolean = false;
  envBIncrease: number = 0;
  protected combatants!: Combatants;
  protected hotTracker!: HotTrackerMW;

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

  handleEnvelopingBreathHeal(event: HealEvent) {
    const targetId = event.targetID;
    const spellId = event.ability.guid;

    if (
      UNAFFECTED_SPELLS.includes(spellId) ||
      !ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(event.ability.guid)
    ) {
      return;
    }

    if (
      !this.hotTracker.hots[targetId] ||
      !this.hotTracker.hots[targetId][SPELLS.ENVELOPING_BREATH_HEAL.id]
    ) {
      return;
    }

    this.envBIncrease += calculateEffectiveHealing(event, ENVELOPING_BREATH_INCREASE);
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

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(0)}
        size="flexible"
        category={STATISTIC_CATEGORY.THEORYCRAFT}
        tooltip={<>This is the effective healing contributed by the Enveloping Breath buff.</>}
      >
        <BoringSpellValueText spell={SPELLS.ENVELOPING_BREATH_HEAL}>
          <>
            {formatNumber(this.envBIncrease)} <small>healing contributed by the buff</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EnvelopingBreath;
