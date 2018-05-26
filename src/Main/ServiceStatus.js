import React from 'react';
import PropTypes from 'prop-types';

const baseStatusUrl = 'https://status.wowanalyzer.com';

const STATUS = {
  OPERATIONAL: 1,
  PERFORMANCE_ISSUES: 2,
  PARTIAL_OUTAGE: 3,
  MAJOR_OUTAGE: 4,
};

class ServiceStatus extends React.PureComponent {
  static propTypes = {
    style: PropTypes.object,
  };

  constructor() {
    super();
    this.state = {
      status: null,
    };
  }

  componentWillMount() {
    this.fetchStatus()
      .then(status => {
        this.setState({
          status,
        });
      });
  }
  fetchStatus() {
    const url = `${baseStatusUrl}/api/v1/components`;

    return fetch(url)
      .then(response => response.json())
      .then(json => {
        // console.log('Received service status', json);
        if (!json.data) {
          throw new Error('Status response is missing data.');
        }
        return json.data.reduce((max, component) => {
          const status = Number(component.status);
          if (max === null || max < status) {
            return status;
          }
          return max;
        }, null);
      });
  }

  render() {
    const { style } = this.props;

    let message;
    let className;
    switch (this.state.status) {
      case STATUS.PERFORMANCE_ISSUES:
        message = 'Some systems are experiencing performance issues';
        className = 'alert-info';
        break;
      case STATUS.PARTIAL_OUTAGE:
        message = 'Some systems are experiencing issues';
        className = 'alert-warning';
        break;
      case STATUS.MAJOR_OUTAGE:
        message = 'Some systems are experiencing a major outage';
        className = 'alert-danger';
        break;
      case STATUS.OPERATIONAL:
      default:
        return null;
    }

    return (
      <div style={{ fontSize: '1.2em', fontWeight: 600, ...style }} className={`alert ${className}`}>
        {message}. <a href={baseStatusUrl}>More info</a>
      </div>
    );
  }
}

export default ServiceStatus;
