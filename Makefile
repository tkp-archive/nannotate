run:  ## clean and make target, run target
	python3 -m nannotate 

build: js  ## Build the repository
	python3 setup.py build 

tests: ## Clean and Make unit tests
	python3 -m nose -v tests --with-coverage --cover-erase --cover-package=`find nannotate -name "*.py" | sed "s=\./==g" | sed "s=/=.=g" | sed "s/.py//g" | tr '\n' ',' | rev | cut -c2- | rev`
	
test: ## run the tests for travis CI
	@ python3 -m nose -v tests --with-coverage --cover-erase --cover-package=`find nannotate -name "*.py" | sed "s=\./==g" | sed "s=/=.=g" | sed "s/.py//g" | tr '\n' ',' | rev | cut -c2- | rev`

annotate: ## MyPy type annotation check
	mypy -s nannotate  

annotate_l: ## MyPy type annotation check - count only
	mypy -s nannotate | wc -l 

clean: ## clean the repository
	find . -name "__pycache__" | xargs  rm -rf 
	find . -name "*.pyc" | xargs rm -rf 
	find . -name ".ipynb_checkpoints" | xargs  rm -rf 
	rm -rf .coverage cover htmlcov logs build dist *.egg-info
	make -C ./docs clean
	npm run clean

js:  ## build the js
	npm install
	npm run build
	cp packages/viewer/build/assets/bundle.js nannotate/assets/

serverextension: install ## enable serverextension
	jupyter serverextension enable --py nannotate

labextension: install ## enable labextension
	jupyter labextension install packages/jlab

# install: js  ## install to site-packages
install:   ## install to site-packages
	python3 setup.py install

preinstall:  ## install dependencies
	python3 -m pip install -r requirements.txt

postinstall:  ## install other requisite labextensions
	jupyter labextension install @jupyter-widgets/jupyterlab-manager
	jupyter labextension install @jupyterlab/plotly-extension
	jupyter labextension install @jpmorganchase/perspective-jupyterlab
	jupyter labextension install jupyterlab_bokeh
	jupyter labextension install bqplot
	jupyter labextension install qgrid

docs:  ## make documentation
	make -C ./docs html

dist:  ## dist to pypi
	python3 setup.py sdist upload -r pypi

distjs:  ## dist to npm
	npm upload

# Thanks to Francoise at marmelab.com for this
.DEFAULT_GOAL := help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

print-%:
	@echo '$*=$($*)'

.PHONY: clean build run test tests help annotate annotate_l docs js
