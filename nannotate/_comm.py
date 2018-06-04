from IPython import get_ipython
from IPython.display import display


class CommHandler(object):
    def __init__(self, options, q_in, q_out):
        self.options = options
        self.q_in = q_in
        self.q_out = q_out

        def on_msg(message):
            print(message)
            self.q_in.put(message)
            msg = self.q_out.get()

            print(msg)
            self.comm.send(msg)

        def on_close(message):
            print('comm closed')

        def handle_open(comm, message):
            print('comm open')
            self.comm = comm
            comm.on_close = on_close
            comm.on_msg = on_msg

            print('writing options ' + str(self.options))
            self.write_message(self.options)

            msg = self.q_out.get()
            print('got msg ' + msg)
            self.comm.send(msg)

        get_ipython().kernel.comm_manager.register_target('nannotate', handle_open)

    def run(self):
        return display({'application/nano+json': ''}, raw=True)
