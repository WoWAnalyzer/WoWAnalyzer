import loadScript from 'common/loadScript';

class BaseTooltipProvider {
  static libraryUrl: string;
  static baseUrl: string;

  static load() {
    loadScript(this.libraryUrl);
  }

  static spell(...args: [number, any]) {
    return `${this.baseUrl}${this.spellRelative(...args)}`;
  }
  static spellRelative(id: number, details: any) {
    throw new Error('NotImplemented');
  }
  static item(...args: [number, any]) {
    return `${this.baseUrl}${this.itemRelative(...args)}`;
  }
  static itemRelative(id: number, details: any) {
    throw new Error('NotImplemented');
  }
  static resource(...args: [number]) {
    return `${this.baseUrl}${this.resourceRelative(...args)}`;
  }
  static resourceRelative(id: number) {
    throw new Error('NotImplemented');
  }
  static refresh(elem: any) {
    throw new Error('NotImplemented');
  }

  static npc(id: number): string {
    return `${this.baseUrl}${this.npcRelative(id)}`;
  }
  static npcRelative(id: number): string {
    throw new Error('NotImplemented');
  }
}

export default BaseTooltipProvider;
