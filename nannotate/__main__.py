from .annotate import *

import lantern as l
df = l.bar.sample()

annotate(df, True)

print(df)
