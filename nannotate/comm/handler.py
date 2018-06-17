import os
import os.path
import queue
import time
from IPython import get_ipython
from IPython.display import display
from threading import Thread


class CommHandler(object):
    def __init__(self, options, q_in, q_out):
        self.options = options
        self.q_in = q_in
        self.q_out = q_out
        self.opened = False

        def on_msg(message):
            print('reading: ' + message)
            self.q_in.put(message)

            try:
                msg = [self.q_out.get(timeout=.1)]
            except queue.Empty:
                msg = []

            for _ in range(self.q_out.qsize()):
                msg.append(self.q_out.get())

            for x in msg:
                print('writing' + x)
                self.comm.send(x)

        def on_close(message):
            print("Comm closed")
            self.q_in.put('{"command":"Q"}')

        def handle_open(comm, message):
            print("Comm opened")
            self.opened = True
            self.comm = comm
            comm.on_close = on_close
            comm.on_msg = on_msg

            while self.q_out.qsize() > 0:
                msg = self.q_out.get()
                print('writing: ' + msg)
                self.comm.send(msg)

        get_ipython().kernel.comm_manager.register_target('nannotate', handle_open)

    @classmethod
    def run(cls, options, q_in, q_out):
        p = os.path.abspath(get_ipython().kernel.session.config['IPKernelApp']['connection_file'])
        sessionid = p.split(os.sep)[-1].replace('kernel-', '').replace('.json', '')
        display({'application/nano+json': {'sessionid': sessionid}}, raw=True)

        c = CommHandler(options, q_in, q_out)

        def run_thread():
            while not c.opened:
                print('sleeping')
                time.sleep(1)
            while c.opened:
                print('here')
                time.sleep(1)

        t = Thread(target=run_thread)
        t.start()

        def close():
            c.opened = False
            t.join()

        return close
