from setuptools import setup, find_packages
from codecs import open
from os import path

here = path.abspath(path.dirname(__file__))

with open(path.join(here, 'README.md'), encoding='utf-8') as f:
    long_description = f.read()

setup(
    name='nannotate',
    version='0.0.1',
    description='Automated dataset annotation',
    long_description=long_description,
    url='https://github.com/timkpaine/nannotate',
    download_url='https://github.com/timkpaine/nannotate/archive/v0.0.1.tar.gz',
    author='Tim Paine',
    author_email='timothy.k.paine@gmail.com',
    license='GPL',

    classifiers=[
        'Development Status :: 3 - Alpha',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
    ],

    keywords='analytics machine-learning dataset',

    packages=find_packages(exclude=['tests', ]),
    include_package_data=True,
    zip_safe=False,
)
