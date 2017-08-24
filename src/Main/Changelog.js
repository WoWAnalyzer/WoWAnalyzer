import React from 'react';

import CHANGELOG_CORE from '../CHANGELOG_CORE';
import CHANGELOG_HOLY_PALADIN from '../CHANGELOG_HOLY_PALADIN';
import CHANGELOG_DISCIPLINE_PRIEST from '../CHANGELOG_DISCIPLINE_PRIEST';
import CHANGELOG_HOLY_PRIEST from '../CHANGELOG_HOLY_PRIEST';
import CHANGELOG_RESTORATION_DRUID from '../CHANGELOG_RESTORATION_DRUID';
import CHANGELOG_GUARDIAN_DRUID from '../CHANGELOG_GUARDIAN_DRUID';
import CHANGELOG_MISTWEAVER_MONK from '../CHANGELOG_MISTWEAVER_MONK';
import CHANGELOG_WINDWALKER_MONK from '../CHANGELOG_WINDWALKER_MONK';
import CHANGELOG_RESTORATION_SHAMAN from '../CHANGELOG_RESTORATION_SHAMAN';
import CHANGELOG_ELEMENTAL_SHAMAN from '../CHANGELOG_ELEMENTAL_SHAMAN';
import CHANGELOG_ENHANCEMENT_SHAMAN from "../CHANGELOG_ENHANCEMENT_SHAMAN";
import CHANGELOG_AFFLICTION_WARLOCK from "../CHANGELOG_AFFLICTION_WARLOCK";
import CHANGELOG_BREWMASTER_MONK from "../CHANGELOG_BREWMASTER_MONK";
import CHANGELOG_VENGEANCE_DEMON_HUNTER from "../CHANGELOG_VENGEANCE_DEMON_HUNTER";

const changelogs = {
  core:CHANGELOG_CORE,
  holyPaladin:CHANGELOG_HOLY_PALADIN,
  disciplinePriest:CHANGELOG_DISCIPLINE_PRIEST,
  holyPriest:CHANGELOG_HOLY_PRIEST,
  restorationDruid:CHANGELOG_RESTORATION_DRUID,
  guardianDruid:CHANGELOG_GUARDIAN_DRUID,
  mistweaverMonk:CHANGELOG_MISTWEAVER_MONK,
  windwalkerMonk:CHANGELOG_WINDWALKER_MONK,
  restorationShaman:CHANGELOG_RESTORATION_SHAMAN,
  elementalShaman:CHANGELOG_ELEMENTAL_SHAMAN,
  enhancementShaman:CHANGELOG_ENHANCEMENT_SHAMAN,
  afflictionWarlock:CHANGELOG_AFFLICTION_WARLOCK,
  brewmasterMonk:CHANGELOG_BREWMASTER_MONK,
  vengeanceDemonHunter:CHANGELOG_VENGEANCE_DEMON_HUNTER,
};

class Changelog extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      expanded: false,
      changelogType: "core",
    };
  }

  render() {
    const limit = this.state.expanded ? null : 10;

    return (
      <div className="form-group">
        <select className="form-control" value={this.state.changelogType} onChange={(e) => this.setState({ changelogType: e.target.value })}>
          <option value="core">Core</option>
          <option value="holyPaladin">Holy Paladin</option>
          <option value="disciplinePriest">Discipline Priest</option>
          <option value="holyPriest">Holy Priest</option>
          <option value="restorationDruid">Restoration Druid</option>
          <option value="guardianDruid">Guardian Druid</option>
          <option value="mistweaverMonk">Mistweaver Monk</option>
          <option value="windwalkerMonk">Windwalker Monk</option>
          <option value="restorationShaman">Restoration Shaman</option>
          <option value="elementalShaman">Elemental Shaman</option>
          <option value="enhancementShaman">Enhancement Shaman</option>
          <option value="afflictionWarlock">Affliction Warlock</option>
          <option value="brewmasterMonk">Brewmaster Monk</option>
          <option value="vengeanceDemonHunter">Vengeance Demon Hunter</option>
        </select>

        {changelogs[this.state.changelogType].split('\n').filter((_, i) => limit === null || i <= limit).map((change, i) => (
          <div key={`${i}`} dangerouslySetInnerHTML={{ __html: change }} />
        ))}
        {limit !== null && (
          <a onClick={() => this.setState({ expanded: true })}>More</a>
        )}
      </div>
    );
  }
}

export default Changelog;
