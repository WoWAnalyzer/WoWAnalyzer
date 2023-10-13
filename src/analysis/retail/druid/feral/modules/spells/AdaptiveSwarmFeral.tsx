import { AdaptiveSwarmDamageDealer } from 'analysis/retail/druid/shared';
import SPELLS from 'common/SPELLS';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';
import { SpellLink } from 'interface';
import { TALENTS_DRUID } from 'common/TALENTS';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

/**
 * Feral's display module for Adaptive Swarm - standard damage dealer plus also the uptime stat
 */
class AdaptiveSwarmFeral extends AdaptiveSwarmDamageDealer {
  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [SPELLS.ADAPTIVE_SWARM],
        uptimes: this.damageUptimeHistory,
      },
      [],
      SubPercentageStyle.RELATIVE,
    );
  }

  get guideSubsection(): JSX.Element {
    const hasUs = this.selectedCombatant.hasTalent(TALENTS_DRUID.UNBRIDLED_SWARM_TALENT);
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS_DRUID.ADAPTIVE_SWARM_TALENT} />
          </strong>{' '}
          is a 'bouncy' DoT / HoT that boosts your periodic effects on the target. Focus on
          maximizing the DoTs uptime by casting on enemy targets only.
        </p>
        <p>
          {hasUs ? (
            <>
              With <SpellLink spell={TALENTS_DRUID.UNBRIDLED_SWARM_TALENT} /> and multiple
              consistent enemy targets, it should be possible to maintain high uptime on multiple
              targets. This talent's value diminishes considerably in single target encounters.
            </>
          ) : (
            <>
              Without <SpellLink spell={TALENTS_DRUID.UNBRIDLED_SWARM_TALENT} />, you'll only be
              able to maintain one Swarm at a time. Refresh on your primary target as soon as the
              previous Swarm falls, and you should be able to maintain 60+% uptime.
            </>
          )}
        </p>
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <strong>Adaptive Swarm uptime</strong>
          {this.subStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

export default AdaptiveSwarmFeral;
