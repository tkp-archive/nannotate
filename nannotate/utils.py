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
