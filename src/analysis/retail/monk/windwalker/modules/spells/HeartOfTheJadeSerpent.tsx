import type { JSX } from 'react';
import { default as HotJS } from 'analysis/retail/monk/shared/hero/ConduitOfTheCelestials/talents/HeartOfTheJadeSerpent';
import spells from 'common/SPELLS/monk';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const HOTJS_BUFF_IDS = [
  spells.HEART_OF_THE_JADE_SERPENT_BUFF,
  spells.HEART_OF_THE_JADE_SERPENT_UNITY,
];

class HeartOfTheJadeSerpent extends HotJS {
  castEntries: BoxRowEntry[] = [];

  currentFof = 0;
  currentSotwl = 0;
  currentUnityWithin = 0;
  inWindow = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(HOTJS_BUFF_IDS),
      this.onApplyHotJS,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(HOTJS_BUFF_IDS),
      this.onRemoveHotJS,
    );

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          spells.FISTS_OF_FURY_CAST,
          TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT,
          spells.UNITY_WITHIN_CAST,
        ]),
      this.onTrackedCast,
    );
  }

  onApplyHotJS(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this.inWindow) {
      // Window is being refreshed, close and restart
      this.closeWindow();
    }

    this.inWindow = true;
    this.currentFof = 0;
    this.currentSotwl = 0;
    this.currentUnityWithin = 0;
  }

  onRemoveHotJS(event: RemoveBuffEvent) {
    if (!this.inWindow) {
      console.log('Unexpected state! HotJS was removed while not in an identified window');
      return;
    }
    this.closeWindow();
  }

  closeWindow() {
    this.inWindow = false;
    let mistakes = 0;

    if (this.currentFof < 1) {
      mistakes += 1;
    }

    if (this.currentSotwl !== 0) {
      mistakes += 1;
    }

    if (this.currentUnityWithin !== 0) {
      mistakes += 1;
    }

    let value = QualitativePerformance.Fail;
    if (mistakes === 0) {
      value = QualitativePerformance.Perfect;
    } else if (mistakes === 1) {
      value = QualitativePerformance.Ok;
    }

    const tooltip = (
      <>
        {this.currentFof === 0 && (
          <>
            <SpellLink spell={spells.FISTS_OF_FURY_CAST} /> was not used during the window
          </>
        )}
        {this.currentSotwl !== 0 && (
          <>
            <br />
            <SpellLink spell={TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT} /> should not be used
            within the window
          </>
        )}
        {this.currentUnityWithin !== 0 && (
          <>
            <br />
            <SpellLink spell={TALENTS_MONK.UNITY_WITHIN_TALENT} /> should not be used within the
            window
          </>
        )}
      </>
    );

    this.castEntries.push({
      value,
      tooltip,
    });
  }

  onTrackedCast(event: CastEvent) {
    if (!this.inWindow) {
      return;
    }

    switch (event.ability.guid) {
      case spells.FISTS_OF_FURY_CAST.id:
        this.currentFof += 1;
        break;
      case TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT.id:
        this.currentSotwl += 1;
        break;
      case spells.UNITY_WITHIN_CAST.id:
        this.currentUnityWithin += 1;
        break;
    }
  }

  guideSubsection(conduitClipAnalysis: JSX.Element): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT} />
        </strong>{' '}
        massively reduces the cooldowns of your major abilities, and as such at least one{' '}
        <SpellLink spell={spells.FISTS_OF_FURY_CAST} /> should be cast in each buff window.
        <br />
        <br />
        This buff is actived whenever{' '}
        <SpellLink spell={TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT} /> or{' '}
        <SpellLink spell={TALENTS_MONK.UNITY_WITHIN_TALENT} /> (as part of{' '}
        <SpellLink spell={TALENTS_MONK.CELESTIAL_CONDUIT_TALENT} />) are cast. To avoid clipping the
        window short, casting either of them while{' '}
        <SpellLink spell={TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT} /> is active should be
        avoided.
        <br />
        <br />
        While active, muliple major abilities have massively hastened cooldowns. These can easily
        reset atleast once during the duration with high enough haste, or with help from{' '}
        <SpellLink spell={spells.BLACKOUT_KICK} />.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT} /> utilization
          </strong>
          <div>
            <strong>Buff Windows </strong>
            <small>
              - Blue indicates a perfect cast (
              <SpellLink spell={TALENTS_MONK.FISTS_OF_FURY_TALENT} /> was cast atleast one time, and
              neither <SpellLink spell={TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT} /> nor{' '}
              <SpellLink spell={TALENTS_MONK.UNITY_WITHIN_TALENT} /> were cast), yellow indicates
              one mistake, while red indicates multiple mistakes.
            </small>
            <br />
            <br />
            <PerformanceBoxRow values={this.castEntries} />
          </div>
        </RoundedPanel>
        <RoundedPanel style={{ marginTop: '1rem' }}>{conduitClipAnalysis}</RoundedPanel>
      </div>
    );
    return explanationAndDataSubsection(explanation, data);
  }
}

export default HeartOfTheJadeSerpent;
