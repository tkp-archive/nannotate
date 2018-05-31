import {
  Message
} from '@phosphor/messaging';

import {
  Widget
} from '@phosphor/widgets';

import '../style/index.css';


export
class ControlsWidget extends Widget {
  constructor() {
    super({ node: Private.createNode() });
    
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass('controls');

    this.title.label = 'Controls';
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


namespace Private {
  export function createNode(): HTMLDivElement {
    let div = document.createElement('div');
    div.classList.add('nano-controls');

    return div;
  }
}
