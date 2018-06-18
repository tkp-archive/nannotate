import os.path
import socket
import time
import tornado.httpserver
import tornado.web
import tornado.websocket
import queue
from threading import Thread


class WSHandler(tornado.websocket.WebSocketHandler):
    def initialize(self, options, q_in, q_out):
        self.options = options
        self.q_in = q_in
        self.q_out = q_out

    def open(self):
        while self.q_out.qsize() > 0:
            msg = self.q_out.get()
            self.write_message(msg)

    def on_message(self, message):
        self.q_in.put(message)

        try:
            msg = [self.q_out.get(timeout=.1)]
        except queue.Empty:
            msg = []

        for _ in range(self.q_out.qsize()):
            msg.append(self.q_out.get())

        for x in msg:
            self.write_message(x)

    def on_close(self):
        self.q_in.put('{"command":"Q"}')

    def run(options, q_in, q_out):
        root = os.path.join(os.path.dirname(__file__), '../', 'assets')
        app = tornado.web.Application([
            (r"/nannotate/api/ws", WSHandler, {'options': options, 'q_in': q_in, 'q_out': q_out}),
            (r"/(.*)", tornado.web.StaticFileHandler, {"path": root, "default_filename": "index.html"}),
        ])

        if 'port' not in options:
            tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            tcp.bind(('', 0))
            addr, port = tcp.getsockname()
            tcp.close()
            options['port'] = port
        else:
            port = 8080

        server = tornado.httpserver.HTTPServer(app)
        server.listen(port)
        print('listening on port: %d' % port)

        t = Thread(target=tornado.ioloop.IOLoop.current().start)
        t.start()

        def stop():
            tornado.ioloop.IOLoop.current().add_callback(tornado.ioloop.IOLoop.current().stop)
            server.stop()
            t.join()
            time.sleep(1)
        return stop
