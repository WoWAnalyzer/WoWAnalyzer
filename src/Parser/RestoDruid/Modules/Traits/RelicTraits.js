import React from 'react';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import Analyzer from 'Parser/Core/Analyzer';

import ArmorOfTheAncients from './ArmorOfTheAncients';
import BlessingOfTheWorldTree from './BlessingOfTheWorldTree';
import EssenceOfNordrassil from './EssenceOfNordrassil';
import Grovewalker from './Grovewalker';
import InfusionOfNature from './InfusionOfNature';
import KnowledgeOfTheAncients from './KnowledgeOfTheAncients';
import NaturalMending from './NaturalMending';
import Persistence from './Persistence';
import SeedsOfTheWorldTree from './SeedsOfTheWorldTree';
import EternalRestoration from './EternalRestoration';

class RelicTraits extends Analyzer {
  static dependencies = {
    armorOfTheAncients: ArmorOfTheAncients,
    blessingOfTheWorldTree: BlessingOfTheWorldTree,
    essenceOfNordrassil: EssenceOfNordrassil,
    grovewalker: Grovewalker,
    infusionOfNature: InfusionOfNature,
    knowledgeOfTheAncients: KnowledgeOfTheAncients,
    naturalMending: NaturalMending,
    persistence: Persistence,
    seedsOfTheWorldTree: SeedsOfTheWorldTree,
    eternalRestoration: EternalRestoration,
  };

  statistic() {
    return (
      <StatisticsListBox
        title="Relic traits"
        tooltip="This only calculates the value of the last point of each relic trait; for you with your gear and only during this fight. The value of an additional point would likely be slightly lower due to increased overhealing."
        style={{ minHeight: 186 }}
      >
        {this.blessingOfTheWorldTree.subStatistic()}
        {this.essenceOfNordrassil.subStatistic()}
        {this.grovewalker.subStatistic()}
        {this.infusionOfNature.subStatistic()}
        {this.knowledgeOfTheAncients.subStatistic()}
        {this.naturalMending.subStatistic()}
        {this.persistence.subStatistic()}
        {this.seedsOfTheWorldTree.subStatistic()}
        {this.eternalRestoration.subStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default RelicTraits;
