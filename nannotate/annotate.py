import pandas as pd
from queue import Queue
from six.moves import range
from .utils import in_ipynb
from .io import console_input, console_output, comm_input, comm_output, websocket_input, websocket_output
from ._ws import WSHandler
from ._comm import CommHandler


def annotate(df, options, standalone=False):
    if in_ipynb():
        input = comm_input
        output = comm_output
        q_in = Queue()
        q_out = Queue()
        extra = CommHandler(options, q_in, q_out)
        extra.run()

    elif standalone:
        input = websocket_input
        output = websocket_output
        q_in = Queue()
        q_out = Queue()
        extra = WSHandler.run(options, q_in, q_out)

    else:
        input = console_input
        output = console_output
        q_in = None
        q_out = None

    return _handle_msg(df, input, output, q_in, q_out)


def _handle_msg(df, input, output, q_in, q_out):
    count = 0
    for i in range(df.shape[0]):
        # output 1
        output(df.iloc[i], q_out)

        # input
        x = input('cp', q_in)
        while x:
            if x == 'q':
                output('q', q_out)
                return
            if x == '+':
                df['annotate' + str(count)] = pd.Series()
                count += 1
                output(df.iloc[i], q_out)
                output('nl', q_out)
                x = input('cp', q_in)
            else:
                # TODO
                if 'annotate0' not in df.columns:
                    df['annotate0'] = pd.Series()
                    count += 1
                df['annotate0'][df.index[i]] = x
                output(df.iloc[i], q_out)
                break
        if i == df.shape[0] - 1:
            output('q', q_out)
        elif x == '':
            output('nl', q_out)
