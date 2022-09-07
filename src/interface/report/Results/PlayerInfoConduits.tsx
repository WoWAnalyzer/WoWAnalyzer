import { ConduitLink } from 'interface/index';
import { Conduit } from 'parser/core/Events';

interface PlayerInfoConduitsProps {
  conduits: Conduit[] | undefined;
}

const PlayerInfoConduits = ({ conduits }: PlayerInfoConduitsProps) => (
  <div className="player-details-talents">
    <h3>Conduits</h3>
    <div className="conduit-info">
      {conduits?.map((conduit) => (
        <div
          key={conduit.spellID}
          className="col-md-12 flex-main"
          style={{ textAlign: 'left', margin: '5px auto' }}
        >
          <div className="row">
            <div className="col-md-10">
              <ConduitLink id={conduit.spellID} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default PlayerInfoConduits;
