import cssComponent from "interface/utils/css-component";
import styles from "./SpellSeq.module.scss";
import Spell from 'common/SPELLS/Spell';
import { Fragment } from 'react';
import { SpellIcon } from 'interface';
import { ChevronIcon } from 'interface/icons';

const SequenceContainer = cssComponent("div", styles.SequenceContainer, [] as const);

export const SpellSeq = ({ spells }: { spells: Spell[] }) => (
  <SequenceContainer>
    {spells.map((spell, index, array) => (
      <Fragment key={index}>
        <SpellIcon spell={spell} key={index} />
        {index < array.length - 1 && <ChevronIcon />}
      </Fragment>
    ))}
  </SequenceContainer>
);
