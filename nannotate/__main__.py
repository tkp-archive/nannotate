import sys
from .annotate import *

import lantern as l
df = l.bar.sample()

try:
    while True:
        annotate(df, True)
        print(df)
except KeyboardInterrupt:
    sys.exit(0)
