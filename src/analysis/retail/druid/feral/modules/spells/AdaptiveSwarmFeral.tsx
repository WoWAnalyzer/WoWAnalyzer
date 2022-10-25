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
      <p>
        <strong>
          <SpellLink id={TALENTS_DRUID.ADAPTIVE_SWARM_TALENT.id} />
        </strong>{' '}
        is a 'bouncy' DoT / HoT that boosts your periodic effects on the target. As Feral is a
        damage-dealing spec, you should focus on maximizing the DoTs uptime by casting on enemy
        targets only.
        <br />
        {hasUs ? (
          <>
            With <SpellLink id={TALENTS_DRUID.UNBRIDLED_SWARM_TALENT.id} /> and multiple consistent
            enemy targets, it should be possible to maintain high uptime on multiple targets. This
            talent's value diminishes considerable in single target encounters.
          </>
        ) : (
          <>
            As you did not take <SpellLink id={TALENTS_DRUID.UNBRIDLED_SWARM_TALENT.id} />, you'll
            only be able to maintain one Swarm at a time. By refreshing on your primary target as
            soon as the previous Swarm falls, you should be able to maintain 60+% uptime.
          </>
        )}
      </p>
    );
    const data = (
      <RoundedPanel>
        <div>
          <strong>Adaptive Swarm uptime</strong>
        </div>
        {this.subStatistic()}
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

export default AdaptiveSwarmFeral;
