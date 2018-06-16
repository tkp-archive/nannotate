import queue
import json
from .._commands import quit, clear


# When running as a standalone site'''
def _input(q, options):
    try:
        dat = q.get(timeout=.1).strip()
        return json.loads(dat)
    except queue.Empty:
        return ''


def output(cmd, q, options):
    msg = _msg_out(cmd)
    q.put(msg)


def _msg_out(cmd):
    return json.dumps(cmd, default=str)


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
        index = min(index + 1, len(data)-1)
        ret = {'command': 'D', 'index': index, 'data': data[index]}
        output(ret, q_out, options)
        return index
    elif command == 'P':
        output(clear(), q_out, options)
        index = max(index - 1, 0)
        ret = {'command': 'D', 'index': index, 'data': data[index]}
        output(ret, q_out, options)
        return index
    elif command == 'A':
        if options['schema'] == 'text':
            if 'annotation' not in data[index]:
                data[index]['annotation'] = {'paragraph': '', 'phrases': {}}
            if 'paragraph' in cmd['annotation']:
                data[index]['annotation']['paragraph'] = cmd['annotation']['paragraph']
            else:
                data[index]['annotation']['phrases'] = cmd['annotation']['phrases']

        else:
            data[index]['annotation'] = cmd['annotation']
        ret = {'command': 'A', 'index': index, 'data': data[index], 'annotation': cmd['annotation']}
        # output(ret, q_out, options)
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
