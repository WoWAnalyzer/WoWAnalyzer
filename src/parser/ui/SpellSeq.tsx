import styled from '@emotion/styled';
import Spell from 'common/SPELLS/Spell';
import { Fragment } from 'react';
import { SpellIcon } from 'interface';
import { ChevronIcon } from 'interface/icons';

const SequenceContainer = styled.div`
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 24px;

  & svg {
    transform: rotate(-90deg);
    height: 18px;
    margin-top: calc(24px / 2 - 18px / 2);
  }

  & img.icon {
    height: 24px;
  }
`;

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
