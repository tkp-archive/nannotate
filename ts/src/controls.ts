import {
  Message
} from '@phosphor/messaging';

import {
  Widget
} from '@phosphor/widgets';

import '../ts/style/index.css';


export
class ControlsWidget extends Widget {

  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let content = document.createElement('div');

    node.appendChild(content);
    return node;
  }

  constructor() {
    super({ node: ControlsWidget.createNode() });
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass('controls');
    this.title.label = 'Controls';
    // this.title.closable = false;
    this.title.closable = true;
    this.title.caption = 'Controls';
    this.node.id = 'controls';

  }

  // get inputNode(): HTMLInputElement {
  //   return this.node.getElementsByTagName('input')[0] as HTMLInputElement;
  // }


  protected onActivateRequest(msg: Message): void {
    this.node.focus();
  }
}
