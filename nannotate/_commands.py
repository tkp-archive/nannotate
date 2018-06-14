from enum import Enum


class Commands(Enum):
    '''
    Command:
        {"command": "N"}
    Response:
        {"command": "N", "data":<DATA AS JSON OBJ>}

    Command:
        {"command": "P"}
    Response:
        {"command": "P", "data":<DATA AS JSON OBJ>}

    Command:
        {"command": "A", "annotation":<TEXT OR JSON>}
    Response:
        {"command": "A", "data":<DATA AS JSON OBJ>, "annotation":<TEXT OR JSON>}

    Command:
        {"command": "G", "index": "1"}
    Response:
        {"command": "G", "index": "1", "data":<DATA AS JSON OBJ>}

    Command:
        {"command": "Q"}
    Response:
        {"command": "Q"}

    '''
    Next = 'N'  # annotate next datapoint
    Previous = 'P'  # annotate previous datapoint
    Annotate = 'A'  # add annotation to current datapoint
    Goto = 'G'  # goto datapoint by index
    Clear = 'C'  # Clear data
    Quit = 'Q'  # quit annotation
