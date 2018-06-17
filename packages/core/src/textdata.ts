import {Widget} from '@phosphor/widgets';
import {Message} from '@phosphor/messaging';
import {DataSource, DataJSON} from './datasource';


export
class TextHelper extends Widget implements DataSource {
  constructor(ws: WebSocket | any) {
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
        span.setAttribute('value', s);
        span.classList.add('word');

        let span2 = document.createElement('span');
        span2.classList.add('annotation');
        span2.textContent = '';
        span2.setAttribute('value', '');
        span.appendChild(span2)

        p.appendChild(span);
        let space = document.createElement('span');
        space.textContent = ' ';
        p.appendChild(space)
      }
      p.appendChild(document.createElement('br'));
    }

    this._div.appendChild(p);
    let span = document.createElement('span');
    span.classList.add('annotation');
    span.style.color = 'green';
    if('annotation' in x){
      span.textContent = x['annotation']['paragraph'];
      span.setAttribute('value', x['annotation']['paragraph']);

      let _t = this;
      for(let tag of Object.keys(x['annotation']['phrases'])){
        let phrase = x['annotation']['phrases'][tag]
        for(let word of phrase){
          let spans = p.querySelectorAll('span.word');
          for (let i = 0; i < spans.length; i++){
            if (spans[i].getAttribute('value') === word){
              spans[i].lastChild!.textContent = tag;
              (spans[i].lastChild! as HTMLSpanElement).setAttribute('value', tag);
              (spans[i].lastChild! as HTMLSpanElement).onclick = function(event: MouseEvent){
                //delete self on click
                this.setAttribute('value', '');
                this.textContent = '';
                _t.submitAnnotation([], '');
                event.stopPropagation();
              }
            }
          }
        }
      }
    }



    this._div.appendChild(span);
    console.log('test');

  };

  submitAnnotation(selected: any, msg: string): void{
      let ret = [];
      for(let i = 0; i < selected.length; i++){
          ret.push((selected[i] as HTMLSpanElement).getAttribute('value'));
          selected[i].classList.remove('selected');
          selected[i].lastChild!.textContent = msg;
          (selected[i].lastChild! as HTMLSpanElement).setAttribute('value', msg);

          (selected[i].lastChild! as HTMLSpanElement).onclick = function(event: MouseEvent){
            //delete self on click
            this.setAttribute('value', '');
            this.textContent = '';
            event.stopPropagation();
          }
      }

      let phrases: {[key: string]: [string]} = {};

      let all_spans = this._div.querySelectorAll('span.word');
      for(let i = 0; i < all_spans.length; i++){
        if ((all_spans[i].lastChild! as HTMLSpanElement).getAttribute('value')! != ''){
          if (!((all_spans[i].lastChild! as HTMLSpanElement).getAttribute('value')! in phrases)){
            phrases[(all_spans[i].lastChild! as HTMLSpanElement).getAttribute('value')!] = [(all_spans[i] as HTMLSpanElement).getAttribute('value')!.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")];
          } else {
            phrases[(all_spans[i].lastChild! as HTMLSpanElement).getAttribute('value')!].push((all_spans[i] as HTMLSpanElement).getAttribute('value')!.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,""));
          }
        }
      }
      console.log(phrases);
      this._ws.send(JSON.stringify({command: 'A', annotation: {phrases:phrases}}));
  }

  toServer(msg: string): void {
    if (msg === ''){
        this._ws.send(JSON.stringify({command: 'N'}));
    } else {
        let selected = this._div.querySelectorAll('span.selected');
        msg = msg.replace(/(\r\n\t|\n|\r\t)/gm,"");

        if (selected.length === 0){
            this._ws.send(JSON.stringify({command: 'A', annotation: {paragraph:msg}}));
            this._div.lastChild!.textContent = msg;
            (this._div.lastChild! as HTMLSpanElement).setAttribute('value', msg);

        } else {
          this.submitAnnotation(selected, msg);
        }
    }
  }

  onAfterAttach(msg: Message) : void {

  }

  public _ws: WebSocket | any;
  private _div: HTMLDivElement;
}

namespace Private {
  export function createNode(): HTMLDivElement {
    let div = document.createElement('div');
    div.classList.add('TextData')
    return div;
  }
}