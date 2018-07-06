import {Widget} from '@phosphor/widgets';
import {Message} from '@phosphor/messaging';
import {DataSource, DataJSON} from './datasource';
import {AnnotateWidget} from './annotate';


export
class TextHelper extends Widget implements DataSource {
  constructor(annotate: AnnotateWidget, ws: WebSocket | any) {
    let node = Private.createNode();
    super({ node: node });
    this._ws = ws;
    this._div = node;
    this._annotate = annotate;
  }

  public fromServer(data: DataJSON): void {
    if(data['command'] === 'C') {
      // clear the displayed data
      while(this._div.lastChild){
        this._div.removeChild(this._div.lastChild);
      }
      return;
    }

    if (data['command'] === 'Q') {
      // end of data
      this._ws.close();
      alert('Done!');
      return;
    }

    let x = <any>data['data'];

    let p = document.createElement('p');
    p.classList.add('data');

    let i = 0;
    for(let line of x['text'].split('\n')){
      for(let s of line.split(' ')){
        let span = document.createElement('span');
        // the words of the data
        span.onclick = function(){this.classList.toggle('selected-word')};
        span.textContent = s;
        span.setAttribute('value', s);
        span.setAttribute('index', i.toString());
        i += 1;

        span.classList.add('word');

        // the annotations (potentially blank)
        let span2 = document.createElement('span');
        span2.classList.add('annotation');
        span2.textContent = '';
        span2.setAttribute('value', '');
        span.appendChild(span2)

        // the spaces between words
        p.appendChild(span);
        let space = document.createElement('span');
        space.textContent = ' ';
        p.appendChild(space)
      }
      p.appendChild(document.createElement('br'));
    }

    this._div.appendChild(p);

    document.addEventListener('onmouseup', ()=>{
      let selection = window.getSelection();
      let first = selection.anchorNode.parentElement;
      let last = selection.focusNode.parentElement;
      console.log(first);
      console.log(last);
      let spanning = false;
      for(let i =0; i< p.children.length; i++){
        if (p.children[i] === first){
          spanning = true;
          p.children[i].classList.add('selected-phrase');
        }
        else if (p.children[i] === last){
          spanning = false;
          p.children[i].classList.add('selected-phrase');
        }
        else if (spanning){
          p.children[i].classList.add('selected-phrase');
        } else {
          if (p.children[i].classList.contains('word')) {
            p.children[i].classList.remove('selected-phrase');
          }
        }
      }
    });

    // paragraph annotation
    let span = document.createElement('span');
    span.classList.add('annotation');
    span.style.color = 'green';


    if('annotation' in x){
      // paragraph annotation
      span.textContent = x['annotation']['paragraph'];
      span.setAttribute('value', x['annotation']['paragraph']);

      let _t = this;
      // word annotations
      for(let tag of Object.keys(x['annotation']['words'])){
        let word_m = x['annotation']['words'][tag]
        // word -> index
        for(let mapping of word_m){
          let word = mapping['word'].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
          let index = mapping['index'];
          let spans = p.querySelectorAll('span.word');
          for (let i = 0; i < spans.length; i++){

            // replace punctuation in text
            if (spans[i].getAttribute('value').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"") === word && i == index){
              spans[i].lastChild!.textContent = tag;
              (spans[i].lastChild! as HTMLSpanElement).setAttribute('value', tag);
              (spans[i].lastChild! as HTMLSpanElement).ondblclick = function(event: MouseEvent){
                //delete self on double click
                this.setAttribute('value', '');
                this.textContent = '';
                _t.submitWordAnnotation([], '');
                event.stopPropagation();
              }
            }
          }
        }
      }

      // phrase annotations
      for(let tag of Object.keys(x['annotation']['phrases'])){
        let phrase_m = x['annotation']['phrases'][tag]
        for(let mapping of phrase_m){
          let start = mapping['start'];
          let end = mapping['end'];
          let spans = p.querySelectorAll('span.word');

          let first = spans[start];
          let last = spans[end];

          let spanning = false;
          for(let i =0; i< p.children.length; i++){
            if (p.children[i] === first){
              spanning = true;
              let mark = document.createElement('mark');
              mark.appendChild(p.children[i]);

              p.children[i].insertAdjacentElement('beforebegin', mark);
            }
            else if (p.children[i] === last){
              spanning = false;
              let mark = document.createElement('mark');
              mark.appendChild(p.children[i]);

              let span = document.createElement('span');
              span.classList.add('annotation');
              span.style.color = 'purple';
              span.textContent = tag;

              p.children[i].insertAdjacentElement('beforebegin', mark);
              p.children[i].insertAdjacentElement('afterend', span);
              break;
            }
            else if (spanning){
              let mark = document.createElement('mark');
              mark.appendChild(p.children[i]);
              p.children[i].insertAdjacentElement('beforebegin', mark);
            }

          }
        }
      }

    }

