import Spell from 'common/SPELLS/Spell';
import SpellLink from 'interface/SpellLink';
import { PanelHeader } from 'interface/guide/components/GuideDivs';

import styles from './Recommendations.module.scss';
import { ReactNode } from 'react';

interface Props {
  header: ReactNode;
  recommendations: Spell[];
}
const Recommendations = ({ header, recommendations }: Props) => (
  <>
    <PanelHeader>{header}</PanelHeader>
    <ul className={styles['recommendations']}>
      {recommendations.map((recommendation) => (
        <li key={recommendation.id}>
          <SpellLink id={recommendation} />
        </li>
      ))}
    </ul>
  </>
);

export default Recommendations;
