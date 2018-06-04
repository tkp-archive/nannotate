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
          this._manager.send('');
        } else {
          this._manager.send(textarea.value);
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

    data_holder.innerHTML = '<div class="nano-data"></div><div class="nano-data-controls"><input type="button" value="+"></div>'

    let io_holder = document.createElement('div');
    io_holder.classList.add('nano-io-holder');

    io_holder.innerHTML = '<div class="nano-controls"><textarea class="nano-io-controls-input"></textarea></div><div class="nano-io-controls"><input type="button" value="Next"><input type="button" value="Previous"><input type="button" value="Skip"></div>'

    div.appendChild(data_holder);
    div.appendChild(io_holder);
    return div;
  }
}
