import {Message} from '@phosphor/messaging';
import {Widget} from '@phosphor/widgets';
// import {DataSource} from './datasource';
import {DataManager} from './datamanager';

import '../style/index.css';


export
class AnnotateWidget extends Widget {
  constructor() {
    super({ node: Private.createNode() });
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass('nano-annotate');

    this.title.label = 'Annotation';
    this.title.closable = false;
    this.title.caption = 'Annotation';
    this.node.id = 'annotate';
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
    this._manager = new DataManager('ws://localhost:8991/api/ws', this.dataNode);
    let textarea = this.textAreaNode;

    textarea.onkeyup = (event: KeyboardEvent) => {
      if(event.keyCode === 13){
        if(textarea.value === '' || textarea.value === '\n' || textarea.value === '\r\n'){
          this._manager.toServer('');
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
}


namespace Private {
  export function createNode(): HTMLDivElement {
    let div = document.createElement('div');

    let data_holder = document.createElement('div');
    data_holder.classList.add('nano-data-holder');

    // data_holder.innerHTML = '<div class="nano-data"></div><div class="nano-data-controls"><input type="button" value="+"></div>'
    let data = document.createElement('div');
    data.classList.add('nano-data');
    data_holder.appendChild(data);

    let io_holder = document.createElement('div');
    io_holder.classList.add('nano-io-holder');

    let controls = document.createElement('div');
    controls.classList.add('nano-controls');
    let input = document.createElement('textarea');
    controls.appendChild(input);

    let io_controls = document.createElement('div');
    io_controls.classList.add('nano-io-controls');

    let next = document.createElement('input');
    next.type = 'button';
    next.value = 'Next';

    let previous = document.createElement('button');
    previous.type = 'button';
    previous.value = 'Previous';

    let skip = document.createElement('button');
    skip.type = 'button';
    skip.value = 'Skip';

    io_controls.appendChild(next);
    io_controls.appendChild(previous);
    io_controls.appendChild(skip);

    io_holder.appendChild(controls);
    io_holder.appendChild(io_controls);

    div.appendChild(data_holder);
    div.appendChild(io_holder);
    return div;
  }
}
