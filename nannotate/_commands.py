from enum import Enum


class Command(Enum):
    '''
    Command:
        {"command": "S", "schema": <SCHEMA AS JSON>, "route": <URL or empty>}
    Response:
        {} or None

    Command:
        {"command": "D", "index": <i>}
    Response:
        {"command": "D", "index": <i>, data":<DATA AS JSON OBJ>}

    Command:
        {"command": "N"}
    Response:
        {"command": "C"}
        {"command": "D", "index": <i>, data":<DATA AS JSON OBJ>}

    Command:
        {"command": "P"}
    Response:
        {"command": "C"}
        {"command": "D", "index": <i>, "data":<DATA AS JSON OBJ>}

    Command:
        {"command": "A", "index": <i>, "annotation":<TEXT OR JSON>}
    Response:
        {"command": "A", "index": <i>, data":<DATA AS JSON OBJ>, "annotation":<TEXT OR JSON>}

    Command:
        {"command": "G", "index": <i>}
    Response:
        {"command": "C"}
        {"command": "D", "index": <i>, "data":<DATA AS JSON OBJ>}

    Command:
        {"command": "C", "index": <i>}
    Response:
        {"command": "C", "index": <i>}

    Command:
        {"command": "Q"}
    Response:
        {"command": "Q"}

    '''
    Schema = 'S'  # OUT schema/options
    Data = 'D'  # INOUT show data
    Next = 'N'  # IN annotate next datapoint
    Previous = 'P'  # IN annotate previous datapoint
    Annotate = 'A'  # INOUT add annotation to current datapoint
    Goto = 'G'  # IN goto datapoint by index
    Clear = 'C'  # INOUT Clear data
    Quit = 'Q'  # INOUT quit annotation

    @staticmethod
    def options():
        return list(map(lambda c: c.value, Command))


def quit():
    return {'command': 'Q'}


def clear():
    return {'command': 'C'}


def text_to_command(msg):
    if isinstance(msg, Command):
        return msg
    if not msg.upper() in Command.options():
        raise Exception('Command not recognized: %s' % msg)
    return Command(msg.upper())


def command_to_text(cmd):
    if isinstance(cmd, str) and cmd not in Command.options():
        raise Exception('Command not recognized: %s' % cmd)
    elif isinstance(cmd, Command):
        return cmd.value
    return cmd
