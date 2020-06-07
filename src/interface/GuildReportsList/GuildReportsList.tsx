import React from 'react';
import { Link } from 'react-router-dom';
import { WCLGuildReportsResponse } from 'interface/GuildReports/GuildReports';
import { makePlainUrl }from 'interface/common/makeAnalyzerUrl';
import ZONES from 'game/ZONES';

interface Props {
  reports: Array<WCLGuildReportsResponse>,
}

function zoneNameById(id: number): string | undefined {
  return ZONES.find(zone => zone.id === id)?.name;
}

class GuildReportsList extends React.PureComponent<Props> {
  render() {
    const { reports } = this.props;
    return (
      <ul className="list reports-list">
        <li style={{fontWeight:'bold'}}>
          <div className="row">
            <div className="col-sm-2">Report Date</div>
            <div className="col-sm-5">Title</div>
            <div className="col-sm-2">Zone</div>
            <div className="col-sm-2">Owner</div>
          </div>
        </li>
        {reports.map(report => {
          const url = makePlainUrl(report.id);
          console.log(url);
          return (
            <li key={url}>
              <Link to={url}>
                <div className="row">
                  <div className="col-sm-2">{new Date(report.start).toLocaleString()}</div>
                  <div className="col-sm-5">{report.title}</div>
                  <div className="col-sm-2">{zoneNameById(report.zone)}</div>
                  <div className="col-sm-2">{report.owner}</div>
                  <div className="col-sm-1" style={{ color: 'white', textAlign: 'right' }}>
                    <span className="glyphicon glyphicon-chevron-right" aria-hidden="true" style={{ marginLeft: 10 }} />
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }
}

export default GuildReportsList;
