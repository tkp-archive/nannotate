from queue import Queue
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
        stop = CommHandler.run(options, q_in, q_out)

    elif standalone:
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


def _handle_msg(data, options, handle_command, input, output, q_in, q_out):
    i = 0

    # initial command is always schema followed by data item
    initial_command = {'command': 'S', 'schema': options['schema'], 'port': options['port']}
    output(initial_command, q_out, options)
    print('putting: %s' % str(initial_command))

    cmd = {'command': 'D', 'index': i, 'data': data[i]}
    handle_command(cmd, i, data, options, input, output, q_in, q_out)
    print('putting: %s' % str(cmd))

    while i < len(data):
        # cant go previous
        if i < 0:
            i = 0

        # input
        cmd = input(q_in, options)
        while not cmd:
            cmd = input(q_in, options)

        i = handle_command(cmd, i, data, options, input, output, q_in, q_out)
