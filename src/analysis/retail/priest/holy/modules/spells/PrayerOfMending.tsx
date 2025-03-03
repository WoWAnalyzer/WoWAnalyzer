import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  ChangeBuffStackEvent,
  HealEvent,
} from 'parser/core/Events';
import { SpellLink } from 'interface';
import CastEfficiencyPanel from 'interface/guide/components/CastEfficiencyPanel';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/priest/holy/Guide';

class PrayerOfMending extends Analyzer {
  totalPoMHealing = 0;
  totalPoMOverhealing = 0;
  totalPoMAbsorption = 0;
  pomCasts = 0;
  salvCasts = 0;
  pomHealTicks = 0;
  pomBuffCount = 0;
  pomRemovalCount = 0;
  prepullPomBuffs = 0;
  lastSalvCastTime = 0; // dont think this is doing anything atm
  pomTicksFromSalv = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([TALENTS.PRAYER_OF_MENDING_TALENT]),
      this.onCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.PRAYER_OF_MENDING_HEAL]),
      this.onHeal,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.PRAYER_OF_MENDING_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.changebuffstack.by(SELECTED_PLAYER).spell(SPELLS.PRAYER_OF_MENDING_BUFF),
      this.onChangeBuffstack,
    );
  }

  get wastedPomStacks() {
    return this.pomBuffCount - this.pomHealTicks;
  }

  get averagePomTickHeal() {
    return this.totalPoMHealing / this.pomHealTicks;
  }

  get averagePomTickOverheal() {
    return this.totalPoMOverhealing / this.pomHealTicks;
  }

  get averagePomTickAbsorption() {
    return this.totalPoMAbsorption / this.pomHealTicks;
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;

    if (spellId === TALENTS.PRAYER_OF_MENDING_TALENT.id) {
      this.pomCasts += 1;
    }
  }

  onHeal(event: HealEvent) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.PRAYER_OF_MENDING_HEAL.id) {
      this.pomHealTicks += 1;
      this.totalPoMHealing += event.amount || 0;
      this.totalPoMOverhealing += event.overheal || 0;
      this.totalPoMAbsorption += event.absorbed || 0;
    }
  }

  onApplyBuff(event: ApplyBuffEvent) {
    if (event.prepull) {
      this.prepullPomBuffs += 1;
      this.pomCasts += 1;
    }
  }

  onChangeBuffstack(event: ChangeBuffStackEvent) {
    if (event.stacksGained > 0) {
      this.pomBuffCount += 1;
    } else {
      this.pomRemovalCount += 1;
    }
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_PRIEST.PRAYER_OF_MENDING_TALENT} />
        </b>{' '}
        is one of our most efficient spells and should be cast on cooldown. It is a heal that is
        triggered on the target when they take damage, and then bounces to a new target. Because its
        heal is triggered by damage, the active tank is a good target to cast this on.
      </p>
    );

    const data = (
      <CastEfficiencyPanel spell={TALENTS_PRIEST.PRAYER_OF_MENDING_TALENT} useThresholds />
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default PrayerOfMending;
