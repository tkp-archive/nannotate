export
interface DataSource {
  tick(event: MessageEvent): void;
  _ws: WebSocket;
}

