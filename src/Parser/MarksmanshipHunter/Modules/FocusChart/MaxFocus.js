import Module from 'Parser/Core/Module';

class MaxFocus extends Module {
  on_byPlayer_cast(event){
    if (event.sourceID === this.owner.player.id && (event.type === 'cast' || event.type === 'energize')){
      this._focus = event.classResources[0]['max'];
    }
  }
}

export default MaxFocus;