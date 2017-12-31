// import React from 'react';

// import Wrapper from 'common/Wrapper';
// import SPELLS from 'common/SPELLS';
// import ITEMS from 'common/ITEMS';
// import SpellLink from 'common/SpellLink';
// import ItemLink from 'common/ItemLink';

import CoreChecklist, { /*Rule, Requirement*/ } from 'Parser/Core/Modules/Features/Checklist';
import { /*GenericCastEfficiencyRequirement*/ } from 'Parser/Core/Modules/Features/Checklist/Requirements';

class Checklist extends CoreChecklist {
  static dependencies = {
  };

  rules = [
    // TODO: Create Rules for this spec, e.g. "Cast core spells on cooldown", "Try to always be casting", "Be well prepared".
    // This isn't the easiest way to start, so you might want to do something else first to get to know the codebase.
    // See https://github.com/WoWAnalyzer/WoWAnalyzer/wiki/The-Checklist for more info
  ];
}

export default Checklist;
