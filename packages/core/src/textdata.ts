import {Widget} from '@phosphor/widgets';
import {Message} from '@phosphor/messaging';
import {DataSource} from './datasource';


export
class TextHelper extends Widget implements DataSource {
  constructor(ws: WebSocket) {
    super({ node: Private.createNode() });
    this._ws = ws;
    this._tb = this.node.querySelector('table')!;
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

    let tr1 = document.createElement('tr');
    let tr2 = document.createElement('tr');
    for(let s of x['text'].split(' ')){
        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        td1.textContent = s;
        td2.textContent = ' ';
        tr1.appendChild(td1);
        tr2.appendChild(td2);
    }

    this._tb.appendChild(tr1);
    this._tb.appendChild(tr2);
    console.log('test');

  };

  onAfterAttach(msg: Message) : void {

  }

  public _ws: WebSocket;
  private _tb: HTMLTableElement;
}

namespace Private {
  export function createNode(): HTMLDivElement {
    let div = document.createElement('div');
    div.style.backgroundColor = 'red';
    div.classList.add('TextData')
    let table = document.createElement('table');
    table.classList.add('TextTable')
    div.appendChild(table);

    return div;
  }
}