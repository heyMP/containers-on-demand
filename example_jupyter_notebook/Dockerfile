FROM psuastro528/notebook

COPY ./jupyter_notebook_config.json /home/jovyan/.jupyter/jupyter_notebook_config.json

HEALTHCHECK CMD curl --fail http://localhost:8888 || exit 1 