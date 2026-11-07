Close sidebar

[LogoSearchApi](https://www.searchapi.io/)

[Sign in](https://www.searchapi.io/users/sign_in) [Sign up](https://www.searchapi.io/users/sign_up)

Open sidebar

[LogoSearchApi](https://www.searchapi.io/)

[Sign in](https://www.searchapi.io/users/sign_in) [Sign up](https://www.searchapi.io/users/sign_up)

# Google Lens API

GET/api/v1/search?engine=google\_lens

[OpenAPI InitiativeDownload OpenAPI Spec](https://www.searchapi.io/openapi/google_lens.yaml)

[See in postman\\
\\
\\
See the Google Lens API in Postman](https://www.postman.com/searchapiofficial/searchapi-official-postman-collection/request/45090949-1471371a-60c8-4ab2-95f0-d7ae758e3986/google-lens)

The Google Lens API, enables real-time scraping of visual search results. This powerful tool transforms images into actionable insights.


Breaking change

As of October 7, 2026, Google Lens no longer has a Products tab. The `products` value of `search_type` is no longer supported. A search with `search_type=products` and no `q` returns a `400` error. Use `search_type=visual_matches` instead, with or without `q`. Some visual matches carry price and stock. To find priced listings for the pictured product, search the [Google Shopping API](https://www.searchapi.io/docs/google-shopping) with the title of one of the visual matches. We will resume support if Google Lens brings the Products tab back.


Use the Google Lens API engine for tasks such as:


- Recognizing landmarks, objects, or animals.
- Extracting and translating text from images.
- Finding visually similar products and the pages that sell them.
- Finding similar and exactly same images.

## [Changelog (New vs Old Layout)](https://www.searchapi.io/docs/google-lens\#changelog)

On 2025-01-02, Google Lens transitioned its desktop interface to the new layout. Support for the updated layout was added within an hour.

- **\[BREAKING\]** Google has updated the layout for the Google Lens engine. It now has 4 different tabs of results, accessible via a new request parameter: `search_type`.
The available options are: `all` (DEFAULT), `exact_matches`, `visual_matches`, and `products`.
- **\[BREAKING\]** The keys `visual_matches.exact_price` is no longer supported.
- **\[NEW\]** A new key, `exact_matches.extensions`, has been added.

Google redirect links

Google now serves `exact_matches` and `organic_results` links as encrypted redirects (`https://www.google.com/goto?url=...`). `visual_matches` links are recovered from the page and are already direct. If you need the direct destination URLs, add `link=resolved` and we resolve each redirect for you. An exact matches page can carry several hundred of them, so expect a noticeably slower response.


## [API Parameters](https://www.searchapi.io/docs/google-lens\#api-parameters)

### [Search Query](https://www.searchapi.io/docs/google-lens\#api-parameters-search-query)

- Name[`url`](https://www.searchapi.io/docs/google-lens#api-parameters-search-query-url)Required
Required
Description


Parameter defines the image url. This is the direct link to the image you want Google Lens to analyze. Ensure the URL points to a valid image format (e.g., .jpg, .png) and is accessible publicly.


- Name[`q`](https://www.searchapi.io/docs/google-lens#api-parameters-search-query-q)Required
Optional
Description


Specifies the text query to be searched alongside the image.
The `q` parameter is only applicable when `search_type` is set to `all` or `visual_matches`.



### [Localization](https://www.searchapi.io/docs/google-lens\#api-parameters-localization)

- Name[`hl`](https://www.searchapi.io/docs/google-lens#api-parameters-localization-hl)Required
Optional
Description


The default parameter `en` defines the interface language of the search. Check the full list of supported [Google `hl` languages](https://www.searchapi.io/docs/parameters/google/hl).


- Name[`country`](https://www.searchapi.io/docs/google-lens#api-parameters-localization-country)Required
Optional
Description


Two-letter country code to tailor results to a specific location. Defaults to `US`. Check the full list of supported [Google Lens `country` codes](https://www.searchapi.io/docs/parameters/google-lens/country).



Shopping results in Google Lens API are available in Austria, Australia, Belgium, Brazil, Canada, Chile, Colombia, Czech Republic, Denmark, France, Germany, India, Indonesia, Ireland, Italy, Japan, Malaysia, Mexico, Netherlands, New Zealand, Norway, Philippines, Poland, Portugal, Russia, Singapore, South Africa, South Korea, Spain, Sweden, Switzerland, Turkey, UAE, United Kingdom, and United States.



### [Device](https://www.searchapi.io/docs/google-lens\#api-parameters-device)

- Name[`device`](https://www.searchapi.io/docs/google-lens#api-parameters-device-device)Required
Optional
Description


The default parameter `desktop` defines the search on a desktop device. The `mobile` parameter defines the search on a mobile device. Google Lens is not available on tablets.



### [Filters](https://www.searchapi.io/docs/google-lens\#api-parameters-filters)

- Name[`search_type`](https://www.searchapi.io/docs/google-lens#api-parameters-filters-search-type)Required
Optional
Description


The `search_type` parameter allows you to filter the search results. Supported values are `all`, `visual_matches`, and `exact_matches`.


- Name[`safe_search`](https://www.searchapi.io/docs/google-lens#api-parameters-filters-safe-search)Required
Optional
Description


Filters adult content in search results. Supported values are `active` to enable strict filtering, `blur` to blur explicit images, and `off` to disable filtering. Only works when `search_type` is set to `exact_matches`.


- Name[`crop`](https://www.searchapi.io/docs/google-lens#api-parameters-filters-crop)Required
Optional
Description


Crops the image before lens search. Format: `left;top;right;bottom`, with each value between 0 and 1. For example, `0.1;0.2;0.6;0.75` selects the region from 10% to 60% of the width and 20% to 75% of the height. Default is `0;0;1;1` (full image). `left` must be less than `right`, and `top` less than `bottom`.



### [Result Links](https://www.searchapi.io/docs/google-lens\#api-parameters-result-links)

- Name[`link`](https://www.searchapi.io/docs/google-lens#api-parameters-result-links-link)Required
Optional
Description


Controls how result links are returned when Google serves them as an encrypted redirect (`https://www.google.com/goto?url=...`). This affects `exact_matches` and `organic_results`. `visual_matches` links are recovered from the page and are already direct URLs. By default (`raw`) the redirect is returned as-is. Set it to `resolved` to return the direct destination URL instead. An `exact_matches` page can carry several hundred links and each one is followed individually, so expect a noticeable increase in response time. A redirect that cannot be resolved stays as the redirect URL.



### [Engine](https://www.searchapi.io/docs/google-lens\#api-parameters-engine)

- Name[`engine`](https://www.searchapi.io/docs/google-lens#api-parameters-engine-engine)Required
Required
Description


Parameter defines an engine that will be used to retrieve real-time data. It must be set to `google_lens`.



### [API key](https://www.searchapi.io/docs/google-lens\#api-parameters-api-key)

- Name[`api_key`](https://www.searchapi.io/docs/google-lens#api-parameters-api-key-api-key)Required
Required
Description


The `api_key` authenticates your requests. Use it as a query parameter (`https://www.searchapi.io/api/v1/search?api_key=YOUR_API_KEY`) or in the Authorization header (`Bearer YOUR_API_KEY`).



### [Zero Data Retention](https://www.searchapi.io/docs/google-lens\#api-parameters-zero-data-retention)

- Name[`zero_retention`](https://www.searchapi.io/docs/google-lens#api-parameters-zero-data-retention-zero-retention)Enterprise OnlyEnterprise OnlyRequired
Optional
Description


Set this parameter to `true` to disable all logging and persistent storage. No request parameters, HTML, or JSON responses are stored or logged. Suitable for high-compliance use cases. Debugging and support may be limited while enabled.



## [API Examples](https://www.searchapi.io/docs/google-lens\#api-examples)

### [Search Type - All](https://www.searchapi.io/docs/google-lens\#api-examples-search-type-all)

![Search Type - All](https://www.searchapi.io/assets/docs/google_lens/all-7fe402d190826db3f85ad56fd9298f041dc747cb8cc9af0f8df3f247a78d0825.png)

**Integration tips:**

- Changing `country` parameter changes results and prefers that country currency.
- `organic_results` holds the web results Google shows below the visual matches. A result with a price carries `price`.

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
  "engine": "google_lens",
  "search_type": "all",
  "url": "https://upload.wikimedia.org/wikipedia/en/7/7a/Harry_Potter_and_the_Philosopher%27s_Stone_banner.jpg"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "visual_matches": [\
    {\
      "position": 1,\
      "title": "Harry Potter movie poster The Philosopher's Stone movie poster - 12 x 16 inches | eBay",\
      "link": "https://www.ebay.com/itm/392735195626",\
      "image": {\
        "link": "https://i.ebayimg.com/images/g/fhQAAOxyA4ZRXbWi/s-l1200.jpg",\
        "height": 702,\
        "width": 956\
      },\
      "source": "eBay",\
      "price": "$14*",\
      "extracted_price": 14,\
      "currency": "USD",\
      "stock_information": "In stock",\
      "thumbnail": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcS8fH3fwLVC8JK_l7VvEYd1o40bJH2khbmNYHPPmXU1s75YQGqr"\
    },\
    ...\
  ],
  "related_searches": [\
    {\
      "title": "Harry Potter and the Sorcerer's Stone",\
      "link": "https://www.google.com/search?sca_esv=dfa57c05b4e3cad6&hl=en&q=Harry+Potter+and+the+Sorcerer%27s+Stone&kgmid=/m/03176f&sa=X&ved=2ahUKEwi0vqn33teKAxXAMlkFHWHrH-0Q9_gLKAB6BAhpEAE",\
      "thumbnail": "data:image/jpeg;base64,..."\
    },\
    ...\
  ],
  "organic_results": [\
    {\
      "position": 1,\
      "title": "Harry Potter movie poster The Philosopher's Stone ...",\
      "link": "https://www.google.com/goto?url=CAESYAHrOzAVIaaOb5IcXkDP6l6JxzoX78CPQG9zAhiCp7IXuHltyQED5QFmDar_mY0brOqgD36fAaFdbb_xw8lOIW7fn8V7bPL61SEKqLvSAOhf7tt9riLAShQphPLERM7VMg",\
      "source": "eBay",\
      "displayed_link": "https://www.ebay.com › ... › 2000-Now",\
      "snippet": "Harry Potter movie poster The Philosopher's Stone movie poster - 12 x 16 inches ; SIZE · 12\" x 16\". ; Delivery. Free 2-4 day delivery. Thu, Oct 15 - Sat, Oct 17.",\
      "snippet_highlighted_words": [\
        "Harry Potter movie poster"\
      ],\
      "favicon": "data:image/png;base64,...",\
      "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYNybMZCQvvRxfbW8aRtHT41Sh-uQAvANqwCgcyUYNwGvUGHTI_6VA&usqp=CAE&s"\
    },\
    ...\
  ]
}
```

### [Search Type - Visual Matches](https://www.searchapi.io/docs/google-lens\#api-examples-search-type-visual-matches)

![Search Type - Visual Matches](https://www.searchapi.io/assets/docs/google_lens/visual_matches-116702df8f956544ea8e0f61dcc4da91db9bd48686c8dd191e08019aeb1c4f5a.png)

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
  "engine": "google_lens",
  "search_type": "visual_matches",
  "url": "https://i.ibb.co/12qRDsk/tower.png"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "visual_matches": [\
    {\
      "position": 1,\
      "title": "Sheer Window Curtain Paris Tower - PIXERS.HK",\
      "link": "https://pixers.hk/sheer-window-curtains/paris-tower-48878913",\
      "image": {\
        "link": "https://img.pixers.pics/pho_wat(s3:700/FO/48/87/89/13/700_FO48878913_be6ca6191cc09f681cd2c5ab7e99ac1a.jpg,467,700,cms:2018/10/5bd1b6b8d04b8_220x50-watermark.png,over,247,650,jpg)/sheer-window-curtains-paris-tower.jpg.jpg",\
        "height": 700,\
        "width": 467\
      },\
      "source": "pixers.hk",\
      "price": "$120*",\
      "extracted_price": 120,\
      "currency": "USD",\
      "stock_information": "In stock",\
      "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnZlkvd-QIGB3JKe7Ao6NGxFmN0gHrri38SFEgO1DKBvD17AGD"\
    },\
    ...\
  ]
}
```

### [Search Type - Exact Matches](https://www.searchapi.io/docs/google-lens\#api-examples-search-type-exact-matches)

![Search Type - Exact Matches](https://www.searchapi.io/assets/docs/google_lens/exact_matches-c3a34a69aad19f08bda9fc61157aefa3ee5c2cde7f4c96592ae6df8ff2b4e4a7.png)

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
  "engine": "google_lens",
  "search_type": "exact_matches",
  "url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1692846360609"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "exact_matches": [\
    {\
      "position": 1,\
      "title": "Apple iPhone 15 Pro Max 17 cm (6.7\") Doppia SIM iOS 17 5G USB ...",\
      "link": "https://www.ebay.com/itm/196027442194",\
      "source": "eBay",\
      "price": "€1,700.90",\
      "extracted_price": 1700.9,\
      "currency": "EUR",\
      "stock_information": "In stock",\
      "thumbnail": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAABLUlEQVR4Ae3WJUADYRjG8UMzDpmCJNyl4ZpxSbhrQ9viGu4Oc+8BJ7KCR5y2vXzPrOCypS/8J2e/8zshu63ApXHw3ZpbWkKR08G2trZS1hrrBNl+lzoDBNbMugPU2tYmQjYUw5r/Fewersi0LXha3FUYYh+O3xiGcZjm30D71rx33DDMvtV/Ao1J6XH2xvtrDdWNYyrfuqNYe/cbfo4wHmErx1RBEehH4FVMUjjr6SY6gZA6o8ocWa42CfUnZKnCSCQT6GXLzdL5lmCalPmaR1XBhMZUwU9Afw1qMyopokJDH4GX2140pfCn74Mc5CAHOYinwF9BLOPbIGLQwm9BkSpw5VePp73kYjFgfEeUayQMs1ZxKmGg5HnLXcJAyeW2twQIYls3yN/a/jUOvgKkonKBWnbPogAAAABJRU5ErkJggg==",\
      "extensions": ["€1,700.90", "In stock", "400x400"]\
    },\
    ...\
  ]
}
```

### [Search Type - Visual Matches with Query](https://www.searchapi.io/docs/google-lens\#api-examples-search-type-visual-matches-with-query)

![Search Type - Visual Matches with Query](https://www.searchapi.io/assets/docs/google_lens/query-f92498b5e9bebd266d2522cc2582fc2167d7842ee1589efac8f3b1d00e53807c.png)

**Integration tips:**

- With `q`, `search_type=all` and `search_type=visual_matches` run the same search.

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
  "engine": "google_lens",
  "search_type": "visual_matches",
  "q": "eBay",
  "url": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1692846360609"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "visual_matches": [\
    {\
      "position": 1,\
      "title": "Apple iPhone 15 Pro 128GB 256GB 512GB 1TB Unlocked ...",\
      "link": "https://www.ebay.com/itm/157671293952",\
      "image": {\
        "link": "https://i.ebayimg.com/images/g/-wsAAOSwzS5nyJIG/s-l1200.jpg",\
        "height": 808,\
        "width": 808\
      },\
      "source": "eBay",\
      "price": "$570*",\
      "extracted_price": 570.0,\
      "stock_information": "In stock",\
      "thumbnail": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRndS8-MbaIq_p6pqtYgi0_CB8B-YnP3QyY4caAULkdx-b5TO95"\
    },\
    ...\
  ]
}
```

Click to copy

Click to copy

Click to copy

Click to copy