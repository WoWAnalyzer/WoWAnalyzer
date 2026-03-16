import Spell from 'common/SPELLS/Spell';
import { Fragment } from 'react';
import { SpellIcon } from 'interface';
import { ChevronIcon } from 'interface/icons';
import styles from './SpellSeq.module.scss';

export const SpellSeq = ({ spells }: { spells: Spell[] }) => (
  <div className={styles.sequenceContainer}>
    {spells.map((spell, index, array) => (
      <Fragment key={index}>
        <SpellIcon spell={spell} key={index} />
        {index < array.length - 1 && <ChevronIcon />}
      </Fragment>
    ))}
  </div>
);
