import { SubSection } from 'interface/guide/index';
import Spell from 'common/SPELLS/Spell';
import { SideBySidePanels } from 'interface/guide/components/GuideDivs';

import FoodPanel from './FoodPanel';
import PotionPanel from './PotionPanel';
import FlaskPanel from './FlaskPanel';

interface Props {
  recommendedFlasks?: Spell[];
  recommendedFoods?: Spell[];
}
const ConsumablesSubSection = ({ recommendedFlasks, recommendedFoods }: Props) => {
  return (
    <SubSection title="Consumables">
      <p>Using consumables appropriately is an easy way to improve your throughput.</p>
      <SideBySidePanels>
        <FoodPanel recommendedFoods={recommendedFoods} />
        <PotionPanel />
        <FlaskPanel recommendedFlasks={recommendedFlasks} />
      </SideBySidePanels>
    </SubSection>
  );
};

export default ConsumablesSubSection;
