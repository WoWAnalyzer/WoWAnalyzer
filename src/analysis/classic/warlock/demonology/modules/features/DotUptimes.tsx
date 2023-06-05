import Analyzer from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import UptimeIcon from 'interface/icons/Uptime';
import UptimeMultiBarStatistic from 'parser/ui/UptimeMultiBarStatistic';

import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS/classic/warlock';
import Corruption from '../spells/Corruption';
import Immolate from '../spells/Immolate';
import ShadowMastery from '../spells/ShadowMastery';

class DotUptimes extends Analyzer {
  static dependencies = {
    corruptionUptime: Corruption,
    immolateUptime: Immolate,
    shadowMasteryUptime: ShadowMastery,
  };
  protected corruptionUptime!: Corruption;
  protected immolateUptime!: Immolate;
  protected shadowMasteryUptime!: ShadowMastery;

  statistic() {
    return (
      <UptimeMultiBarStatistic
        title={
          <>
            <UptimeIcon /> DoT Uptimes
          </>
        }
        position={STATISTIC_ORDER.CORE(1)}
        tooltip={<>These uptime bars show the times your DoT was active on at least one target.</>}
      >
        {this.corruptionUptime.subStatistic()}
        {this.immolateUptime.subStatistic()}
      </UptimeMultiBarStatistic>
    );
  }

  get guideSubsection() {
    return (
      <>
        <p>
          Demo Warlocks rely on Damage over Time spells (DoTs) such as{' '}
          <SpellLink spell={SPELLS.CORRUPTION} /> and <SpellLink spell={SPELLS.IMMOLATE} /> to deal
          damage. Additionally, the <SpellLink spell={SPELLS.SHADOW_MASTERY_DEBUFF} /> debuff
          increases damage done by <SpellLink spell={SPELLS.SHADOW_BOLT} /> and increases spell
          critical strike chance against the target for all casters in the raid.
        </p>
        <p>
          <strong>Uptimes</strong>
          {this.corruptionUptime.subStatistic()}
          {this.immolateUptime.subStatistic()}
          {this.shadowMasteryUptime.subStatistic()}
        </p>
      </>
    );
  }
}

export default DotUptimes;
