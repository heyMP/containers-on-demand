# Containers on Demand

This project aims to be a solution for allowing students to create individualized instances of workspaces such as Jupyter Notebooks, RStudio, etc. on demand.

<img src="https://lh3.googleusercontent.com/RiDjoG6mSq-YKZSLO8YgHo6dvCaJMKm42Ldmb-yvBsIqdOWKHiEXsaMM4hRbuiy49ehaAvy2ZHkA377I7n9YoAjhpaOVaIT3hPyU5OeQSzY4RcBHBEYhvqbWi6NKs2yToex5GnCiJFiTLghl7uYZFLstZG4bvsK6oauF0jXOfCh0dMt2s8Jlc3ddn31Wpc0ggtrx92OaP3z5mNehxSOgSSs3uc4p2zigETwnC2wgGf54N0pMt40ifVzg1UIMuTy3pTNy__05hvgScA2a0JLDzJgh3cWQwXSzsuLDcFHT3gMoKYBGVuqewbXmL5FCG079CJcTmkGWo74D9HbD1IHXUpltejDMvHqZ28yUAYWF6RxRXqOsUxCUwN7kVTYFyOJSUL6HsYFotIOu__jaDqdeC22o9fnx8KRI5wZPTsi4yuH4m7pLT1Bd9jwGntEY1gDrzdM05knhUC5_cpWW9kgGuelrTo2IpgKbJVvi0OUAmikxJz8eQ5RwoW7mEa_hlMtPKzUe6ujsbie_4459QmTtc_TKPLi1tCcdeu5zMEeG03kdUEZAObB7KmYZ7V8kXYYFvYKWf0ectnjOmhhtHUbOxNQ6j_hDI9on7JpefYbeuvPri8UVaaEY5LwCeaOYAoJWyAgRGXZBxYFGgDhll1_LcdeUwHYZjkZlHEco7U4Q-1SvTbMooNtjFLKnwn3HxbaTprnqomM4y3obI2QIjI00WyU8cqAnU9dfxeD8ylzaSy152-I=w1476-h1240-no">

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