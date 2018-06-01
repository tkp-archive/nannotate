import pandas as pd
from pprint import pprint


# When running from an interactive prompt, like the python default or IPython
def console_input(msg, q):
    return input(_msg_to_in_cs(msg))


def console_output(msg, q):
    msg = _msg_to_out_cs(msg)
    if isinstance(msg, str):
        print(msg)
    else:
        pprint(msg)


def _msg_to_in_cs(msg):
    if msg == 'cp':
        return '\nnano>>'
    else:
        return msg


def _msg_to_out_cs(msg):
    if msg == 'nl':
        return '\n'
    else:
        return msg


# When running from a Jupyter notebook
def comm_input(msg, q):
    # q.put(msg)
    return q.get()


def comm_output(msg, q):
    if isinstance(msg, pd.DataFrame):
        msg = msg.reset_index().to_json(orient='records')
    q.put(msg)


def _msg_to_in_cm(msg):
    pass


def _msg_to_out_cm(msg):
    pass


# When running as a standalone site'''
def websocket_input(msg, q):
    # q.put(msg)
    return q.get()


def websocket_output(msg, q):
    if isinstance(msg, pd.DataFrame) or isinstance(msg, pd.Series):
        msg = msg.reset_index().to_json(orient='records')
    print('putting ' + msg)
    q.put(msg)


def _msg_to_in_ws(msg):
    pass


def _msg_to_out_ws(msg):
    pass
