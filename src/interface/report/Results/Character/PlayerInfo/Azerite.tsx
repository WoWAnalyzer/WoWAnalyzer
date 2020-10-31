import React, { useState, useEffect } from 'react';

import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import AZERITE_SPELLS from 'common/SPELLS/bfa/azeritetraits';
import { makeSpellApiUrl } from 'common/makeApiUrl';

const FALLBACK_ICON = 'inv_misc_questionmark';
const ITEM_SLOT: {[key: string]: string} = {
  0: "Helm",
  2: "Shoulders",
  4: "Chest",
};

export interface Azerite {
  icon: string,
  id: number,
  name: string
}

export interface AzeriteByItemSlot {
  [key: string]: number[];
}
export interface Props {
  azerite: AzeriteByItemSlot;
}

const Azerite = ({azerite}: Props) => {
  const [azeriteSpells, setAzeriteSpells] = useState<Azerite[]>(Object.values(AZERITE_SPELLS));

  useEffect(() => {
    // load missing azerite-icons and add them to the components state after it got fetched
    const missingIcons: Azerite[] = [];
    const traits: number[] = Object.values(azerite).reduce((acc: any, val: any) => acc.concat(val), []);
    traits.forEach((traitId: number) => {
      const trait = azeriteSpells.find((e: Azerite) => e.id === traitId, 10);

      if (!trait && !missingIcons.find((i: any) => i.id === traitId)) {
        missingIcons.push({ id: traitId, icon: FALLBACK_ICON, name: 'Unknown' });
      }
    });

    missingIcons.forEach(currentIcon => {
      const { id } = currentIcon;
      fetch(makeSpellApiUrl(id))
        .then(response => response.json())
        .then((data: Azerite) => {
          const newTrait: Azerite = {
            id,
            name: data.name,
            icon: data.icon,
          };

          const newAzerite = [...azeriteSpells, newTrait];
          setAzeriteSpells(newAzerite);
        })
        .catch(() => {
          // ignore errors
        });
    });
  }, [azerite, azeriteSpells, setAzeriteSpells]);

    return (
      <>
        <h3>
          Azerite Powers
        </h3>
        <div className="azerite-traits">
          {Object.keys(azerite).map((slotId: string) => (
            <div className="azerite-traits-column" key={slotId}>
              <div className="azerite-slot-title">{ITEM_SLOT[slotId]}</div>
              {
              azerite[slotId].map((spellId: number) => {
                const spell = azeriteSpells.find((e: Azerite) => e.id === spellId);
                return (
                  <div key={spellId} style={{ display: 'inline-block', textAlign: 'center' }}>
                    <SpellLink
                      id={spellId}
                      style={{ margin: '5px', display: 'block', fontSize: '46px', lineHeight: 1 }}
                      icon={false}
                    >
                      <Icon icon={spell ? spell.icon : FALLBACK_ICON} style={{ border: '3px solid currentColor' }} />
                    </SpellLink>
                  </div>
                );
              })
            }
            </div>
          ))}
        </div>
      </>
    );
}

export default Azerite;
