import sys
import faker
import pandas as pd
import spacy
from pprint import pprint
from .annotate import *
from .utils import get_spacy_pos

f = faker.Faker()
nlp = spacy.load('en_core_web_sm')


def spacy_preprocess_pos(data):
    if 'annotation' not in data:
        # dont annotate if custom annotations already exist
        text = data['text']
        doc = nlp(text)
        x = [(doc[i].pos_, doc[i].text) for i in range(len(doc)) if not doc[i].pos_ in ('PUNCT', 'SPACE')]

        ret = {}
        i = 0
        for pos, txt in x:
            ret[pos] = [{'word': txt, 'index': i}] if pos not in ret else ret[pos] + [{'word': txt, 'index': i}]
            i += 1

        data['annotation'] = {'paragraph': 'sentiment: ' + str(doc.sentiment), 'words': ret}
    return data

if 'text' in sys.argv:
    print('annotating text')
    spacy_options = get_spacy_pos()

    if 'nooptions' in sys.argv:
        dat = pd.DataFrame([{'text': f.text()} for i in range(10)])
    else:
        dat = pd.DataFrame([{'text': f.text(), 'options': spacy_options if i % 2 == 0 else []} for i in range(10)])
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
        if 'text' in sys.argv:
            annotate(data, options, standalone, spacy_preprocess_pos)
        annotate(data, options, standalone)
        pprint(data)
except KeyboardInterrupt:
    sys.exit(0)
