# ZenithGlows

Storefront for the ZenithGlows cube — light that moves like water.

## Run with Docker

```sh
docker compose -f docker-compose.alloy.yaml up -d
```

The site is available at `http://localhost:3000`. Alloy sessions proxy it at `http://localhost:8080`.

Routes:

- `/` home
- `/collections/all` shop
- `/products/zenithglows-cube` product
- `/checkout/plan_ZNGSf9CWGkLki` checkout
- `/order/:id` confirmation
