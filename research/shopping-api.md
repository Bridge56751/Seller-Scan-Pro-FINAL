Close sidebar

[LogoSearchApi](https://www.searchapi.io/)

[Sign in](https://www.searchapi.io/users/sign_in) [Sign up](https://www.searchapi.io/users/sign_up)

Open sidebar

[LogoSearchApi](https://www.searchapi.io/)

[Sign in](https://www.searchapi.io/users/sign_in) [Sign up](https://www.searchapi.io/users/sign_up)

# Google Shopping API

GET/api/v1/search?engine=google\_shopping

[OpenAPI InitiativeDownload OpenAPI Spec](https://www.searchapi.io/openapi/google_shopping.yaml)

[See in postman\\
\\
\\
See the Google Shopping Search API in Postman](https://www.postman.com/searchapiofficial/searchapi-official-postman-collection/request/45090949-43a5aa8b-05cc-493d-aa71-59669f834fc6/google-shopping)

Google redirect links

On some searches Google returns each product ad's `link` as an encrypted redirect (`https://www.google.com/goto?url=...`). If you need the merchant URL, add `link=resolved` and we resolve each redirect for you. The merchant `domain` is returned either way.


## [API Parameters](https://www.searchapi.io/docs/google-shopping\#api-parameters)

### [Search Query](https://www.searchapi.io/docs/google-shopping\#api-parameters-search-query)

- Name[`q`](https://www.searchapi.io/docs/google-shopping#api-parameters-search-query-q)Required
Required
Description


Specifies the search query, similar to performing a regular Google search. Filters embedded in the `q` parameter act as hints rather than strict filters. If there are too few matching items, results outside the filters may appear. Examples of usage:




  - Search by price: `tshirt under $30`, `skinny fit kids jeans between $15 and $30`, `charizard over $300`.
  - Search by size: `mens size 8.5 nike air`.
  - Search by color: `Playstation white`.
  - Search nearby stores: `Apparel nearby`.
  - Search by condition: `iphone used`, `macbook new`.
  - Search by brand: `prada dress`, `gucci shoes`.
  - Search discounted products: `laptop on sale`, `headphones on sale`.

### [Localization](https://www.searchapi.io/docs/google-shopping\#api-parameters-localization)

- Name[`google_domain`](https://www.searchapi.io/docs/google-shopping#api-parameters-localization-google-domain)DeprecatedDeprecatedRequired
Optional
Description


As of Apr 15, 2025, Google began phasing out country code top-level domains (ccTLDs). Users using the search bar or visiting local domains like `google.de` or `google.co.uk` are now automatically redirected to `google.com`. For localized searches, use the `gl` (country), `hl` (language) or other localization parameters instead. Learn more in [Google's official announcement](https://blog.google/products/search/country-code-top-level-domains/). See the full list of [supported Google domains](https://www.searchapi.io/docs/parameters/google/domain).


- Name[`gl`](https://www.searchapi.io/docs/google-shopping#api-parameters-localization-gl)Required
Optional
Description


The default parameter `us` defines the country of the search. See the full list of [Google Shopping `gl` countries](https://www.searchapi.io/docs/parameters/google-shopping/gl).


- Name[`hl`](https://www.searchapi.io/docs/google-shopping#api-parameters-localization-hl)Required
Optional
Description


The default parameter `en` defines the interface language of the search. Check the full list of supported [Google `hl` languages](https://www.searchapi.io/docs/parameters/google/hl).



### [Geographic Location](https://www.searchapi.io/docs/google-shopping\#api-parameters-geographic-location)

- Name[`location`](https://www.searchapi.io/docs/google-shopping#api-parameters-geographic-location-location)Required
Optional
Description


This parameter is used to specify the canonical location of the search. For exact targeting or to see all available options, check out the [Locations API](https://www.searchapi.io/docs/locations-api). If multiple locations match your input, the most popular one will be selected.


- Name[`uule`](https://www.searchapi.io/docs/google-shopping#api-parameters-geographic-location-uule)Required
Optional
Description


This parameter sets the exact Google-encoded location for the search, and `uule` and `location` cannot be used at the same time. SearchApi builds it for you when you use the `location` parameter, but you can provide your own if you want precise control.



### [Filters](https://www.searchapi.io/docs/google-shopping\#api-parameters-filters)

- Name[`shoprs`](https://www.searchapi.io/docs/google-shopping#api-parameters-filters-shoprs)Required
Optional
Description


Applies **strict** filtering rules based on encoded values. Example: `CAEYFyoDcHM1MhwIFxISUHJpY2U6IGxvdyB0byBoaWdoKgQQARgBYAKIAQE` sorts products by price (low to high). Filters provided in the JSON response can be used in subsequent requests to apply additional filters iteratively.


- Name[`price_min`](https://www.searchapi.io/docs/google-shopping#api-parameters-filters-price-min)Required
Optional
Description


Specifies the minimum price of the products returned. The amount is in the local currency of the selected `gl`. For example, `2.50` filters results to products priced at $2.50 or higher.


**Note:** If the `shoprs` parameter is provided, it takes priority and this parameter will be ignored.


- Name[`price_max`](https://www.searchapi.io/docs/google-shopping#api-parameters-filters-price-max)Required
Optional
Description


Specifies the maximum price of the products returned. The amount is in the local currency of the selected `gl`. For example, `100` filters results to products priced at $100 or less.


**Note:** If the `shoprs` parameter is provided, it takes priority and this parameter will be ignored.


- Name[`is_on_sale`](https://www.searchapi.io/docs/google-shopping#api-parameters-filters-is-on-sale)Required
Optional
Description


Filters results to show only products that are currently on sale. Set to `true` to show only discounted items. Can be combined with `is_small_business`, `is_free_delivery`, and `sort_by` for more refined searches.


**Note:** If the `shoprs` parameter is provided, it takes priority and this parameter will be ignored.


- Name[`is_small_business`](https://www.searchapi.io/docs/google-shopping#api-parameters-filters-is-small-business)Required
Optional
Description


Filters results to show only products sold by small businesses. Set to `true` to show only small business sellers. Can be combined with `is_on_sale`, `is_free_delivery`, and `sort_by` for more refined searches.


**Note:** If the `shoprs` parameter is provided, it takes priority and this parameter will be ignored.


- Name[`is_free_delivery`](https://www.searchapi.io/docs/google-shopping#api-parameters-filters-is-free-delivery)Required
Optional
Description


Filters results to show only products with free shipping available. Set to `true` to show only items that offer free shipping. Can be combined with `is_on_sale`, `is_small_business`, and `sort_by` for more refined searches.


**Note:** If the `shoprs` parameter is provided, it takes priority and this parameter will be ignored.


- Name[`sort_by`](https://www.searchapi.io/docs/google-shopping#api-parameters-filters-sort-by)Required
Optional
Description


Sorts the shopping results by the specified criteria. Available options:




  - `price_low_to_high` \- Sort products from lowest to highest price
  - `price_high_to_low` \- Sort products from highest to lowest price
  - `rating_high_to_low` \- Sort products by rating, highest first

Can be combined with `is_on_sale`, `is_small_business`, and `is_free_delivery` filters.


**Note:** If the `shoprs` parameter is provided, it takes priority and this parameter will be ignored.


- Name[`condition`](https://www.searchapi.io/docs/google-shopping#api-parameters-filters-condition)Required
Optional
Description


Filters product condition. Options include: `new` for new products, and `used` for used items.


- Name[`include_favicon`](https://www.searchapi.io/docs/google-shopping#api-parameters-filters-include-favicon)Required
Optional
Description


This parameter includes the seller's favicon in the shopping results. It is set to `false` by default. Set it to `true` to include favicons.


- Name[`include_base_images`](https://www.searchapi.io/docs/google-shopping#api-parameters-filters-include-base-images)Required
Optional
Description


This parameter includes base64-encoded product images in the shopping results. It is set to `false` by default. Set it to `true` to include base64 images.



### [Pagination](https://www.searchapi.io/docs/google-shopping\#api-parameters-pagination)

- Name[`page`](https://www.searchapi.io/docs/google-shopping#api-parameters-pagination-page)Required
Optional
Description


Indicates which page of results to return. The default is `1`.



### [Result Links](https://www.searchapi.io/docs/google-shopping\#api-parameters-result-links)

- Name[`link`](https://www.searchapi.io/docs/google-shopping#api-parameters-result-links-link)Required
Optional
Description


Controls how product ad links are returned. On some searches Google encrypts each ad's `link` as a redirect (`https://www.google.com/goto?url=...`). By default (`raw`) those redirects are returned as-is. Set it to `resolved` to have each one followed to the merchant URL. Resolving is best-effort and adds latency; a redirect that cannot be resolved stays as the redirect URL. The merchant `domain` is returned either way.



### [Engine](https://www.searchapi.io/docs/google-shopping\#api-parameters-engine)

- Name[`engine`](https://www.searchapi.io/docs/google-shopping#api-parameters-engine-engine)Required
Required
Description


Defines the engine that will be used to retrieve real-time data. It must be set to `google_shopping`.



### [API key](https://www.searchapi.io/docs/google-shopping\#api-parameters-api-key)

- Name[`api_key`](https://www.searchapi.io/docs/google-shopping#api-parameters-api-key-api-key)Required
Required
Description


Authenticates your requests. Use it as a query parameter (`https://www.searchapi.io/api/v1/search?api_key=YOUR_API_KEY`) or in the Authorization header (`Bearer YOUR_API_KEY`).



### [Zero Data Retention](https://www.searchapi.io/docs/google-shopping\#api-parameters-zero-data-retention)

- Name[`zero_retention`](https://www.searchapi.io/docs/google-shopping#api-parameters-zero-data-retention-zero-retention)Enterprise OnlyEnterprise OnlyRequired
Optional
Description


Set this parameter to `true` to disable all logging and persistent storage. No request parameters, HTML, or JSON responses are stored or logged. Suitable for high-compliance use cases. Debugging and support may be limited while enabled.



## [API Examples](https://www.searchapi.io/docs/google-shopping\#api-examples)

### [Full Response](https://www.searchapi.io/docs/google-shopping\#api-examples-full-response)

![Full Response](https://www.searchapi.io/assets/docs/google_shopping_new/search-ed93ef8d447655ba595e22a17bd2b215a8f98d7848dba5325d7340b6414f7485.png)

GET

```http

```

Request

Python

Language

- Python

- Node

- Ruby

- Java

- Go

- PHP

- Bash

- R

- Kotlin

- Swift

- C#

- C

- C++


requests

Library

- requests


```python
import requests

url = "https://www.searchapi.io/api/v1/search"
params = {
  "engine": "google_shopping",
  "q": "PS5",
  "gl": "us",
  "hl": "en",
  "location": "California,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "search_metadata": {
    "id": "search_Rrb28K9xoXv9c0jPpzE1BA7Q",
    "status": "Success",
    "created_at": "2024-07-12T16:54:48Z",
    "request_time_taken": 2.48,
    "parsing_time_taken": 0.02,
    "total_time_taken": 2.5,
    "request_url": "https://www.google.com/search?q=PS5&oq=PS5&gl=us&hl=en&tbm=shop&num=60&uule=w+CAIQICIYQ2FsaWZvcm5pYSxVbml0ZWQgU3RhdGVz&ie=UTF-8",
    "html_url": "https://www.searchapi.io/api/v1/searches/search_Rrb28K9xoXv9c0jPpzE1BA7Q.html",
    "json_url": "https://www.searchapi.io/api/v1/searches/search_Rrb28K9xoXv9c0jPpzE1BA7Q"
  },
  "search_parameters": {
    "engine": "google_shopping",
    "q": "PS5",
    "location": "California,United States",
    "location_used": "California,United States",
    "hl": "en",
    "gl": "us"
  },
  "search_information": {
    "query_displayed": "PS5"
  },
  "filters": [\
    {\
      "type": "Sort by",\
      "options": [\
        {\
          "text": "Price: low to high",\
          "shoprs": "CAEYFyoDcHM1MhwIFxISUHJpY2U6IGxvdyB0byBoaWdoKgQQARgBYAKIAQE"\
        },\
        ...\
      ]\
    },\
    {\
      "type": "Category",\
      "options": [\
        {\
          "text": "PlayStation Controllers",\
          "shoprs": "CAEYCSoDcHM1MhsICRIXUGxheVN0YXRpb24gQ29udHJvbGxlcnNgAg"\
        },\
        ...\
      ]\
    },\
    ...\
  ],
  "shopping_ads": [\
    {\
      "position": 1,\
      "block_position": "top",\
      "title": "Playstation 5 Digital Console Slim - Marvel's Spider-Man 2 Bundle, White",\
      "seller": "Walmart",\
      "link": "https://www.walmart.com/ip/Playstation-5-Digital-Console-Slim-Marvel-s-Spider-Man-2-Bundle/5395472295?wmlspartner=wlpa&selectedSellerId=147",\
      "domain": "walmart.com",\
      "price": "$459.99",\
      "extracted_price": 459.99,\
      "rating": 4.7,\
      "reviews": 5000,\
      "image": "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQMIFNwj3G5eCHTg3cDhtbveRuICQVC2F5Hp4vzkuGwqGS0gRic26FjqmIhjqAvFNnKXHFtvp5h7sogvM-UGHGy4ww590e3GGBzQ2RxAgJ0WSy9ujZSUe4MGiCDbi49BYFuRVR0xA&usqp=CAc"\
    },\
    ...\
  ],
  "shopping_results": [\
    {\
      "position": 1,\
      "product_id": "8039622388823297908",\
      "title": "Sony Playstation 5 Digital",\
      "product_link": "https://www.google.com/search?ibp=oshop&q=Sony+PlayStation+5+Slim+Console+Digital+Edition&prds=gpcid:7280282012146974389,headlineOfferDocid:9784129915425045884,imageDocid:6744322870047317904,pvo:3,pvt:hg&gl=us&hl=en&udm=28",\
      "seller": "GameStop",\
      "offers": "3+",\
      "extracted_offers": 3,\
      "offers_link": "https://www.google.com/search?ibp=oshop&q=Sony+PlayStation+5+Slim+Console+Digital+Edition&prds=gpcid:7280282012146974389,headlineOfferDocid:9784129915425045884,imageDocid:6744322870047317904,pvo:3,pvt:hg&gl=us&hl=en&udm=28",\
      "price": "$429.99",\
      "extracted_price": 429.99,\
      "rating": 4.4,\
      "reviews": 9400,\
      "delivery": "Free by 7/16",\
      "durability": "Pre-owned",\
      "thumbnail": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcT7iEgHamefjZlmViMlw1HwT0rpjGuX9D_SOcC7o-iehd5IVtjFKnUzgvYJkm7FGtnn9DJkEIWvcGpuzgZ9p9PeBroASb7-8peYCh4cdM0",\
      "thumbnail_video": "https://www.gstatic.com/search-ar-dev/renders/11313726882518828376_ml/837011672042496373_v5/square_video.mp4",\
      "product_token": "eyJxIjoiUFM1IiwicHJvZHVjdGlkIjoiIiwiY2F0YWxvZ2lkIjoiMTAzNjQ4MDQxODQyNDI3MTYxMjgiLCJncGNpZCI6IjEwMjUyOTU5Nzg2MDY1MTQxMDk0IiwiaGVhZGxpbmVPZmZlckRvY2lkIjoiNTgyMTA2OTc5NDMyMTIwNDE3MSIsInJkcyI6IlBDXzEwMjUyOTU5Nzg2MDY1MTQxMDk0fFBST0RfUENfMTAyNTI5NTk3ODYwNjUxNDEwOTQiLCJpbWFnZURvY2lkIjoiNjAzNTc3NzA0NTk5MjYxNTg3MyIsInB2byI6IjMiLCJlaSI6IlMiLCJtaWQiOiIiLCJwdnQiOiJoZyIsImdsIjoidXMiLCJobCI6ImVuIiwidXVsZSI6IncrQ0FJUUlDSVlRMkZzYVdadmNtNXBZU3hWYm1sMFpXUWdVM1JoZEdWeiJ9"\
    },\
    ...\
  ]
}
```

### [Shopping Results](https://www.searchapi.io/docs/google-shopping\#api-examples-shopping-results)

![Shopping Results](https://www.searchapi.io/assets/docs/google_shopping_new/shopping_results-4b72b9e2d4343b2bb2cc2ecc5d86904811b6f0c3c0cca7211e2012b34b4e98ca.png)

GET

```http

```

Request

Python

Language

- Python

- Node

- Ruby

- Java

- Go

- PHP

- Bash

- R

- Kotlin

- Swift

- C#

- C

- C++


requests

Library

- requests


```python
import requests

url = "https://www.searchapi.io/api/v1/search"
params = {
  "engine": "google_shopping",
  "q": "Iphone",
  "gl": "us",
  "hl": "en",
  "location": "New York,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "shopping_results": [\
    {\
      "position": 1,\
      "product_id": "5458859202991111437",\
      "title": "Apple iPhone 15 Pro Max",\
      "product_link": "https://www.google.com/shopping/product/5458859202991111437?gl=us&hl=en",\
      "seller": "T-Mobile",\
      "offers": "10+",\
      "extracted_offers": 10,\
      "offers_link": "https://www.google.com/shopping/product/5458859202991111437/offers?gl=us&hl=en&uule=w+CAIQICIYQ2FsaWZvcm5pYSxVbml0ZWQgU3RhdGVz",\
      "price": "$399.99 now",\
      "extracted_price": 399.99,\
      "installment": {\
        "down_payment": "$399.99 now",\
        "extracted_down_payment": 399.99,\
        "months": "24",\
        "extracted_months": 24,\
        "cost_per_month": "$50/mo",\
        "extracted_cost_per_month": 50\
      },\
      "rating": 4.5,\
      "reviews": 17000,\
      "delivery": "Free delivery",\
      "thumbnail": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSWca-hAFk02X8lJn-3ez8iBbjWOmUNt5RZ_5EwGXt5sCHUix-srIxGmqUuBKcZgH-x_wqfG6Md6qjJ_TaXh5ZbEUkYT0Yc7o7e9I2EbpuIze1Eg7M3b6w1Uw",\
      "product_token": "eyJxIjoiSXBob25lIDE1IHBybyBtYXgiLCJwcm9kdWN0aWQiOiIxNTkzNjQ4NzM4NDc4MDQ2Mzc3MiIsImNhdGFsb2dpZCI6IiIsImdwY2lkIjoiIiwiaGVhZGxpbmVPZmZlckRvY2lkIjoiMTU5MzY0ODczODQ3ODA0NjM3NzIiLCJyZHMiOiJQQ18xNzc4MDc4MTMwOTQ4MzM0Njk2MXxQUk9EX1BDXzE3NzgwNzgxMzA5NDgzMzQ2OTYxIiwiaW1hZ2VEb2NpZCI6IjE3NzY4ODM2NTM5NzY2OTI1MDEwIiwicHZvIjoiMyIsImVpIjoiM1A3VGFPYm9Lc1Rja1BJUHpNYkFnUW8iLCJtaWQiOiIiLCJwdnQiOiJoZyIsImdsIjoidXMiLCJobCI6ImVuIiwidXVsZSI6IncrQ0FJUUlDSVdUbVYzSUZsdmNtc3NWVzVwZEdWa0lGTjBZWFJsY3cifQ=="\
    },\
    ...\
  ]
}
```

### [Popular Products](https://www.searchapi.io/docs/google-shopping\#api-examples-popular-products)

![Popular Products](https://www.searchapi.io/assets/docs/google_shopping_new/popular_products-28e0bdd64f0880c99c437362b2bd5b28fa3adbe202328e70bf9d02a0e1c40a81.png)

GET

```http

```

Request

Python

Language

- Python

- Node

- Ruby

- Java

- Go

- PHP

- Bash

- R

- Kotlin

- Swift

- C#

- C

- C++


requests

Library

- requests


```python
import requests

url = "https://www.searchapi.io/api/v1/search"
params = {
  "engine": "google_shopping",
  "q": "Lenovo",
  "gl": "us",
  "hl": "en",
  "location": "New York,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "popular_products": [\
    {\
      "position": 1,\
      "product_id": "12662605563035131269",\
      "title": "Lenovo Tab M8 4th Gen",\
      "product_link": "https://www.google.com/shopping/product/12662605563035131269?gl=us&hl=en",\
      "seller": "Lenovo",\
      "offers": "10+",\
      "extracted_offers": 10,\
      "offers_link": "https://www.google.com/shopping/product/12662605563035131269/offers?gl=us&hl=en&uule=w+CAIQICIWTmV3IFlvcmssVW5pdGVkIFN0YXRlcw",\
      "price": "$85.49",\
      "extracted_price": 85.49,\
      "original_price": "$100",\
      "extracted_original_price": 100.0,\
      "rating": 4.3,\
      "reviews": 959,\
      "tag": "14% OFF",\
      "delivery": "Free delivery",\
      "thumbnail": "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTJsI5xtfkZtIgEVeSbuLr0W2SLAUrqx-ggbQhAlFLy2dqXvToE-7c5Rcwv_XhTu7T6RqDPO3_GirH5aHBWvoQ6ikOR2O2w9YfkAc9Wcso"\
    },\
    ...\
  ]
}
```

### [Shopping Ads](https://www.searchapi.io/docs/google-shopping\#api-examples-shopping-ads)

![Shopping Ads](https://www.searchapi.io/assets/docs/google_shopping_new/shopping_ads-9987bc4ef90d11cbf8e96733802e4608d454718092a854b6575df4bab86ca9e6.png)

GET

```http

```

Request

Python

Language

- Python

- Node

- Ruby

- Java

- Go

- PHP

- Bash

- R

- Kotlin

- Swift

- C#

- C

- C++


requests

Library

- requests


```python
import requests

url = "https://www.searchapi.io/api/v1/search"
params = {
  "engine": "google_shopping",
  "q": "Android",
  "gl": "us",
  "hl": "en",
  "location": "California,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "shopping_ads": [\
    {\
      "position": 1,\
      "block_position": "top",\
      "title": "TCL TAB 8 LE (with 24 monthly payments + plan)",\
      "seller": "T-Mobile",\
      "link": "https://www.t-mobile.com/tablet/tcl-tab-8-le?sku=610214676276",\
      "domain": "t-mobile.com",\
      "price": "$0.00 now",\
      "extracted_price": 0,\
      "installment": {\
        "down_payment": "$0.00 now",\
        "extracted_down_payment": 0,\
        "months": "24",\
        "extracted_months": 24,\
        "cost_per_month": "$7.00/mo",\
        "extracted_cost_per_month": 7\
      },\
      "image": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTEIfd7wek01FCqKnd7jj-7XbCJ2oBkkyNghqsAOITDqSucGCkSPgydPRKAAT1SGAjs_8pw4U_LsyZLey_z68o5NbHn-xiMl_Bbe-Qd7eORPHn7iUTWmufqNUekoxC6oc97fsCZb1lTC-0&usqp=CAc"\
    },\
    ...\
  ]
}
```

### [Filters](https://www.searchapi.io/docs/google-shopping\#api-examples-filters)

![Filters](https://www.searchapi.io/assets/docs/google_shopping_new/filters-bf4b792100c2b40eca366ddd67fa1c055ca2389a8a10301f20d91e73a0cf29f5.png)

**Note:** When `all_filters_token` is present, it can be used to get all available filters (hidden by "See more" link). See [Google Shopping Filters API documentation](https://www.searchapi.io/docs/google-shopping-filters) for more details.


GET

```http

```

Request

Python

Language

- Python

- Node

- Ruby

- Java

- Go

- PHP

- Bash

- R

- Kotlin

- Swift

- C#

- C

- C++


requests

Library

- requests


```python
import requests

url = "https://www.searchapi.io/api/v1/search"
params = {
  "engine": "google_shopping",
  "q": "Shoes",
  "gl": "us",
  "hl": "en",
  "location": "Washington,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "filters": [\
    {\
      "type": "Sort by",\
      "options": [\
        {\
          "text": "Price: low to high",\
          "shoprs": "CAEYFyoFc2hvZXMyHAgXEhJQcmljZTogbG93IHRvIGhpZ2gqBBABGAFgAogBAQ"\
        },\
        ...\
      ]\
    },\
    {\
      "type": "Department",\
      "options": [\
        {\
          "text": "Men's",\
          "shoprs": "CAEYASoFc2hvZXMyFQgBEgVNZW4nczoKCICjPhCBoz4wBVjmpyBgAg"\
        },\
        ...\
      ]\
    },\
    ...\
  ],
  ...
  "all_filters_token": "eyJ2ZXQi...VXzUwIn0"
}
```

### [Categorized Shopping Results](https://www.searchapi.io/docs/google-shopping\#api-examples-categorized-shopping-results)

![Categorized Shopping Results](https://www.searchapi.io/assets/docs/google_shopping_new/categorized_shopping_results-77b885dd6c874157451a69bd3e6b0ab918944524ece0a8b7b97420e45e881334.png)

**Note:** Google ships the images of the first carousels only as inline base64 data. Set `include_base_images=true` to get them as `thumbnail`. Carousels loaded further down the page return image URLs either way.


GET

```http

```

Request

Python

Language

- Python

- Node

- Ruby

- Java

- Go

- PHP

- Bash

- R

- Kotlin

- Swift

- C#

- C

- C++


requests

Library

- requests


```python
import requests

url = "https://www.searchapi.io/api/v1/search"
params = {
  "engine": "google_shopping",
  "q": "Mechanical Keyboard",
  "gl": "us",
  "hl": "en",
  "location": "California,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "categorized_shopping_results": [\
    {\
      "title": "Mechanical Keyboards for Gaming",\
      "shopping_results": [\
        {\
          "position": 1,\
          "product_id": "4603642511690907054",\
          "title": "GravaStar Mercury K98 Pro Wireless Mechanical Gaming Keyboard",\
          "product_link": "https://www.google.com/search?ibp=oshop&q=Mechanical+Keyboard&prds=catalogid:4603642511690907054,gpcid:12323468600462210222,headlineOfferDocid:4588585209288934110,imageDocid:1924839028999907255,pvo:25,pvt:hg&gl=us&hl=en&udm=28",\
          "offers": "& more",\
          "offers_link": "https://www.google.com/search?ibp=oshop&q=Mechanical+Keyboard&prds=catalogid:4603642511690907054,gpcid:12323468600462210222,headlineOfferDocid:4588585209288934110,imageDocid:1924839028999907255,pvo:25,pvt:hg&gl=us&hl=en&udm=28",\
          "price": "$259.95",\
          "extracted_price": 259.95,\
          "rating": 4.5,\
          "reviews": 107,\
          "seller": "Micro Center",\
          "product_token": "eyJxIjoiTWVjaGFuaWNhbCBLZXlib2FyZCIsImdsIjoidXMiLCJobCI6ImVuIiwidXVsZSI6IncrQ0FJUUlDSVlRMkZzYVdadmNtNXBZU3hWYm1sMFpXUWdVM1JoZEdWeiIsImVpIjoiUGx5MGF2WEFBNldLNU9VUDE3aUZ5UTQiLCJwcm9kdWN0aWQiOiI1NTMxMzA1NzEyMDY3NDE2OTU3IiwiY2F0YWxvZ2lkIjoiNDYwMzY0MjUxMTY5MDkwNzA1NCIsImdwY2lkIjoiMTIzMjM0Njg2MDA0NjIyMTAyMjIiLCJoZWFkbGluZU9mZmVyRG9jaWQiOiI0NTg4NTg1MjA5Mjg4OTM0MTEwIiwiaW1hZ2VEb2NpZCI6IjE5MjQ4MzkwMjg5OTk5MDcyNTUiLCJvYXB2ZmMiOiJFb3dEQ3N3Q1FVcHBWRFIwU1ZCMFNsUXpVekJUTUhoVFdYSnJTM2xWT0RkUGNFMXVTbVZuTWxkdGEyNWhXbUpsTmt3eFltdFZVRlJ6VDFKeFNYTnFlak5hVEVGTGNXWldkRXRDUTBSdVJtMWxkR2czZWpGeWVIbHVTSHBqVVhseU5qTjJTa2t5U0dobFZFMHhTV2xrVGpsUlIzZHRPV1l6VlRkMVoySnZUMXBXTVhGZlVrOHpZMUJhUTFwV09GSlhVRzFvU0VOc05YUXpRbEJtYVhaa1lUWnBWSE50UTBSdWNtUmxOMFpWWjNWemVtWTFhVzlaU0ZCbmNHSkVaVGR4WVhWTE4wVk1RazluVW1GSmRIbFhPRE5mV2xoVWFWZHJPRzFWV1dkME1rdzRNalY0TUhJMFFrNDVTa05mZEVGWE1IWmpNemhoYjA5NU4ydHJaVlp1Vm1WU05VOUtXV1o1V1hoRFVpMXhVemwzWVhFMmJEUnNXbVZJUzBKdlIwRkJObFIyYnpadWFuTkVURGxhYmtWbldtaFpTSEZUVDJsU1UzTllRMGgyYjBONVlVaEhkbFkyTFZreGVGaHhVMGd6TjJjU0YxQnNlVEJoZGxoQlFUWlhTelZQVlZBeE4ybEdlVkUwR2lKQlJITnlPV1pVYlhFMlQwWnljM0ZPVHpGcFJGSm1hME5uY210SGQyMUlSbnAzIiwieHNyZiI6IkFGNXRTTzZHM2o2WHBJeV9rTkZpUE05SnR6SzdSZkdoQnc6MTc5MDIwNDk5MDczNSJ9"\
        },\
        ...\
      ]\
    },\
    ...\
  ]
}
```

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy