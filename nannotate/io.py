from pprint import pprint


def console_input(msg):
    return input(msg)


def console_output(msg):
    if isinstance(msg, str):
        print(msg)
    else:
        pprint(msg)


def comm_input(msg):
    # TODO after extension is done do graphically
    return console_input(msg)


def comm_output(msg):
    # TODO after extension is done do graphically
    return console_output(msg)
