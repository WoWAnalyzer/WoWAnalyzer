import React from 'react';

class Hotkeys extends React.PureComponent {
  constructor() {
    super();
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(e) {
    if (document.activeElement && document.activeElement !== document.body) {
      return;
    }
    //Make it more unlikely that people go to localhost
    if (e.ctrlKey && e.key === 'l') {
      console.log('Pressed "l". This is a shortcut for redirecting to localhost');
      window.location = `http://localhost:3000${window.location.pathname}`;
    }
  }

  render() {
    return null;
  }
}

export default Hotkeys;
