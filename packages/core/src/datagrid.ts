import {
  DataModel
} from '@phosphor/datagrid';

import {DataSource} from './datasource';


export
class GridHelper extends DataModel implements DataSource {
  constructor(ws: WebSocket) {
    super();
    this._ws = ws;
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

  public tick(event: MessageEvent): void {
    let nr = this.rowCount('body');
    // this._data.splice(i, 1);
    // this.emitChanged({ type: 'rows-removed', region: 'body', index: i, span: 1 });
    console.log(event.data)
    if(!event.data){
      return;
    }
    let x = JSON.parse(event.data);
    if (Object.keys(x).length === 0){
      this._ws.close();
      alert('Done!');
      return;
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