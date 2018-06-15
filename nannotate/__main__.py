import sys
import faker
import pandas as pd
from pprint import pprint
from .annotate import *

f = faker.Faker()

if 'text' in sys.argv:
    print('annotating text')
    dat = pd.DataFrame([{'text': f.text()} for i in range(10)])
    options = {'schema': 'text', 'port': 8080}
    standalone = True
elif 'inline' in sys.argv:
    import lantern as l
    dat = l.bar.sample()
    options = {'schema': 'grid'}
    standalone = False
else:
    print('annotating grid')
    import lantern as l
    dat = l.bar.sample()
    options = {'schema': 'grid', 'port': 8080}
    standalone = True

data = dat.reset_index().to_dict(orient='records')

try:
    while True:
        annotate(data, options, standalone)
        pprint(data)
except KeyboardInterrupt:
    sys.exit(0)
