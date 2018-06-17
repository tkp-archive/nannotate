from IPython import get_ipython
from IPython.display import display
import os
import os.path
from queue import Queue
import time
from threading import Thread
from .utils import in_ipynb
from .console.io import _input as console_input, output as console_output, handle_command as console_handle_command
from .ws.io import _input as websocket_input, output as websocket_output, handle_command as websocket_handle_command
from .ws.handler import WSHandler
from .comm.io import _input as comm_input, output as comm_output, handle_command as comm_handle_command
from .comm.handler import CommHandler


def annotate(df, options, standalone=False):
    if in_ipynb():
        input = comm_input
        output = comm_output
        handle = comm_handle_command
        q_in = Queue()
        q_out = Queue()
        comm, stop = CommHandler.run(options, q_in, q_out)
        t = Thread(target=_handle_msg, args=(df, options, handle, input, output, q_in, q_out, comm))
        t.start()

        p = os.path.abspath(get_ipython().kernel.session.config['IPKernelApp']['connection_file'])
        sessionid = p.split(os.sep)[-1].replace('kernel-', '').replace('.json', '')
        return display({'application/nano+json': {'sessionid': sessionid}}, raw=True)

    else:
        if standalone:
            input = websocket_input
            output = websocket_output
            handle = websocket_handle_command
            q_in = Queue()
            q_out = Queue()
            stop = WSHandler.run(options, q_in, q_out)

        else:
            input = console_input
            output = console_output
            handle = console_handle_command
            q_in = None
            q_out = None
            stop = lambda: _

        msg = _handle_msg(df, options, handle, input, output, q_in, q_out)
        stop()
        return msg


def _handle_msg(data, options, handle_command, _input, _output, q_in, q_out, comm=None):
    i = 0

    # initial command is always schema followed by data item
    initial_command = {'command': 'S', 'schema': options['schema'], 'port': options['port']}
    _output(initial_command, q_out, options)
    print('putting: %s' % str(initial_command))

    cmd = {'command': 'D', 'index': i, 'data': data[i]}
    handle_command(cmd, i, data, options, _input, _output, q_in, q_out)
    print('putting: %s' % str(cmd))

    while i < len(data):
        # cant go previous
        if i < 0:
            i = 0

        # input
        print('here', flush=True)
        cmd = _input(q_in, options)
        print('here2', flush=True)
        while not cmd:
            cmd = _input(q_in, options)
            time.sleep(1)
            print('sleeping', flush=True)

        i = handle_command(cmd, i, data, options, input, output, q_in, q_out)
