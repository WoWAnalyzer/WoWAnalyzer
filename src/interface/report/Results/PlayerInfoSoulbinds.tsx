import { SpellLink } from 'interface';
import { SoulbindTrait } from 'parser/core/Events';

interface PlayerInfoSoulbindProps {
  soulbinds: SoulbindTrait[] | undefined;
}

const isRenderableSoulbind = (soulbind: SoulbindTrait): boolean => soulbind.spellID !== 0;

const PlayerInfoSoulbinds = ({ soulbinds }: PlayerInfoSoulbindProps) => (
  <div className="player-details-talents">
    <h3>Soulbinds</h3>
    <div className="soulbind-info">
      {soulbinds?.filter(isRenderableSoulbind).map((soulbind) => (
        <div
          key={soulbind.spellID}
          className="col-md-12 flex-main"
          style={{ textAlign: 'left', margin: '5px auto' }}
        >
          <div className="row">
            <div className="col-md-10">
              <SpellLink id={soulbind.spellID} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default PlayerInfoSoulbinds;
