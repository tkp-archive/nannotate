import pandas as pd
from six.moves import range
from pprint import pprint
from .utils import in_ipynb
from .input import console_input, comm_input


def annotate(df):
    if in_ipynb():
        input = comm_input
    else:
        input = console_input

    count = 0

    for i in range(df.shape[0]):
        pprint(df.iloc[i])

        x = input('\nnano>')
        while x:
            if x == 'q':
                return
            if x == '+':
                df['annotate' + str(count)] = pd.Series()
                count += 1
                pprint(df.iloc[i])
            else:
                df['annotate0'][df.index[i]] = x
                pprint(df.iloc[i])
                break
            x = input('\nnano>')

        print('\n')
