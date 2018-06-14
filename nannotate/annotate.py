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

    return _handle_msg(df, options, input, output, q_in, q_out)


def _handle_msg(df, options, input, output, q_in, q_out):
    data = df.reset_index().to_dict(orient='records')

    for i in range(len(data)):
        # output 1
        output(data[i], q_out, options)

        while(True):
            # input
            x = input('cp', q_in, options)
            while not x:
                x = input('cp', q_in, options)

            if x == 'q':
                output('q', q_out, options)
                return
            # elif x == '+':
            #     data[i]['annotate' + str(count)] = ''
            #     count += 1
            #     output(data[i], q_out, options)
            #     output('nl', q_out, options)
            #     continue
            elif x == 'n':
                output('nl', q_out, options)
                break
            else:
                data[i]['annotate0'] = x
                if options['schema'] != 'text':
                    output(data[i], q_out, options)
                    break
                else:
                    continue

        if i == len(data) - 1:
            output('q', q_out, options)
        elif x == '':
            output('nl', q_out, options)

    return pd.DataFrame(data)
