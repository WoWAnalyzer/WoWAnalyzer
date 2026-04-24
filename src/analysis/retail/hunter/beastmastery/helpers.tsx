import { SpellLink } from 'interface';
import Spell from 'common/SPELLS/Spell';
import React from 'react';

export function ProseListSpell({ spells }: { spells: (number | Spell)[] }) {
  if (spells.length === 0) return null;
  if (spells.length === 1) return <SpellLink spell={spells[0]} />;
  if (spells.length === 2)
    return (
      <>
        <SpellLink spell={spells[0]} /> and <SpellLink spell={spells[1]} />
      </>
    );

  return (
    <>
      {spells.slice(0, -1).map((spell, i) => (
        <React.Fragment key={i}>
          <SpellLink spell={spell} />
          {', '}
        </React.Fragment>
      ))}
      and <SpellLink spell={spells.at(-1)!} />
    </>
  );
}
