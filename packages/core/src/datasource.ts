export
interface DataSource {
  fromServer(data: DataJSON): void;
  toServer(msg: string): void;
  _ws: WebSocket;
}

export
interface DataJSON {
  command: string;
  // schema: string | null;
  index: number | null;
  data: JSON | null;
  annotation: string | null;
}