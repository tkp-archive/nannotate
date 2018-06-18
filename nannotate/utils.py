import sys


def in_ipynb():
    if 'IPython' in sys.modules:
        from IPython import get_ipython
        ip = get_ipython()
        if ip:
            cfg = ip.config
            if cfg.get('IPKernelApp', False):
                return True
            return False
        return False
    return False


def get_spacy_pos():
    import spacy
    ret = []
    for item in dir(spacy.parts_of_speech):
        if not item.startswith('__') and item != 'univ_pos_t':
            ret.append(item)
    return ret
