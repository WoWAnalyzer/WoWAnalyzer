import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

const debug = false;

class ChiBurst extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;

  castChiBurst = 0;
  healing = 0;
  targetsChiBurst = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.CHI_BURST_SHARED_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.CHI_BURST_SHARED_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHI_BURST_HEAL),
      this.onHeal,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onCast(event: CastEvent) {
    this.castChiBurst += 1;
  }

  onHeal(event: HealEvent) {
    const targetId = event.targetID;

    if (!this.combatants.players[targetId]) {
      return;
    }
    this.healing += (event.amount || 0) + (event.absorbed || 0);
    this.targetsChiBurst += 1;
  }

  get avgTargetsHitPerCB() {
    return this.targetsChiBurst / this.castChiBurst || 0;
  }

  get percentOfRaidHitByCB() {
    return this.avgTargetsHitPerCB / this.combatants.playerCount;
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.CHI_BURST_SHARED_TALENT} />
        </b>{' '}
        is a filler spell that does consistent healing for 1 GCD and 0 mana, making it a very good
        button to press all around. <br />
        <SpellLink spell={TALENTS_MONK.CHI_BURST_SHARED_TALENT} /> should ideally replace a cast of{' '}
        <SpellLink spell={SPELLS.TIGER_PALM} /> in your rotation.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.CHI_BURST_SHARED_TALENT} /> cast efficiency
          </strong>
          {this.subStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS_MONK.CHI_BURST_SHARED_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        useThresholds
      />
    );
  }

  onFightEnd() {
    if (debug) {
      console.log(`ChiBurst Casts: ${this.castChiBurst}`);
      console.log(`Total Chi Burst Healing: ${this.healing}`);
      console.log(`Chi Burst Targets Hit: ${this.targetsChiBurst}`);
    }
  }
}

export default ChiBurst;
