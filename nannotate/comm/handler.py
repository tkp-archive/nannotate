import queue
from IPython import get_ipython


class CommHandler(object):
    def __init__(self, options, q_in, q_out):
        self.options = options
        self.q_in = q_in
        self.q_out = q_out
        self.opened = False

        def on_msg(message):
            print('reading: ' + message, flush=True)
            self.q_in.put(message)

            try:
                msg = [self.q_out.get(timeout=.1)]
            except queue.Empty:
                msg = []

            for _ in range(self.q_out.qsize()):
                msg.append(self.q_out.get())

            for x in msg:
                print('writing' + x, flush=True)
                self.comm.send(x)

        def on_close(message):
            print("Comm closed", flush=True)
            self.q_in.put('{"command":"Q"}')

        def handle_open(comm, message):
            print("Comm opened", flush=True)
            self.opened = True
            self.comm = comm
            comm.on_close = on_close
            comm.on_msg = on_msg

            comm.send(self.options)
            while self.q_out.qsize() > 0:
                msg = self.q_out.get()
                print('writing: ' + msg, flush=True)
                self.comm.send(msg)

        get_ipython().kernel.comm_manager.register_target('nannotate', handle_open)

    def close(self):
        print("Comm closed", flush=True)
        self.q_in.put('{"command":"Q"}')

    @classmethod
    def run(cls, options, q_in, q_out):
        c = CommHandler(options, q_in, q_out)

        def close():
            c.opened = False
            c.comm.close()

        return c, close
