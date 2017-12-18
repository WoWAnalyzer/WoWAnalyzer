import React from 'react';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

import CoreChecklist, { Rule, Requirement, GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist';

class Checklist extends CoreChecklist {
  static dependencies = {
  };

  rules = [
  ];
}

export default Checklist;
