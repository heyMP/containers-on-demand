# Containers on Demand

This project aims to be a solution for allowing students to create individualized instances of workspaces such as Jupyter Notebooks, RStudio, etc. on demand.

<img src="demo/demo.gif">

## Run the demo

Clone this repo

```bash
git clone https://github.com/heyMP/containers-on-demand.git && cd containers-on-demand
```

Update the example Docker images.

```
docker pull heymp/notebook
docker pull heymp/rstudio
```

Run docker compose

```bash
docker-compose -f docker-compose.yml -f docker-compose-demo.yml up --build
```

Visit the demo http://demo.docker.localhost (in Chrome!). Chrome automatically resolves localhost domains needed for the demo.