export
interface DataSource {
  fromServer(event: MessageEvent): void;
  toServer(msg: string, ws: WebSocket): void;
  _ws: WebSocket;
}

