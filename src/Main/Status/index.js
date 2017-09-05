import React from 'react';

import makeApiUrl from 'common/makeApiUrl';
import WclApiRequests from './WclApiRequests';

class Status extends React.Component {
  constructor() {
    super();
    this.state = {
      status: null,
    };
  }

  componentWillMount() {
    this.load();
  }
  load() {
    return fetch(makeApiUrl('status'))
      .then(response => response.json())
      .then((json) => {
        console.log('Received status', json);
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else {
          this.setState({
            status: json,
          });
        }
      });
  }

  render() {
    return (
      <div>
        <h1>WCL API requests per minute</h1>
        <WclApiRequests
          history={this.state.status}
        />
      </div>
    );
  }
}

export default Status;
