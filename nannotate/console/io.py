from pprint import pprint
from .._commands import quit, clear


# When running from an interactive prompt, like the python default or IPython
def _input(q, options):
    cmd = {}
    what = input('\nnano>>').strip()
    if what == '':
        cmd['command'] = 'N'
    elif what == '-':
        cmd['command'] = 'P'
    elif what == 'q':
        cmd['command'] = 'Q'
    else:
        cmd['command'] = 'A'
        cmd['annotation'] = what
    return cmd


def output(cmd, q, options):
    msg = _msg_out(cmd)
    if isinstance(msg, str):
        print(msg)
    else:
        pprint(msg)


def _msg_out(cmd):
    command = cmd['command']
    if cmd['command'] == 'S':
        return ''
    if cmd['command'] == 'Q':
        return '\n'
    elif command == 'D':
        return cmd['data']
    elif command == 'A':
        return cmd['data']
    elif command == 'C':
        return '\n'
    else:
        raise Exception('Command not recognized: %s' % command)


def handle_command(cmd, index, data, options, input, output, q_in, q_out):
    command = cmd['command']
    if command == 'Q':
        output(quit(), q_out, options)
        # Terminate
        return len(data) + 1
    elif command == 'D':
        output(clear(), q_out, options)
        ret = {'command': 'D', 'index': index, 'data': data[index]}
        output(ret, q_out, options)
        return index
    elif command == 'N':
        output(clear(), q_out, options)
        index = index + 1
        ret = {'command': 'D', 'index': index, 'data': data[index]}
        output(ret, q_out, options)
        return index
    elif command == 'P':
        output(clear(), q_out, options)
        index = index - 1
        ret = {'command': 'D', 'index': index, 'data': data[index]}
        output(ret, q_out, options)
        return index
    elif command == 'A':
        data[index]['annotation'] = cmd['annotation']
        ret = {'command': 'A', 'index': index, 'data': data[index], 'annotation': cmd['annotation']}
        output(ret, q_out, options)
        return index
    elif command == 'G':
        output(clear(), q_out, options)
        index = int(cmd['index'])
        ret = {'command': 'D', 'index': index, 'data': data[index]}
        output(ret, q_out, options)
        return index
    elif command == 'C':
        output(clear(), q_out, options)
    else:
        raise Exception('Command not recognized: %s' % command)
