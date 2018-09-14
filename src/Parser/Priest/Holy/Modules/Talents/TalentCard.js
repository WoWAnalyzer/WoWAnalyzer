import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import SPELLS from 'common/SPELLS';
import ExpandableTalentBox from 'Interface/Others/ExpandableTalentBox';
import SpecIcon from 'common/SpecIcon';
import SPECS from 'game/SPECS';

import Talents from './';
import SpellIcon from 'common/SpellIcon';

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
        value={`${formatNumber(6600)} HPS | 150 MP5 | 0 DPS`}
        label={'Talent Breakdown'}
      >
        <div>

        </div>
        <table className="table table-condensed">
          <thead>
            <tr >
              <th width="50">Talent</th>
              <th>Effects</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <SpellIcon id={SPELLS.ENLIGHTENMENT_TALENT.id} style={{ height: '3.0em' }} />
              </td>
              <td>150 MP5</td>
            </tr>

            <tr>
              <td>
                <SpellIcon id={SPELLS.ANGELIC_FEATHER_TALENT.id} style={{ height: '3.0em' }} />
              </td>
              <td>14 Casts</td>
            </tr>

            <tr>
              <td>
                <SpellIcon id={SPELLS.COSMIC_RIPPLE_TALENT.id} style={{ height: '3.0em' }} />
              </td>
              <td>
                667 DPS<br />
                14 Casts
              </td>
            </tr>

            <tr>
              <td>
                <SpellIcon id={SPELLS.CENSURE_TALENT.id} style={{ height: '3.0em' }} />
              </td>
              <td>14 Casts</td>
            </tr>

            <tr>
              <td>
                <SpellIcon id={SPELLS.BINDING_HEAL_TALENT.id} style={{ height: '3.0em' }} />
              </td>
              <td>
                1800 HPS<br />
                162 Casts
              </td>
            </tr>

            <tr>
              <td>
                <SpellIcon id={SPELLS.HALO_TALENT.id} style={{ height: '3.0em' }} />
              </td>
              <td>
                1200 HPS<br />
                8 Casts
              </td>
            </tr>

            <tr>
              <td>
                <SpellIcon id={SPELLS.HOLY_WORD_SALVATION_TALENT.id} style={{ height: '3.0em' }} />
              </td>
              <td>
                3600 HPS<br />
                8 Casts
              </td>
            </tr>
          </tbody>
        </table>
      </ExpandableTalentBox>
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);

}

export default TalentCard;
