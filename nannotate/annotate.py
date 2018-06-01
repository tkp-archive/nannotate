import pandas as pd
from queue import Queue
from six.moves import range
from .utils import in_ipynb
from .io import console_input, console_output, comm_input, comm_output, websocket_input, websocket_output
from ._ws import WSHandler
from ._comm import CommHandler


def annotate(df, standalone=False):
    if in_ipynb():
        input = comm_input
        output = comm_output
        q_in = Queue()
        q_out = Queue()
        extra = CommHandler(q_in, q_out)
        extra.run()

    elif standalone:
        input = websocket_input
        output = websocket_output
        q_in = Queue()
        q_out = Queue()
        extra = WSHandler.run(q_in, q_out)

    else:
        input = console_input
        output = console_output
        q_in = None
        q_out = None

    return _handle_msg(df, input, output, q_in, q_out)


def _handle_msg(df, input, output, q_in, q_out):
    count = 0
    for i in range(df.shape[0]):
        print('outputting')
        output(df.iloc[i], q_out)

        x = input('cp', q_in)
        while x:
            if x == 'q':
                return
            if x == '+':
                df['annotate' + str(count)] = pd.Series()
                count += 1
                output(df.iloc[i], q_out)
            else:
                df['annotate0'][df.index[i]] = x
                output(df.iloc[i], q_out)
                break
            x = input('cp', q_in)

        output('nl', q_out)
