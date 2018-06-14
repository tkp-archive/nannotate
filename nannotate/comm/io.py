import pandas as pd
import json


# When running from a Jupyter notebook
def comm_input(msg, q, options):
    # q.put(msg)
    return q.get().strip()


def comm_output(msg, q, options):
    msg = _msg_to_out_cm(msg, options)
    q.put(msg)


def _msg_to_in_cm(msg, options):
    pass


def _msg_to_out_cm(msg, options):
    if isinstance(msg, pd.DataFrame) or isinstance(msg, pd.Series):
        # msg = msg.reset_index().to_json(orient='records')
        msg = msg.reset_index().to_json()
    elif isinstance(msg, dict):
        msg = json.dumps(msg, default=str)
    if msg == 'nl':
        return ''
    elif msg == 'q':
        return '{}'
    return msg
