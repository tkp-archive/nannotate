import {Widget} from '@phosphor/widgets';
import {GridHelper} from './datagrid';
import {TextHelper} from './textdata';
import {DataSource} from './datasource';
import {DataGrid} from '@phosphor/datagrid';



export
class DataManager{
    constructor(ws: string, bind: HTMLDivElement){
        this._ws = new WebSocket('ws://localhost:8991/api/ws');
        this._ws.onmessage = (event: MessageEvent) => this.open(event);
        this._ws.onclose = this.close;
        this._bind = bind;
    }

    private close(event: CloseEvent): void {
        return;
    }

    private open(event: MessageEvent): void {
        if(this._loaded){
            this.fromServer(event);
        } else {
            console.log(event.data)
            if(!event.data){
              return;
            }
            let x = JSON.parse(event.data);

            console.log(x);
            if (x['command'] === 'Q'){
              this._ws.close();
              alert('Done!');
              return;
            }

            if (x['command'] === 'S'){
                this._type = x['schema'];
            }

            if (this._type === 'grid') {
                let blueStripeStyle: DataGrid.IStyle = {
                ...DataGrid.defaultStyle,
                rowBackgroundColor: i => i % 2 === 0 ? 'rgba(138, 172, 200, 0.3)' : '',
                columnBackgroundColor: i => i % 2 === 0 ? 'rgba(100, 100, 100, 0.1)' : ''};

                let model = new GridHelper(this._ws);
                let grid = new DataGrid({ style: blueStripeStyle });
                grid.model = model;
                Widget.attach(grid, this._bind);
                this._grid = grid;
                this._helper = model;
            } else if (this._type === 'text'){
                let model = new TextHelper(this._ws);
                Widget.attach(model, this._bind);
                this._helper = model;
            }
            this._ws.onmessage = (event:MessageEvent) => this.fromServer(event);
            this._loaded = true;
        }
    }

    public fromServer(event: MessageEvent): void {
        let x = JSON.parse(event.data);
        if(x['command'] === 'S'){return;}
        this._helper.fromServer(x);
    }

    public toServer(msg: string): void {
        this._helper.toServer(msg, this._ws);
    }

    onResize(msg: Widget.ResizeMessage): void {
        if (this._type === 'grid'){
            this._grid.update();
        }
    }

  _ws: WebSocket;
  _helper: DataSource;
  _loaded: boolean;
  _type: string;

  _grid: DataGrid;
  _bind: HTMLDivElement;
}