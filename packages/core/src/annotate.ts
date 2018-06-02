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


  get controlsNode(): HTMLDivElement {
    return this.node.getElementsByClassName('nano-controls')[0] as HTMLDivElement;
  }

  get textAreaNode(): HTMLTextAreaElement {
    return this.node.getElementsByClassName('nano-io-controls-input')[0] as HTMLTextAreaElement;
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

    let textarea = this.textAreaNode;
    textarea.onkeyup = (event: KeyboardEvent) => {
      if(event.keyCode === 13){
        if(textarea.value === '' || textarea.value === '\n' || textarea.value === '\r\n'){
          (<StreamingDataModel>grid1.model)._ws.send('');
        } else {
          (<StreamingDataModel>grid1.model)._ws.send(textarea.value);
        }
        textarea.value = '';
      }
    }
  }

  protected onActivateRequest(msg: Message): void {
    this.node.focus();
  }
}


class StreamingDataModel extends DataModel {
  constructor() {
    super();
    this._ws = new WebSocket('ws://localhost:8991/api/ws');
    this._ws.onmessage = this._tick;
  }

  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? this._data.length : 1;
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? (this._data[0] ? this._data[0].length : 1) : 1;
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

  private _tick = (event: MessageEvent) => {
    let nr = this.rowCount('body');
    // this._data.splice(i, 1);
    // this.emitChanged({ type: 'rows-removed', region: 'body', index: i, span: 1 });
    console.log(event.data)
    if(!event.data){
      return;
    }
    let x = JSON.parse(event.data);
    if (! x){
      this._ws.close();
      alert('Done!');
      return
    }
    let keys = Object.keys(x);
    let row_s = x[keys[1]];
    let row_k = Object.keys(row_s);
    let new_row = new Array(row_k.length+1);

    let prev_col = this.columnCount('body');

    let i = 1;
    for(let key of row_k){
        new_row[i] = row_s[key];
        i++;
    }
    new_row[0] = keys[1];

    let row_num = nr;

    for(let i = 0; i < this.rowCount('body'); i++){
      if(new_row[0] === this._data[i][0]){
        row_num = i
        break;
      }
    }

    if(row_num == nr){
      //insert row
      this._data.splice(row_num, 0, new_row);
      //emit new row
      this.emitChanged({ type: 'rows-inserted', region: 'body', index: row_num, span: 1 });
    } else {
      //replace row
      this._data[row_num] = new_row;
      for(let i=0; i<new_row.length; i++){
        //emit cell change
        this.emitChanged({ type: 'cells-changed', region: 'body', rowIndex: row_num, columnIndex: i, rowSpan: 1, columnSpan: 1 });
      }
    }

    if (new_row.length > prev_col){
      for(let j = 0; j < this._data.length; j++){
        if(this._data[j].length < new_row.length){
          for(let i = this._data[j].length; i < new_row.length; i++){
            this._data[j].push(['']);
          }
        }
      }
      for(let i = prev_col; i < new_row.length; i++){
        this.emitChanged({ type: 'columns-inserted', region: 'body', index: i, span: 1 });
      }
    }
  };

  private _data: object[][] = [];
  public _ws: WebSocket;
}


namespace Private {
  export function createNode(): HTMLDivElement {
    let div = document.createElement('div');

    let grid_holder = document.createElement('div');
    grid_holder.classList.add('nano-grid-holder');

    grid_holder.innerHTML = '<div class="nano-grid"></div><div class="nano-grid-controls"><input type="button" value="+"></div>'

    let io_holder = document.createElement('div');
    io_holder.classList.add('nano-io-holder');

    io_holder.innerHTML = '<div class="nano-controls"><textarea class="nano-io-controls-input"></textarea></div><div class="nano-io-controls"><input type="button" value="Next"><input type="button" value="Previous"><input type="button" value="Skip"></div>'

    div.appendChild(grid_holder);
    div.appendChild(io_holder);
    return div;
  }
}
