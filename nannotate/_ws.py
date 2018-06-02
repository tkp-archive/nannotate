import os.path
import tornado.web
import tornado.websocket
from threading import Thread


class WSHandler(tornado.websocket.WebSocketHandler):
    def initialize(self, q_in, q_out):
        self.q_in = q_in
        self.q_out = q_out

    def open(self):
        print("WebSocket opened")
        msg = self.q_out.get()
        print('got from server ' + msg)
        self.write_message(msg)

    def on_message(self, message):
        print('got from client ' + message)
        self.q_in.put(message)

        msg = self.q_out.get()
        print('sending msg to client' + msg)
        if msg:
            self.write_message(msg)

        msg = self.q_out.get()
        print('sending msg to client' + msg)
        if msg:
            self.write_message(msg)

    def on_close(self):
        print("WebSocket closed")
        self.q_in.put('q')
        tornado.ioloop.IOLoop.current().stop()
        # tornado.ioloop.IOLoop.current().close()

    def run(q_in, q_out):
        root = os.path.join(os.path.dirname(__file__), 'assets')
        app = tornado.web.Application([
            (r"/api/ws", WSHandler, {'q_in': q_in, 'q_out': q_out}),
            (r"/(.*)", tornado.web.StaticFileHandler, {"path": root, "default_filename": "index.html"}),
        ])
        app.listen(8991)
        print('running on %d' % 8991)
        t = Thread(target=tornado.ioloop.IOLoop.current().start)
        t.start()
