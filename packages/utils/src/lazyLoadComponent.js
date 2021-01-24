import React from 'react';

import DelayRender from 'interface/DelayRender';

export default function lazyLoadComponent(load, delay = 1000) {
  class ComponentLazyLoader extends React.PureComponent {
    static loadedComponent = null;
    state = {
      loaded: Boolean(ComponentLazyLoader.loadedComponent),
    };

    constructor() {
      super();
      if (!this.constructor.loadedComponent) {
        load().then(component => {
          this.constructor.loadedComponent = component;
          this.setState({
            loaded: true,
          });
        });
      }
    }

    render() {
      const { loaded } = this.state;
      if (loaded) {
        const Component = this.constructor.loadedComponent;
        return <Component {...this.props} />;
      }
      return (
        <DelayRender delay={delay}>
          <div className="spinner" style={{ fontSize: 5 }} />
        </DelayRender>
      );
    }
  }

  return ComponentLazyLoader;
}
