import {Message} from '@phosphor/messaging';
import {Widget} from '@phosphor/widgets';
// import {DataSource} from './datasource';
import {DataManager} from './datamanager';

import '../style/index.css';


export
class AnnotateWidget extends Widget {
  constructor(base = '', comm = false) {
    let div = document.createElement('div');

    let data_holder = document.createElement('div');
    data_holder.classList.add('nano-data-holder');

    let data = document.createElement('div');
    data.classList.add('nano-data');
    data_holder.appendChild(data);

    let io_holder = document.createElement('div');
    io_holder.classList.add('nano-io-holder');

    let controls = document.createElement('div');
    controls.classList.add('nano-controls');

    let options = document.createElement('div');
    options.classList.add('nano-controls-options');

    let input = document.createElement('textarea');
    input.classList.add('nano-controls-input');
    controls.appendChild(input);

    let controls_buttons = document.createElement('div');
    controls_buttons.classList.add('nano-controls-buttons');

    let next = document.createElement('div');
    next.classList.add('next-button');
    next.textContent = 'Next';
    next.onclick = () => {
      this._manager._ws.send(JSON.stringify({'command': 'N'}));
    }

    let previous = document.createElement('div');
    previous.textContent = 'Previous';
    previous.classList.add('prev-button');
    previous.onclick = () => {
      this._manager._ws.send(JSON.stringify({'command': 'P'}));
    }

    // let skip = document.createElement('div');
    // skip.textContent = 'Skip';
    // skip.onclick = () => {
    //   this._manager._ws.send(JSON.stringify({'command': 'N'}));
    // }

    controls_buttons.appendChild(next);
    controls_buttons.appendChild(previous);
    // controls_buttons.appendChild(skip);

    io_holder.appendChild(options);
    io_holder.appendChild(controls);
    io_holder.appendChild(controls_buttons);

    div.appendChild(data_holder);
    div.appendChild(io_holder);

    super({ node: div});
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass('nano-annotate');

    this.title.label = 'Annotation';
    this.title.closable = false;
    this.title.caption = 'Annotation';
    this.node.id = 'annotate';
    this._base = base;
    this._comm = comm;
  }

  get dataNode(): HTMLDivElement {
    return this.node.getElementsByClassName('nano-data')[0] as HTMLDivElement;
  }

  get controlsNode(): HTMLDivElement {
    return this.node.getElementsByClassName('nano-controls')[0] as HTMLDivElement;
  }

  get textAreaNode(): HTMLTextAreaElement {
    return this.node.getElementsByClassName('nano-controls-input')[0] as HTMLTextAreaElement;
  }

  get nextButtonNode(): HTMLDivElement {
    return this.node.querySelector('div.next-button') as HTMLDivElement;
  }

  get prevButtonNode(): HTMLDivElement {
    return this.node.querySelector('div.prev-button') as HTMLDivElement;
  }

  get optionsNode(): HTMLDivElement {
    return this.node.querySelector('div.nano-controls-options') as HTMLDivElement;
  }


  onAfterAttach(msg: Message) : void {
    this._manager = new DataManager(this, this._base, this._comm);
    let textarea = this.textAreaNode;

    textarea.onkeyup = (event: KeyboardEvent) => {
      if(event.keyCode === 8){
        if(textarea.value === ''){
          this._manager._ws.send(JSON.stringify({command: 'P'}));
        }
      }
      if(event.keyCode === 13){
        if(textarea.value === '' || textarea.value === '\n' || textarea.value === '\r\n'){
          this._manager.toServer('');
        }
        else if(textarea.value === 'q\r\n' || textarea.value === 'q\n'){
          this._manager._ws.send(JSON.stringify({command: 'Q'}));
        } else {
          this._manager.toServer(textarea.value);
        }
        textarea.value = '';
      }
    }
  }

  onResize(msg: Widget.ResizeMessage): void {
    this._manager.onResize(msg);
  }

  protected onActivateRequest(msg: Message): void {
    this.node.focus();
  }

  private _manager: DataManager;
  private _base: string;
  private _comm: boolean;
}
