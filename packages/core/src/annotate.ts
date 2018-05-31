import {
  Message
} from '@phosphor/messaging';

import {
  Widget
} from '@phosphor/widgets';

import '../style/index.css';


export
class AnnotateWidget extends Widget {

  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let content = document.createElement('div');

    node.appendChild(content);
    return node;
  }

  constructor() {
    super({ node: AnnotateWidget.createNode() });
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass('controls');
    this.title.label = 'Annotation';
    this.title.closable = false;
    this.title.caption = 'Annotation';
    this.node.id = 'annotate';

  }

  // get inputNode(): HTMLInputElement {
  //   return this.node.getElementsByTagName('input')[0] as HTMLInputElement;
  // }


  protected onActivateRequest(msg: Message): void {
    this.node.focus();
  }
}
