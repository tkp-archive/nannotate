import {Widget} from '@phosphor/widgets';
import {Message} from '@phosphor/messaging';
import {DataSource} from './datasource';


export
class TextHelper extends Widget implements DataSource {
  constructor(ws: WebSocket) {
    super({ node: Private.createNode() });
    this._ws = ws;
  }

  public tick(event: MessageEvent): void {
    console.log(event.data)
    if(!event.data){
      return;
    }
    let x = JSON.parse(event.data);
    if (Object.keys(x).length === 0){
      this._ws.close();
      alert('Done!');
      return;
    }
    console.log('test');
  };

  onAfterAttach(msg: Message) : void {

  }

  public _ws: WebSocket;
}

namespace Private {
  export function createNode(): HTMLDivElement {
    let div = document.createElement('div');
    div.style.backgroundColor = 'red';
    return div;
  }
}