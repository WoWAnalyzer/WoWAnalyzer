import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import SPELLS from 'common/SPELLS';
import ExpandableTalentBox from 'Interface/Others/ExpandableTalentBox';
import SpecIcon from 'common/SpecIcon';
import SPECS from 'game/SPECS';

import Talents from './';

class TalentCard extends Analyzer {
  static dependencies = {
    Enlightenment: Talents.talents_15.Enlightenment,
    TrailOfLight: Talents.talents_15.TrailOfLight,
    EnduringRenewal: Talents.talents_15.EnduringRenewal,

    AngelicFeather: Talents.talents_30.AngelicFeather,
    AngelsMercy: Talents.talents_30.AngelsMercy,
    Perseverance: Talents.talents_30.Perseverance,

    GuardianAngel: Talents.talents_45.GuardianAngel,
    Afterlife: Talents.talents_45.Afterlife,
    CosmicRipple: Talents.talents_45.CosmicRipple,

    Censure: Talents.talents_60.Censure,
    ShiningForce: Talents.talents_60.ShiningForce,
    PsychicVoice: Talents.talents_60.PsychicVoice,

    SurgeOfLight: Talents.talents_75.SurgeOfLight,
    CircleOfHealing: Talents.talents_75.CircleOfHealing,
    BindingHeal: Talents.talents_75.BindingHeal,

    Halo: Talents.talents_90.Halo,
    Benediction: Talents.talents_90.Benediction,
    DivineStar: Talents.talents_90.DivineStar,

    LightOfTheNaru: Talents.talents_100.LightOfTheNaru,
    HolyWordSalvation: Talents.talents_100.HolyWordSalvation,
    Apotheosis: Talents.talents_100.Apotheosis,
  };

  statistic() {
    return (
      <ExpandableTalentBox
        icon={<SpecIcon id={SPECS.HOLY_PRIEST.id} />}
        value={`${formatNumber(this.healing)}`}
        label={'Talent Breakdown'}
      >
        <div>
          Values under 1% of total are omitted.
        </div>
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Spell</th>
              <th>Amount</th>
              <th>% of Total</th>
              <th>% OH</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Spell</td>
              <td>Amount</td>
              <td>% of Total</td>
              <td>% OH</td>
            </tr>
          </tbody>
        </table>
      </ExpandableTalentBox>
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);

}

export default TalentCard;
