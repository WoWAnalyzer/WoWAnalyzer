import { WCLGuildReport } from 'common/WCL_TYPES';
import RETAIL_ZONES, { Zone } from 'game/ZONES';
import CLASSIC_ZONES from 'game/classic/ZONES';
import { makePlainUrl } from 'interface/makeAnalyzerUrl';
import { Link } from 'react-router-dom';

interface Props {
  reports: WCLGuildReport[];
  classic: boolean;
}

function zoneGame(classic: boolean): Zone[] {
  return classic ? CLASSIC_ZONES : RETAIL_ZONES;
}

function zoneNameById(id: number, classic: boolean): string | undefined {
  return zoneGame(classic).find((zone) => zone.id === id)?.name;
}

const GuildReportsList = ({ reports, classic }: Props) => (
  <ul className="list reports-list">
    <li style={{ fontWeight: 'bold' }}>
      <div className="row">
        <div className="col-sm-2">Report Date</div>
        <div className="col-sm-5">Title</div>
        <div className="col-sm-2">Zone</div>
        <div className="col-sm-2">Owner</div>
      </div>
    </li>
    {reports.map((report) => {
      const url = makePlainUrl(report.id);

      return (
        <li key={url}>
          <Link to={url}>
            <div className="row">
              <div className="col-sm-2">
                {new Date(report.start).toLocaleString(import.meta.env.LOCALE)}
              </div>
              <div className="col-sm-5">{report.title}</div>
              <div className="col-sm-2">{zoneNameById(report.zone, classic)}</div>
              <div className="col-sm-2">{report.owner}</div>
              <div className="col-sm-1" style={{ color: 'white', textAlign: 'right' }}>
                <span
                  className="glyphicon glyphicon-chevron-right"
                  aria-hidden="true"
                  style={{ marginLeft: 10 }}
                />
              </div>
            </div>
          </Link>
        </li>
      );
    })}
  </ul>
);

export default GuildReportsList;
