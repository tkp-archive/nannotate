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

    let input = document.createElement('textarea');
    input.classList.add('nano-io-controls-input');
    controls.appendChild(input);

    let io_controls = document.createElement('div');
    io_controls.classList.add('nano-io-controls');

    let next = document.createElement('div');
    next.textContent = 'Next';
    next.onclick = () => {
      this._manager._ws.send(JSON.stringify({'command': 'N'}));
    }

    let previous = document.createElement('div');
    previous.textContent = 'Previous';
    previous.onclick = () => {
      this._manager._ws.send(JSON.stringify({'command': 'P'}));
    }

    let skip = document.createElement('div');
    skip.textContent = 'Skip';
    skip.onclick = () => {
      this._manager._ws.send(JSON.stringify({'command': 'N'}));
    }

    io_controls.appendChild(next);
    io_controls.appendChild(previous);
    io_controls.appendChild(skip);

    io_holder.appendChild(controls);
    io_holder.appendChild(io_controls);

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
    return this.node.getElementsByClassName('nano-io-controls-input')[0] as HTMLTextAreaElement;
  }

  onAfterAttach(msg: Message) : void {
    this._manager = new DataManager(this.dataNode, this._base, this._comm);
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