    // default options
    if ('options' in x) {
      let options = this._annotate.optionsNode;

      // delete options from previous text
      while(options.lastChild){
        options.removeChild(options.lastChild);
      }

      if (Object.keys(x['options']).length == 0){
        options.style.flex = '0';
      } else {
        options.style.flex = '1';

        for(let option in x['options']){
          let opt_div = document.createElement('div');
          opt_div.classList.add('option');
          opt_div.textContent = x['options'][option];

          let _t = this;
          opt_div.onclick = function(){
              _t.toServer(this.textContent);
          }
          options.appendChild(opt_div);
        }
      }
    } else {
      let options = this._annotate.optionsNode;
      options.style.flex = '0';
    }
    this._div.appendChild(span);
  };

  /* 
   * Code to submit word annotations 
   */
  submitWordAnnotation(selected: any, msg: string): void{
      let ret = [];
      for(let i = 0; i < selected.length; i++){
          ret.push((selected[i] as HTMLSpanElement).getAttribute('value'));
          selected[i].classList.remove('selected-word');
          selected[i].lastChild!.textContent = msg;
          (selected[i].lastChild! as HTMLSpanElement).setAttribute('value', msg);

          (selected[i].lastChild! as HTMLSpanElement).ondblclick = function(event: MouseEvent){
            //delete self on double click
            this.setAttribute('value', '');
            this.textContent = '';
            event.stopPropagation();
          }
      }

      let words: {[key: string]: [{word:string, index:number}]} = {};

      let all_spans = this._div.querySelectorAll('span.word');
      for(let i = 0; i < all_spans.length; i++){
        if ((all_spans[i].lastChild! as HTMLSpanElement).getAttribute('value')! != ''){
          if (!((all_spans[i].lastChild! as HTMLSpanElement).getAttribute('value')! in words)){
            words[(all_spans[i].lastChild! as HTMLSpanElement).getAttribute('value')!] = [{word:(all_spans[i] as HTMLSpanElement).getAttribute('value')!.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,""), index: parseInt((all_spans[i] as HTMLSpanElement).getAttribute('index')!)}];
          } else {
            words[(all_spans[i].lastChild! as HTMLSpanElement).getAttribute('value')!].push({word:(all_spans[i] as HTMLSpanElement).getAttribute('value')!.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,""), index:parseInt((all_spans[i] as HTMLSpanElement).getAttribute('index')!)});
          }
        }
      }
      console.log(words);
      this._ws.send(JSON.stringify({command: 'A', annotation: {words:words}}));
  }


  /* 
   * Code to submit phrase annotations 
   */
  submitPhraseAnnotation(selected: Selection, msg: string): void{

  }

  toServer(msg: string): void {
    if (msg === ''){
        // go to the next set of data
        this._ws.send(JSON.stringify({command: 'N'}));
    } else {
        // if some text is selected, do that first
        let selection = window.getSelection();
        if (selection.rangeCount > 0){ // TODO check if selected range is in the selectable range
          this.submitPhraseAnnotation(selection, msg);
        } else {
          let selected = this._div.querySelectorAll('span.selected-word');
              // replace punctuation
          msg = msg.replace(/(\r\n\t|\n|\r\t)/gm,"");

          if (selected.length === 0){
              // annotate the paragraph
              this._ws.send(JSON.stringify({command: 'A', annotation: {paragraph:msg}}));
              this._div.lastChild!.textContent = msg;
              (this._div.lastChild! as HTMLSpanElement).setAttribute('value', msg);

          } else {
              // annotate 1+ words
            this.submitWordAnnotation(selected, msg);
          }
        }
    }
  }

  onAfterAttach(msg: Message) : void {

  }

  public _ws: WebSocket | any;
  private _div: HTMLDivElement;
  private _annotate: AnnotateWidget;
}

namespace Private {
  export function createNode(): HTMLDivElement {
    let div = document.createElement('div');
    div.classList.add('TextData')
    return div;
  }
}