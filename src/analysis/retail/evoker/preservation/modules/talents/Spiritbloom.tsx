import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, { HealEvent } from 'parser/core/Events';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

class DreamBreath extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  spiritbloomInitialHealingDone = 0;
  spiritbloomFirstSplitHealingDone = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.SPIRITBLOOM_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SPIRITBLOOM), this.onHeal);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SPIRITBLOOM_SPLIT),
      this.onSplitHeal,
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS_EVOKER.SPIRITBLOOM_TALENT.id} />
        </b>{' '}
        is one of your empowered abilities and a very strong AoE triage heal that applies a powerful
        HoT with the Abberus (T30) tier set. You should try to use this ability at maximum
        Empowerment level whenever it is not on cooldown.{' '}
        <SpellLink id={TALENTS_EVOKER.SPIRITBLOOM_TALENT} /> is a strong candidate to consume{' '}
        <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> with, especially with the T30 tierset, but
        may vary based on playstyle.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={TALENTS_EVOKER.SPIRITBLOOM_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS_EVOKER.SPIRITBLOOM_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        useThresholds
      />
    );
  }

  onHeal(event: HealEvent) {
    this.spiritbloomInitialHealingDone += event.amount + (event.absorbed || 0);
  }

  onSplitHeal(event: HealEvent) {
    this.spiritbloomFirstSplitHealingDone += event.amount + (event.absorbed || 0);
  }
}

export default DreamBreath;
