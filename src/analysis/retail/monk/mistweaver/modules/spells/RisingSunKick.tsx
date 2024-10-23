import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { getCurrentRSKTalent } from '../../constants';

const CAST_BUFFER_MS = 250;

class RisingSunKick extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  lastBOK: number = Number.MIN_SAFE_INTEGER;
  lastRSK: number = Number.MIN_SAFE_INTEGER;
  lastRSKTFT: boolean = false;
  rskResets: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(getCurrentRSKTalent(this.selectedCombatant)),
      this.risingSunKickCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK),
      this.blackoutKickCast,
    );
  }

  risingSunKickCast(event: CastEvent) {
    // we are fine. Regular cast
    if (!this.spellUsable.isOnCooldown(getCurrentRSKTalent(this.selectedCombatant).id)) {
      this.lastRSK = event.timestamp;
      return;
    }
    if (
      this.selectedCombatant.hasBuff(
        TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id,
        event.timestamp,
        CAST_BUFFER_MS,
      )
    ) {
      //reduces the cooldown of TFT by '9s' via tooltip but is really reduced by 6 gcds
      const cdr = event.globalCooldown ? event.globalCooldown.duration * 6 : 9000;
      this.lastRSKTFT = true;
      this.spellUsable.reduceCooldown(getCurrentRSKTalent(this.selectedCombatant).id, cdr);
    } else {
      this.lastRSKTFT = false;
    }
    if (!this.lastRSKTFT && this.lastBOK > this.lastRSK) {
      this.rskResets += 1;
    }

    this.lastRSK = event.timestamp;
  }

  blackoutKickCast(event: CastEvent) {
    this.lastBOK = event.timestamp;
  }

  /** Guide subsection describing the proper usage of RSK */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={getCurrentRSKTalent(this.selectedCombatant)} />
        </b>{' '}
        is one of your primary damaging spells but is also you highest priority healing spell{' '}
        {'(alongside '} <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} />
        {') '}due to its synergy with <SpellLink spell={TALENTS_MONK.RISING_MIST_TALENT} />{' '}
        {this.selectedCombatant.hasTalent(TALENTS_MONK.POOL_OF_MISTS_TALENT) && (
          <>
            , <SpellLink spell={TALENTS_MONK.POOL_OF_MISTS_TALENT} />,{' '}
          </>
        )}
        and <SpellLink spell={TALENTS_MONK.RAPID_DIFFUSION_TALENT} />. Using it as much as possible
        is essential for maintaining high counts of{' '}
        <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} />
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={getCurrentRSKTalent(this.selectedCombatant)} /> cast efficiency
          </strong>
          {this.guideSubStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  /** Guide subsection describing the proper usage of Rejuvenation */
  guideSubStatistic() {
    return (
      <CastEfficiencyBar
        spellId={getCurrentRSKTalent(this.selectedCombatant).id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }

  subStatistic() {
    return (
      <>
        {this.rskResets} <small>resets</small>
      </>
    );
  }
}

export default RisingSunKick;
