import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellLink from 'common/SpellLink';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { formatThousands } from 'common/format';
import DonutChart from 'interface/statistics/components/DonutChart';


class ThePenitentOne extends Analyzer {
  constructor(options: Options) {
    super(options);
  }
}