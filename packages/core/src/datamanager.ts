import {Widget} from '@phosphor/widgets';
import {DataGrid} from '@phosphor/datagrid';
import {Session} from '@jupyterlab/services';

import {GridHelper} from './datagrid';
import {TextHelper} from './textdata';
import {DataSource} from './datasource';


export
class DataManager{
    constructor(bind: HTMLDivElement, base = '', comm = false){
        this._bind = bind;
        let path1 = window.location.host;
        let path2 = window.location.pathname;

        if(comm){
            this._ws_type = 'comm';
            Session.listRunning().then(sessionModels => {
                for (let i=0; i<sessionModels.length; i++) {
                    if (sessionModels[i].kernel.id === base) {
                        Session.connectTo(sessionModels[i]).then(session => {
                            session.kernel.connectToComm('nannotate').then(comm => {
                                this._ws = comm;
                                comm.onMsg = (msg: any) => {
                                    console.log('comm msg');
                                    let dat = msg['content']['data'];
                                    let event = new MessageEvent('msg', {data:JSON.stringify(dat)});
                                    this.open(event);
                                };
                                comm.onClose = () => {
                                    console.log('comm closed');
                                    this.close(new CloseEvent('close'))
                                };
                                comm.open('opened');
                                comm.send('test');
                            });
                        });
                    }
                }
            });
        } else {
            this._ws_type = 'ws';
            this._ws = new WebSocket('ws://' + path1 + path2 + base + 'nannotate/api/ws');
            this._ws.onmessage = (event: MessageEvent) => this.open(event);
            this._ws.onclose = this.close;
        }
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

            if (this._ws_type){

            } else {
                this._ws.onmessage = (event:MessageEvent) => this.fromServer(event);
            }
            this._loaded = true;
        }
    }

    public fromServer(event: MessageEvent): void {
        let x = JSON.parse(event.data);
        if(x['command'] === 'S'){return;}
        this._helper.fromServer(x);
    }

    public toServer(msg: string): void {
        this._helper.toServer(msg);
    }

    onResize(msg: Widget.ResizeMessage): void {
        if (this._type === 'grid'){
            this._grid.update();
        }
    }

  _type: string;
  _ws_type: string;
  _ws: WebSocket | any;
  _helper: DataSource;
  _loaded: boolean;

  _grid: DataGrid;
  _bind: HTMLDivElement;
}