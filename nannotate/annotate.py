from .utils import in_ipynb
from .input import console_input, comm_input


def annotate(df):
    if in_ipynb():
        input = comm_input
    else:
        input = console_input
