import loadScript from 'common/loadScript';

class BaseTooltipProvider {
  static libraryUrl = null;
  static baseUrl = null;

  static load() {
    loadScript(this.libraryUrl);
  }

  static spell(...args) {
    return `${this.baseUrl}${this.spellRelative(...args)}`;
  }
  static spellRelative(id) {
    throw new Error('NotImplemented');
  }
  static item(...args) {
    return `${this.baseUrl}${this.itemRelative(...args)}`;
  }
  static itemRelative(id, details) {
    throw new Error('NotImplemented');
  }
  static resource(...args) {
    return `${this.baseUrl}${this.resourceRelative(...args)}`;
  }
  static resourceRelative(id) {
    throw new Error('NotImplemented');
  }
  static refresh(elem) {
    throw new Error('NotImplemented');
  }
}

export default BaseTooltipProvider;
