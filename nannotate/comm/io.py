import json
from .._commands import quit, clear


def handle_command(cmd, index, data, options, comm):
    command = cmd['command']
    if command == 'Q':
        comm.send(json.dumps(quit()))
        # Terminate
        return len(data) + 1
    elif command == 'D':
        comm.send(clear())
        ret = {'command': 'D', 'index': index, 'data': data[index]}
        comm.send(json.dumps(ret))
        return index
    elif command == 'N':
        comm.send(json.dumps(clear()))
        index = min(index + 1, len(data)-1)
        ret = {'command': 'D', 'index': index, 'data': data[index]}
        comm.send(json.dumps(ret))
        return index
    elif command == 'P':
        comm.send(json.dumps(clear()))
        index = max(index - 1, 0)
        ret = {'command': 'D', 'index': index, 'data': data[index]}
        comm.send(json.dumps(ret))
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
        comm.send(json.dumps(clear()))
        index = int(cmd['index'])
        ret = {'command': 'D', 'index': index, 'data': data[index]}
        comm.send(json.dumps(ret))
        return index
    elif command == 'C':
        comm.send(json.dumps(clear()))
    else:
        raise Exception('Command not recognized: %s' % command)
