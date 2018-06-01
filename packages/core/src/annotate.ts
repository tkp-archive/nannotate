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
    
    let model1 = new StreamingDataModel();

    let grid1 = new DataGrid({ style: blueStripeStyle });
    grid1.model = model1;
    Widget.attach(grid1, this.gridNode);
  }

  protected onActivateRequest(msg: Message): void {
    this.node.focus();
  }
}

class StreamingDataModel extends DataModel {

  static createRow(n: number): number[] {
    let row = new Array(n);
    for (let i = 0; i < n; ++i) {
      row[i] = Math.random();
    }
    return row;
  }

  constructor() {
    super();
    setInterval(this._tick, 250);
  }

  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? this._data.length : 1;
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? 50 : 1;
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
    return this._data[row][column];
  }

  private _tick = () => {
    let nr = this.rowCount('body');
    let nc = this.columnCount('body');
    let r1 = Math.random();
    let r2 = Math.random();
    let i = Math.floor(r2 * nr);
    if ((r1 < 0.45 && nr > 4) || nr >= 500) {
      this._data.splice(i, 1);
      this.emitChanged({ type: 'rows-removed', region: 'body', index: i, span: 1 });
    } else {
      this._data.splice(i, 0, StreamingDataModel.createRow(nc));
      this.emitChanged({ type: 'rows-inserted', region: 'body', index: i, span: 1 });
    }
  };

  private _data: number[][] = [];
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
