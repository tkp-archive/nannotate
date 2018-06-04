import sys
import faker
import pandas as pd
from .annotate import *

f = faker.Faker()

if 'text' in sys.argv:
    print('annotating text')
    dat = pd.DataFrame([{'text': f.text()} for i in range(10)])
    options = {'schema': 'text'}
else:
    print('annotating grid')
    import lantern as l
    dat = l.bar.sample()
    options = {'schema': 'grid'}

try:
    while True:
        annotate(dat, options, True)
        print(dat)
except KeyboardInterrupt:
    sys.exit(0)
