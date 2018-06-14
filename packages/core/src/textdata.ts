import {Widget} from '@phosphor/widgets';
import {Message} from '@phosphor/messaging';
import {DataSource, DataJSON} from './datasource';


export
class TextHelper extends Widget implements DataSource {
  constructor(ws: WebSocket) {
    let node = Private.createNode();
    super({ node: node });
    this._ws = ws;
    this._div = node;
  }

  public fromServer(data: DataJSON): void {
    if(data['command'] === 'C') {
      //CLEAR
      while(this._div.lastChild){
        this._div.removeChild(this._div.lastChild);
      }
      return;
    }

    if (data['command'] === 'Q') {
      //END
      this._ws.close();
      alert('Done!');
      return;
    }

    let x = <any>data['data'];

    let p = document.createElement('p');
    p.classList.add('data');

    for(let line of x['text'].split('\n')){
      for(let s of line.split(' ')){
        let span = document.createElement('span');
        span.onclick = function(){this.classList.toggle('selected')};
        span.textContent = s;
        span.classList.add('word');

        p.appendChild(span);
        let space = document.createElement('span');
        space.textContent = ' ';
        p.appendChild(space)
      }
      p.appendChild(document.createElement('br'));
    }

    this._div.appendChild(p);
    console.log('test');

  };


  toServer(msg: string, ws: WebSocket): void {
    if (msg === ''){
        ws.send(JSON.stringify({command: 'N'}));
    } else {
        let selected = this._div.querySelectorAll('span.selected');
        msg = msg.replace(/(\r\n\t|\n|\r\t)/gm,"");
        if (selected.length === 0){
            ws.send(JSON.stringify({command: 'A', annotation: msg}));
            let span = document.createElement('span');
            span.classList.add('annotation');
            span.style.color = 'green';
            span.textContent = msg;
            this._div.appendChild(span);

        } else {
            let ret = [];
            for(let i = 0; i < selected.length; i++){
                ret.push(selected[i].textContent);
                selected[i].classList.remove('selected');

                let span = document.createElement('span');
                // span.classList.add('tooltiptext');
                span.classList.add('annotation');

                span.textContent = msg;
                // selected[i].classList.add('tooltip');
                selected[i].appendChild(span);

            }
            ws.send(JSON.stringify({command: 'A', annotation: {[msg]:ret}}));
        }
    }
  }

  onAfterAttach(msg: Message) : void {

  }

  public _ws: WebSocket;
  private _div: HTMLDivElement;
}

namespace Private {
  export function createNode(): HTMLDivElement {
    let div = document.createElement('div');
    div.classList.add('TextData')
    return div;
  }
}