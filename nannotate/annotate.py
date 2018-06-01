import pandas as pd
from six.moves import range
from .utils import in_ipynb
from .io import console_input, console_output, comm_input, comm_output


def annotate(df):
    if in_ipynb():
        input = comm_input
        output = comm_output
    else:
        input = console_input
        output = console_output

    count = 0

    for i in range(df.shape[0]):
        output(df.iloc[i])

        x = input('\nnano>')
        while x:
            if x == 'q':
                return
            if x == '+':
                df['annotate' + str(count)] = pd.Series()
                count += 1
                output(df.iloc[i])
            else:
                df['annotate0'][df.index[i]] = x
                output(df.iloc[i])
                break
            x = input('\nnano>')

        output('\n')
