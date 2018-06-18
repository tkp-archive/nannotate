import json
from IPython import get_ipython
from .io import handle_command


class CommHandler(object):
    def __init__(self, data, options):
        self.data = data
        self.options = options
        self.opened = False
        self.i = 0

    @classmethod
    def run(cls, data, options):
        c = CommHandler(data, options)

        def handle_open(comm, message):
            c.opened = True

            @comm.on_msg
            def on_msg(msg):
                cmd = msg['content']['data']
                cmd = json.loads(cmd)
                c.i = handle_command(cmd, c.i, c.data, c.options, c.comm)
                if c.i < 0:
                    c.i = 0

            @comm.on_close
            def on_close(message):
                c.comm.send('{"command":"Q"}')

            # initial command is always schema followed by data item
            initial_command = {'command': 'S', 'schema': options['schema'], 'port': options['port']}
            comm.send(json.dumps(initial_command))

            cmd = {'command': 'D', 'index': c.i, 'data': c.data[c.i]}
            comm.send(json.dumps(cmd))

            c.comm = comm

        get_ipython().kernel.comm_manager.register_target('nannotate', handle_open)
        return c
