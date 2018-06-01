import {
  Message
} from '@phosphor/messaging';

import {Widget} from '@phosphor/widgets';

import {
  DataGrid, DataModel
} from '@phosphor/datagrid';


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

  get gridNode(): HTMLDivElement {
    return this.node.getElementsByClassName('nano-grid')[0] as HTMLDivElement;
  }

  onAfterAttach(msg: Message) : void {
      let blueStripeStyle: DataGrid.IStyle = {
    ...DataGrid.defaultStyle,
    rowBackgroundColor: i => i % 2 === 0 ? 'rgba(138, 172, 200, 0.3)' : '',
    columnBackgroundColor: i => i % 2 === 0 ? 'rgba(100, 100, 100, 0.1)' : ''};
    
    let model1 = new LargeDataModel();

    let grid1 = new DataGrid({ style: blueStripeStyle });
    grid1.model = model1;
    Widget.attach(grid1, this.gridNode);
  }

  protected onActivateRequest(msg: Message): void {
    this.node.focus();
  }
}

class LargeDataModel extends DataModel {

  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? 1000000000000 : 2;
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? 1000000000000 : 3;
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    if (region === 'row-header') {
      return `R: ${row}, ${column}`;
    }
    if (region === 'column-header') {
      return `C: ${row}, ${column}`;
    }
    if (region === 'corner-header') {
      return `N: ${row}, ${column}`;
    }
    return `(${row}, ${column})`;
  }
}


namespace Private {
  export function createNode(): HTMLDivElement {
    let div = document.createElement('div');
    let grid_holder = document.createElement('div');
    grid_holder.classList.add('nano-grid');
    let io_holder = document.createElement('div');
    io_holder.classList.add('nano-io');
    div.appendChild(grid_holder);
    div.appendChild(io_holder);
    return div;
  }
}
