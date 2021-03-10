import { ReactNode } from 'react';
import Module from 'parser/core/Module';

class ChecklistModule extends Module {
  static dependencies = {};

  render(): ReactNode {
    // Override this method and return your component
    throw new Error('NotImplemented');
  }
}

export default ChecklistModule;
