import React, { useState, useEffect } from 'react';

import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import ESSENCES from 'common/SPELLS/bfa/essences';
import { makeSpellApiUrl } from 'common/makeApiUrl';
import { Essence } from 'parser/core/Combatant';

const FALLBACK_ICON = 'inv_misc_questionmark';

interface EssenceIcon {
  icon: string;
  id: number;
  name: string;
  traitId?: number;
}

interface Props {
  essences: Essence[];
}
const EssenceComponent = ({essences}: Props) => {
  const [essenceIcons, setEssenceIcons] = useState<EssenceIcon[]>(Object.values(ESSENCES));

  const convertRankIntoQuality = (rank: number) => {
    switch (rank) {
      default:
      case 1:
        return 'uncommon';
      case 2:
        return 'rare';
      case 3:
        return 'epic';
      case 4:
        return 'legendary';
    }
  }
  useEffect(() => {
    // load missing essence-icons and add them to the components state after it got fetched
    const missingIcons: EssenceIcon[] = [];
    essences.forEach((essence: Essence) => {
      const foundEssence = essenceIcons.find((e: EssenceIcon) => e.id === essence.spellID);

      if (!foundEssence && !missingIcons.find(i => i.id === essence.spellID)) {
        missingIcons.push({ id: essence.spellID, icon: FALLBACK_ICON, name: 'Unknown' });
      }
    });

    missingIcons.forEach(currentEssence => {
      const traitId = currentEssence.id;
      fetch(makeSpellApiUrl(traitId))
        .then(response => response.json())
        .then(data => {
          const newTrait = {
            id: traitId,
            name: data.name,
            icon: data.icon,
          };

          const newEssence = [...essenceIcons, newTrait];
          setEssenceIcons(newEssence);
        })
        .catch(() => {
          // ignore errors
        });
    });
  }, [essenceIcons, essences]);

    return (
      <>
        <h3>
          Heart of Azeroth Essences
        </h3>
        <div className="essences">
          <div className="essence-row">
            {Object.values(essences).map((essence, index) => {
              const quality = convertRankIntoQuality(essence.rank);
              const height = index === 0 ? '60px' : '45px';
              return (
                <div key={essence.spellID} style={{ display: 'inline-block', textAlign: 'center' }}>
                  <SpellLink
                    id={essence.spellID}
                    style={{ margin: '5px', display: 'block', fontSize: '46px', lineHeight: 1 }}
                    icon={false}
                  >
                    <Icon icon={essence ? essence.icon : FALLBACK_ICON} style={{ border: '3px solid', height: height }} className={quality} />
                  </SpellLink>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }

export default EssenceComponent;

