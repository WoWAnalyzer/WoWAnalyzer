import React from 'react';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import Analyzer from 'parser/core/Analyzer';
import StatisticsListBox from 'interface/others/StatisticsListBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import StatisticWrapper from 'interface/others/StatisticWrapper';
import AbilityTracker from '../core/RestoDruidAbilityTracker';
import SpellManaCost from '../core/SpellManaCost';

/**
 * Tracks the HPM (healing per mana). Free spells, such as from clearcasting and innervates are excluded in the HPM calculations.
 *
 * Example log: https://www.warcraftlogs.com/reports/Pp17Crv6gThLYmdf#fight=8&type=damage-done&source=76
 * TODO - Create a proper breakdown for specific spells, such as rejuvenation.
 */

const LIST_OF_MANA_SPENDERS = [
  SPELLS.LIFEBLOOM_HOT_HEAL.id,
  SPELLS.REJUVENATION.id,
  SPELLS.WILD_GROWTH.id,
  SPELLS.EFFLORESCENCE_CAST.id,
  SPELLS.REGROWTH.id,
  SPELLS.SWIFTMEND.id,
  SPELLS.TRANQUILITY_CAST.id,
  SPELLS.CENARION_WARD_TALENT.id,
];

class HPMTracker extends Analyzer {
  static dependencies = {
    spellManaCost: SpellManaCost,
    abilityTracker: AbilityTracker,
  };

  manaSpenderCasts = {
    [SPELLS.LIFEBLOOM_HOT_HEAL.id]: {
      name: SPELLS.LIFEBLOOM_HOT_HEAL.name,
      hpm: 0,
    },
    [SPELLS.REJUVENATION.id]: {
      name: SPELLS.REJUVENATION.name,
      hpm: 0,
    },
    [SPELLS.WILD_GROWTH.id]: {
      name: SPELLS.WILD_GROWTH.name,
      hpm: 0,
    },
    [SPELLS.EFFLORESCENCE_CAST.id]: {
      name: SPELLS.EFFLORESCENCE_CAST.name,
      hpm: 0,
    },
    [SPELLS.REGROWTH.id]: {
      name: SPELLS.REGROWTH.name,
      hpm: 0,
    },
    [SPELLS.SWIFTMEND.id]: {
      names: SPELLS.SWIFTMEND.name,
      hpm: 0,
    },
    [SPELLS.TRANQUILITY_CAST.id]: {
      names: SPELLS.TRANQUILITY_CAST.name,
      hpm: 0,
    },
    [SPELLS.CENARION_WARD_TALENT.id]: {
      names: SPELLS.CENARION_WARD_TALENT.name,
      hpm: 0,
    },
  };

  legend(items) {
    const numItems = items.length;
    return items.map(({ color, label, tooltip, value, casts, spellId, hpm }, index) => {
      label = tooltip ? (
        <dfn data-tip={tooltip}>{label}</dfn>
      ) : label;
      label = spellId ? (
        <SpellLink id={spellId}>{label}</SpellLink>
      ) : label;
      return (
        <div
          className="flex"
          style={{
            borderBottom: '3px solid rgba(255,255,255,0.1)',
            marginBottom: ((numItems - 1) === index) ? 0 : 5,
          }}
          key={index}
        >
          <div className="flex-sub">
            <div
              style={{
                display: 'inline-block',
                background: color,
                borderRadius: '50%',
                width: 16,
                height: 16,
                marginBottom: -3,
              }}
            />
          </div>
          <div className="flex-main" style={{ paddingLeft: 5 }}>
            {label}
          </div>
          <div className="flex-sub" style={{ paddingLeft: 5 }}>
            {hpm.toFixed(2)} hpm
          </div>
        </div>
      );
    });
  }

  hpmUsage() {
    const usedSpells = LIST_OF_MANA_SPENDERS.filter(id => this.manaSpenderCasts[id].hpm > 0);
    const items = usedSpells
      .map(id => ({
        label: this.manaSpenderCasts[id].name,
        spellId: id,
        hpm: this.manaSpenderCasts[id].hpm,
      }))
      .sort((a, b) => b.hpm - a.hpm);

    return (
      <div className="flex">
        <div className="flex-main" style={{ fontSize: '80%', paddingTop: 3 }}>
          {this.legend(items)}
        </div>
      </div>
    );
  }

  getHpmForAbility(spellId) {
    if(spellId == null) {
      return null;
    }

    const heal = this.abilityTracker.getAbility(spellId);
    if(heal != null && this.manaSpenderCasts[spellId]) {
      return (heal.healingEffective + heal.healingAbsorbed + (heal.healingMastery ? heal.healingMastery : 0)) / heal.manaUsed;
    } else {
      return null;
    }
  }

  statistic() {
    LIST_OF_MANA_SPENDERS.forEach(function(spellId) {
      this.manaSpenderCasts[spellId].hpm = this.getHpmForAbility(spellId);
    }, this);
    return (
      <StatisticWrapper position={STATISTIC_ORDER.CORE(13)}>
        <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
          <div className="row">
            <StatisticsListBox
              title={<React.Fragment><dfn data-tip="This shows the value of Healing Per Mana, meaning how much healing per point of mana was done per spell">HPM tracker</dfn></React.Fragment>}
              containerProps={{ className: 'col-xs-12' }}
            >
              {this.hpmUsage()}
            </StatisticsListBox>
          </div>
        </div>
      </StatisticWrapper>
    );
  }
}

export default HPMTracker;
