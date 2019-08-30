# Containers on Demand

This project aims to be a solution for allowing students to create individualized instances of workspaces such as Jupyter Notebooks, RStudio, etc. on demand.

<img src="https://lh3.googleusercontent.com/RCMatYx6EXUXrgwda7rt9SJbUEernQShnXpc7wXsXqUsunNpSmXAvANZSYYDPolYVcgdG6sxsnW-yzj0mcH44O1JYjfzVJv6ITT0KnTU4Jkse3KpKZ9KShfApaa1MVtMR-Zzm37z66CtGxe8MgrEqyO9A1EDr3nmpWv7s_rgwapt0l4_KZbLWEn0NVOAi1xazTkIC9K3SGPFNVOXX4RNPlfRouDn5_4QKkEF-FdHpozJS3ftOlTiHoBmZSCBjpDGOE6WHVA3ZnSbI3vYPqSWuw1hH_0jIsQLJ1AsPYQ1ZbDM07-zsCohp-MfNYU_DtQFSWkAxyD_XjnMt0kgd7vxxfYJs61EfvdMaTDgyIq4T3TFa1UD2SHk0YTt9IUTqjo0tIyIk0bj7cxjz5L4M1dYOVMp0-VZjHmz-8pTWriQGoLWBDBoQaHXf--fPWQtP_9BnmVhksfhr92yjvOj57W5ca5ETMgWuIbYBIvKard3W0pW1XG6ZcBvDUetH3yLbBsDNOoXJqoXf6m1amNHPl20ILhtzfAni8KFg9caqdEvzX4x4Aup2TISb-DaDfF9hko25Tm16dqWxWTPgAVFoIuhb2BlfJMyEcAucu32P8R8eCN-c5z27RqQqNrt_o3dG_6QjRQdUlECy42kNyvpaCYRb1I3uqG1A0nnLL6BGhzlJOj0WQbOMqVlyQ=w1030-h844-no">

## Run the demo

Clone this repo

```bash
git clone https://github.com/heyMP/containers-on-demand.git && cd containers-on-demand
```

Run docker compose

```bash
docker-compose -f docker-compose.yml -f docker-compose-demo.yml up --build
```

Visit the demo http://demo.docker.localhost (in Chrome!). Chrome automatically resolves localhost domains needed for the demo.