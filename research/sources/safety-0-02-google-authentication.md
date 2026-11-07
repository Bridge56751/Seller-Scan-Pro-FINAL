Source: https://www.searchapi.io/docs/google
Title: Google Search Scraper API
Fetched: 2026-11-07T22:01:53.454Z

Close sidebar

[LogoSearchApi](https://www.searchapi.io/)

[Sign in](https://www.searchapi.io/users/sign_in) [Sign up](https://www.searchapi.io/users/sign_up)

Open sidebar

[LogoSearchApi](https://www.searchapi.io/)

[Sign in](https://www.searchapi.io/users/sign_in) [Sign up](https://www.searchapi.io/users/sign_up)

# Google Search API

GET/api/v1/search?engine=google

[OpenAPI InitiativeDownload OpenAPI Spec](https://www.searchapi.io/openapi/google.yaml)

[See in postman\\
\\
\\
See the Google Search API in Postman](https://www.postman.com/searchapiofficial/searchapi-official-postman-collection/request/45090949-af969e09-4e8b-48d6-8d75-b180bc9e4796/google-search)

Google redirect links

Google now serves some links as encrypted redirects (`https://www.google.com/goto?url=...`) in organic results, AI Overview and People Also Ask reference links, sitelinks, perspectives, knowledge graph profiles and video key moments. The top three organic result links are resolved to their destination URL for you. Add `link=resolved` and we resolve every remaining redirect to its destination URL as well.


## [API Parameters](https://www.searchapi.io/docs/google\#api-parameters)

### [Search Query](https://www.searchapi.io/docs/google\#api-parameters-search-query)

- Name[`q`](https://www.searchapi.io/docs/google#api-parameters-search-query-q)Required
Required
Description


This parameter is used for the terms you want to search on Google. Queries can include operators and advanced filters like "machine learning models", `site:`, `inurl:`, `intitle:`, `AND`, or `OR`.


- Name[`kgmid`](https://www.searchapi.io/docs/google#api-parameters-search-query-kgmid)Required
Optional
Description


Defines a Knowledge Graph identifier (kgmid), representing entities in Google's Knowledge Graph. Format:




  - Location Identifier (`/m/`): Typically followed by 2 to 7 characters. Used primarily to represent specific locations. Find the identifier by searching for the "Freebase ID" on [Wikidata](https://www.wikidata.org/wiki/Property:P646). Example: `kgmid=/m/02_286` refers to New York.

  - Google Knowledge Graph Identifier (`/g/`): Typically followed by a longer alphanumeric string. Represents general entities in Google's Knowledge Graph. Find details on [Wikidata](https://www.wikidata.org/wiki/Property:P2671). Example: `kgmid=/g/11f555cn8l` refers to TikTok.


### [Device](https://www.searchapi.io/docs/google\#api-parameters-device)

- Name[`device`](https://www.searchapi.io/docs/google#api-parameters-device-device)Required
Optional
Description


The default parameter `desktop` defines the search on a desktop device. The `mobile` parameter defines the search on a mobile device. The `tablet` parameter defines the search on a tablet device.



### [Geographic Location](https://www.searchapi.io/docs/google\#api-parameters-geographic-location)

- Name[`location`](https://www.searchapi.io/docs/google#api-parameters-geographic-location-location)Required
Optional
Description


This parameter is used to specify the canonical location of the search. For exact targeting or to see all available options, check out the [Locations API](https://www.searchapi.io/docs/locations-api). If multiple locations match your input, the most popular one will be selected.


For example - `location=New York` would select `New York,United States` or `location=London` would select `London TV Region,England,United Kingdom`.


- Name[`uule`](https://www.searchapi.io/docs/google#api-parameters-geographic-location-uule)Required
Optional
Description


This parameter sets the exact Google-encoded location for the search, and `uule` and `location` cannot be used at the same time. SearchApi builds it for you when you use the `location` parameter, but you can provide your own if you want precise control.


- Name[`latitude`](https://www.searchapi.io/docs/google#api-parameters-geographic-location-latitude)Required
Optional
Description


Latitude of the search location, in decimal degrees (-90 to 90). Use with `longitude`. Cannot be combined with `location` or `uule`.


- Name[`longitude`](https://www.searchapi.io/docs/google#api-parameters-geographic-location-longitude)Required
Optional
Description


Longitude of the search location, in decimal degrees (-180 to 180). Use with `latitude`. Cannot be combined with `location` or `uule`.



### [Localization](https://www.searchapi.io/docs/google\#api-parameters-localization)

- Name[`google_domain`](https://www.searchapi.io/docs/google#api-parameters-localization-google-domain)DeprecatedDeprecatedRequired
Optional
Description


As of Apr 15, 2025, Google began phasing out country code top-level domains (ccTLDs). Users using the search bar or visiting local domains like `google.de` or `google.co.uk` are now automatically redirected to `google.com`. For localized searches, use the `gl` (country), `hl` (language) or other localization parameters instead. Learn more in [Google's official announcement](https://blog.google/products/search/country-code-top-level-domains/). See the full list of [supported Google domains](https://www.searchapi.io/docs/parameters/google/domain).


- Name[`gl`](https://www.searchapi.io/docs/google#api-parameters-localization-gl)Required
Optional
Description


The default parameter `us` defines the country of the search. Check the full list of supported [Google `gl` countries](https://www.searchapi.io/docs/parameters/google/gl). When `latitude` and `longitude` are used, `gl` is inferred from the coordinates, and coordinates in a country this engine does not support are rejected.


- Name[`hl`](https://www.searchapi.io/docs/google#api-parameters-localization-hl)Required
Optional
Description


The default parameter `en` defines the interface language of the search. Check the full list of supported [Google `hl` languages](https://www.searchapi.io/docs/parameters/google/hl).


- Name[`lr`](https://www.searchapi.io/docs/google#api-parameters-localization-lr)Required
Optional
Description


The lr parameter restricts search results to documents written in a particular language or a set of languages. The accepted format for this parameter is `lang_{2-letter country code}`. For instance, to filter documents written in Japanese, the value should be set to `lang_jp`. To incorporate multiple languages, a value like `lang_it|lang_de` restricts the search to documents written in either Italian or German. Google identifies the document language based on the top-level domain (TLD) of the document's URL, any language meta tags present, or the language utilized within the document's body text. Check the full list of supported [Google `lr` languages](https://www.searchapi.io/docs/parameters/google/lr).


- Name[`cr`](https://www.searchapi.io/docs/google#api-parameters-localization-cr)Required
Optional
Description


The cr parameter restricts search results to documents originating in a particular country. Google determines the country of a document by the top-level domain (TLD) of the document's URL or by Web server's IP address geographic location. Check the full list of supported [Google `cr` countries](https://www.searchapi.io/docs/parameters/google/cr).



### [Filters](https://www.searchapi.io/docs/google\#api-parameters-filters)

- Name[`nfpr`](https://www.searchapi.io/docs/google#api-parameters-filters-nfpr)Required
Optional
Description


This parameter controls whether results from queries that have been auto-corrected for spelling errors are included. To exclude these auto-corrected results, set the value to `1`. By default, the value is `0`, meaning auto-corrected results are included.


- Name[`filter`](https://www.searchapi.io/docs/google#api-parameters-filters-filter)Required
Optional
Description


This parameter controls whether the "Duplicate Content" and "Host Crowding" filters are enabled. Set the value to `1` to enable these filters, which is the default setting. To disable these filters, set the value to `0`.


- Name[`safe`](https://www.searchapi.io/docs/google#api-parameters-filters-safe)Required
Optional
Description


This parameter toggles the SafeSearch feature for the results. SafeSearch operates by filtering out adult content from your search results. Google's filters use proprietary technology to check keywords, phrases and URLs. While no filters are 100 percent accurate, SafeSearch will remove the overwhelming majority of adult content from your search results. Supported values are `active` to enable strict SafeSearch, `blur` to blur explicit images, and `off` to disable SafeSearch. By default, the value is `blur`.


- Name[`time_period`](https://www.searchapi.io/docs/google#api-parameters-filters-time-period)Required
Optional
Description


This parameter restricts results to URLs based on date. Supported values are:




  - `last_1_minute` \- data from the past minute.
  - `last_5_minutes` \- data from the past 5 minutes.
  - `last_15_minutes` \- data from the past 15 minutes.
  - `last_30_minutes` \- data from the past 30 minutes.
  - `last_hour` \- data from the past hour.
  - `last_day` \- data from the past 24 hours.
  - `last_week` \- data from the past week.
  - `last_month` \- data from the past month.
  - `last_year` \- data from the past year.
  - Using `time_period_min` or `time_period_max` parameters, you can specify a custom time period.


Note, that the `time_period_min` and `time_period_max` parameters could be used separately as well.


- Name[`time_period_min`](https://www.searchapi.io/docs/google#api-parameters-filters-time-period-min)Required
Optional
Description


This parameter specifies the start of the time period. It could be used in combination with the `time_period_max` parameter. The value should be in the format `MM/DD/YYYY`.


- Name[`time_period_max`](https://www.searchapi.io/docs/google#api-parameters-filters-time-period-max)Required
Optional
Description


This parameter specifies the end of the time period. It could be used in combination with the `time_period_min` parameter. The value should be in the format `MM/DD/YYYY`.


- Name[`verbatim`](https://www.searchapi.io/docs/google#api-parameters-filters-verbatim)Required
Optional
Description


This parameter forces Google to use your exact keywords, bypassing automatic spelling corrections, synonyms, and personalized or stemmed variations. Set the value to `true` to enable. When combined with `time_period`, `time_period_min` or `time_period_max`, the time filter is ignored. Note: Verbatim mode is stricter than the `nfpr` parameter — it disables all query modifications, not just spelling corrections. If you only want to prevent spelling auto-correction while keeping other Google features, use `nfpr=1` instead.



### [Pagination](https://www.searchapi.io/docs/google\#api-parameters-pagination)

- Name[`num`](https://www.searchapi.io/docs/google#api-parameters-pagination-num)Required
Optional
Description


Phased out by Google on September 2025. It is now constant 10. Check the [Google Rank Tracking API](https://www.searchapi.io/docs/google-rank-tracking-api) for `num=100` support.


- Name[`page`](https://www.searchapi.io/docs/google#api-parameters-pagination-page)Required
Optional
Description


This parameter indicates which page of results to return. By default, it is set to `1`.



### [Optimization](https://www.searchapi.io/docs/google\#api-parameters-optimization)

- Name[`optimization_strategy`](https://www.searchapi.io/docs/google#api-parameters-optimization-optimization-strategy)Required
Optional
Description


Controls how the search request is optimized. Available options:




  - `performance`
     Default

  - `ads`
     \- optimizes for higher ad collection success rate, which may result in longer request processing times.


### [Result Links](https://www.searchapi.io/docs/google\#api-parameters-result-links)

- Name[`link`](https://www.searchapi.io/docs/google#api-parameters-result-links-link)Required
Optional
Description


Controls how Google's encrypted redirect links (`https://www.google.com/goto?url=...`) are returned. These appear in organic results, AI Overview and People Also Ask reference links, sitelinks, perspectives, knowledge graph profiles and video key moments; the top three organic result links are resolved for you. By default (`raw`) the remaining redirects are returned as-is. Set it to `resolved` to have each one followed to its destination URL. Resolving is best-effort and adds latency; a redirect that cannot be resolved stays as the redirect URL.



### [Engine](https://www.searchapi.io/docs/google\#api-parameters-engine)

- Name[`engine`](https://www.searchapi.io/docs/google#api-parameters-engine-engine)Required
Required
Description


Parameter defines an engine that will be used to retrieve real-time data. It must be set to `google`.



### [API key](https://www.searchapi.io/docs/google\#api-parameters-api-key)

- Name[`api_key`](https://www.searchapi.io/docs/google#api-parameters-api-key-api-key)Required
Required
Description


The `api_key` authenticates your requests. Use it as a query parameter (`https://www.searchapi.io/api/v1/search?api_key=YOUR_API_KEY`) or in the Authorization header (`Bearer YOUR_API_KEY`).



### [Zero Data Retention](https://www.searchapi.io/docs/google\#api-parameters-zero-data-retention)

- Name[`zero_retention`](https://www.searchapi.io/docs/google#api-parameters-zero-data-retention-zero-retention)Enterprise OnlyEnterprise OnlyRequired
Optional
Description


Set this parameter to `true` to disable all logging and persistent storage. No request parameters, HTML, or JSON responses are stored or logged. Suitable for high-compliance use cases. Debugging and support may be limited while enabled.



## [API Examples](https://www.searchapi.io/docs/google\#api-examples)

### [Full Response - Search for 'chatgpt'](https://www.searchapi.io/docs/google\#api-examples-full-response-search-for-chatgpt)

![Full Response - Search for 'chatgpt'](https://www.searchapi.io/assets/docs/google/google_search-98e380db74b3d7348bba85951c406cd2110fe8505c213a6174087120bf67f34c.png)

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
  "engine": "google",
  "q": "chatgpt"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "search_metadata": {
    "id": "search_MJjKW8mR3ZGJsDjepn9redbv",
    "status": "Success",
    "created_at": "2024-10-29T10:10:13Z",
    "request_time_taken": 1.28,
    "parsing_time_taken": 0.1,
    "total_time_taken": 1.29,
    "request_url": "https://www.google.com/search?q=chatgpt&oq=chatgpt&gl=us&hl=en&uule=w+CAIQICIWTmV3IFlvcmssVW5pdGVkIFN0YXRlcw&ie=UTF-8",
    "html_url": "https://www.searchapi.io/api/v1/searches/search_MJjKW8mR3ZGJsDjepn9redbv.html",
    "json_url": "https://www.searchapi.io/api/v1/searches/search_MJjKW8mR3ZGJsDjepn9redbv"
  },
  "search_parameters": {
    "engine": "google",
    "q": "chatgpt",
    "device": "desktop",
    "location": "New York,United States",
    "location_used": "New York,United States",
    "hl": "en",
    "gl": "us"
  },
  "search_information": {
    "query_displayed": "chatgpt",
    "total_results": 945000000,
    "time_taken_displayed": 0.29,
    "detected_location": "New York"
  },
  "knowledge_graph": {
    "kgmid": "/g/11khcfz0y2",
    "knowledge_graph_type": "Kp3 verticals",
    "title": "ChatGPT",
    "type": "Software",
    "description": "ChatGPT is a generative artificial intelligence chatbot developed by OpenAI and launched in 2022. It is based on the GPT-4o large language model.",
    "source": {
      "name": "Wikipedia",
      "link": "https://en.wikipedia.org/wiki/ChatGPT"
    },
    "initial_release_date": "November 30, 2022",
    "programming_language": "Python",
    "programming_language_links": [\
      {\
        "text": "Python",\
        "link": "https://www.google.com/search?sca_esv=853f175af13f0422&gl=us&hl=en&q=Python&si=ACC90nyvvWro6QmnyY1IfSdgk5wwjB1r8BGd_IWRjXqmKPQqmwbtPHPEcZi5JOYKaqe_iu1m4TVPotntrDVKbuXCkoFhx-K-Dp6PbewOILPFWjhDofHha-WRuSQCgY7LnBkzXtVH7pxiRdHONv3wpVsflGBg_EdTHCxOnyWt1nDgBmCjsfchXU7DKtJq159-V0-seE_cp7VV&sa=X&ved=2ahUKEwi1u_bUrLOJAxVrEFkFHaOJJaUQmxMoAHoECC4QAg"\
      }\
    ],
    "developers": "OpenAI",
    "developers_links": [\
      {\
        "text": "OpenAI",\
        "link": "https://www.google.com/search?sca_esv=853f175af13f0422&gl=us&hl=en&q=OpenAI&stick=H4sIAAAAAAAAAONgVuLVT9c3NEyqSDYzNSszW8TK5l-QmufoCQCnB8biGgAAAA&sa=X&ved=2ahUKEwi1u_bUrLOJAxVrEFkFHaOJJaUQmxMoAHoECDIQAg"\
      }\
    ],
    "engine": "GPT-4; GPT-4o; GPT-4o mini",
    "engine_links": [\
      {\
        "text": "GPT-4",\
        "link": "https://www.google.com/search?sca_esv=853f175af13f0422&gl=us&hl=en&q=GPT-4&stick=H4sIAAAAAAAAAONgVuLVT9c3NMy2TI_PNUtOX8TK6h4QomsCAKiBOxkZAAAA&sa=X&ved=2ahUKEwi1u_bUrLOJAxVrEFkFHaOJJaUQmxMoAHoECDAQAg"\
      },\
      ...\
    ],
    "license": "Proprietary",
    "platform": "Cloud computing platforms",
    "platform_links": [\
      {\
        "text": "Cloud computing",\
        "link": "https://www.google.com/search?sca_esv=853f175af13f0422&gl=us&hl=en&q=Cloud+computing&stick=H4sIAAAAAAAAAONgVuLSz9U3MKqMt8w1XsTK75yTX5qikJyfW1BakpmXDgB-4JvxIAAAAA&sa=X&ved=2ahUKEwi1u_bUrLOJAxVrEFkFHaOJJaUQmxMoAHoECDEQAg"\
      }\
    ],
    "stable_release": "August 8, 2024; 2 months ago",
    "image": "data:image/png;base64,..."
  },
  "organic_results": [\
    {\
      "position": 1,\
      "title": "Introducing ChatGPT",\
      "link": "https://openai.com/index/chatgpt/",\
      "source": "OpenAI",\
      "domain": "openai.com",\
      "displayed_link": "https://openai.com › index › chatgpt",\
      "snippet": "ChatGPT is a sibling model to InstructGPT⁠, which is trained to follow an instruction in a prompt and provide a detailed response.",\
      "snippet_highlighted_words": [\
        "ChatGPT"\
      ],\
      "date": "Nov 30, 2022",\
      "sitelinks": {\
        "inline": [\
          {\
            "title": "Introducing GPT-4o and more...",\
            "link": "https://openai.com/index/gpt-4o-and-more-tools-to-chatgpt-free/"\
          },\
          ...\
        ]\
      },\
      "favicon": "data:image/png;base64,..."\
    },\
    ...\
  ],
  "discussions_and_forums": [\
    {\
      "title": "Is ChatGPT replacing Google for \"basic, quick searches\"",\
      "link": "https://www.reddit.com/r/ChatGPT/comments/1ge133w/is_chatgpt_replacing_google_for_basic_quick/",\
      "source": "Reddit",\
      "date": "21h ago",\
      "posts": "190+ comments",\
      "community": "r/ChatGPT",\
      "favicon": "data:image/png;base64,..."\
    },\
    ...\
  ],
  "inline_videos": [\
    {\
      "position": 1,\
      "title": "3 ChatGPT Prompt Engineering Hacks You NEED to Start Using",\
      "link": "https://www.youtube.com/watch?v=Xkrfm1VfETA",\
      "source": "YouTube",\
      "channel": "Nick Saraev",\
      "date": "1 day ago",\
      "length": "40:16",\
      "image": "data:image/jpeg;base64,..."\
    },\
    ...\
  ],
  "related_searches": [\
    {\
      "query": "ChatGPT login",\
      "link": "https://www.google.com/search?sca_esv=853f175af13f0422&gl=us&hl=en&q=ChatGPT+login&sa=X&ved=2ahUKEwi1u_bUrLOJAxVrEFkFHaOJJaUQ1QJ6BAhHEAE"\
    },\
    ...\
  ],
  "pagination": {
    "current": 1,
    "next": "https://www.google.com/search?q=chatgpt&oq=chatgpt&gl=us&hl=en&start=10&uule=w+CAIQICIWTmV3IFlvcmssVW5pdGVkIFN0YXRlcw&ie=UTF-8"
  }
}
```

### [Knowledge Graph - Local business entity](https://www.searchapi.io/docs/google\#api-examples-knowledge-graph-local-business-entity)

![Knowledge Graph - Local business entity](https://www.searchapi.io/assets/docs/google/knowledge_graph/local_business-8b18d0f7a31cc9b984f2b99f449fc9a45e8456ca4779555ef47004de6fda0e39.png)

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
  "engine": "google",
  "q": "Per Se",
  "location": "New York"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "knowledge_graph": {
    "kgmid": "/m/0cqv8y",
    "knowledge_graph_type": "Local nav",
    "title": "Per Se",
    "type": "French restaurant",
    "rating": 4.6,
    "reviews": 1486,
    "price": "$$$$",
    "price_description": "Very expensive",
    "website": "https://www.thomaskeller.com/perseny",
    "directions": "https://www.google.com/maps/dir//Per+Se/data=!4m6!4m5!1m1!4e2!1m2!1m1!1s0x89c258f62fec73a7:0x5e24118dffac8a65?sa=X&hl=en&gl=us",
    "description": "Chef Thomas Keller's New American restaurant offers luxe fixed-price menus, with Central Park views.",
    "service_options": [\
      "Dine-in",\
      "No takeout",\
      "No delivery"\
    ],
    "address": "Address: 10 Columbus Cir, New York, NY 10019",
    "menu": {
      "text": "thomaskeller.com",
      "link": "http://www.thomaskeller.com/new-york-new-york/per-se/todays-menus"
    },
    "phone": "(212) 823-9335",
    "hours": "Closed ⋅ Opens 4:30 PM",
    "open_hours": [\
      {\
        "name": "Monday",\
        "value": "4:30–8:30 PM"\
      },\
      {\
        "name": "Tuesday",\
        "value": "4:30–8:30 PM"\
      },\
      ...\
    ],
    "popular_times": {
      "live": {
        "time": "7 PM",
        "info": "Usually a little busy",
        "typical_time_spent": "3 hours"
      },
      "chart": {
        "monday": [\
          {\
            "time": "6 AM",\
            "busyness_score": 0\
          },\
          {\
            "time": "7 AM",\
            "busyness_score": 0\
          },\
          ...\
        ],
        "tuesday": [\
          {\
            "time": "6 AM",\
            "busyness_score": 0\
          },\
          ...\
        ],
        ...
      }
    },
    "web_reviews": [\
      {\
        "title": "Tock",\
        "link": "https://www.exploretock.com/perse",\
        "rating_text": "5/5",\
        "rating": 5,\
        "rating_out_of": 5,\
        "reviews": 3\
      },\
      {\
        "title": "Facebook",\
        "link": "https://www.facebook.com/perse/",\
        "rating_text": "4.4/5",\
        "rating": 4.4,\
        "rating_out_of": 5,\
        "reviews": 1780\
      }\
    ],
    "user_reviews": [\
      {\
        "review": "\"Food is fab, staff and sooo nice, ambience is great.\"",\
        "review_highlighted_words": [\
          "Food",\
          "staff",\
          "ambience"\
        ],\
        "link": "https://www.google.com/maps/reviews/data=!4m5!14m4!1m3!1m2!1s102716194924360569862!2s0x89c258f62fec73a7:0x5e24118dffac8a65?sa=X&ved=2ahUKEwjktb6kgaz_AhVVMDQIHSHSCKAQv_QBegQIOxAY",\
        "rating": 5,\
        "user": {\
          "name": "Candice Regan",\
          "link": "https://www.google.com/maps/contrib/102716194924360569862?hl=en-US&sa=X&ved=2ahUKEwjktb6kgaz_AhVVMDQIHSHSCKAQwPQBegQIOxAX",\
          "image": "https://lh3.googleusercontent.com/a-/AD_cMMRqq79sdk9gAVZ4s74ntH1izFCReMxjmxpsIIvk=s40-w40-c-h40-rp-br100"\
        }\
      },\
      ...\
    ],
    "merchant_description": {
      "title": "From Per Se",
      "description": "\"Opened in 2004, Per Se is Thomas Keller’s acclaimed interpretation of The French Laundry in the Deutsche Bank Center at Columbus Circle. Designed by Adam D. Tihany, Per Se features a serene, intimate environment with spectacular views of Central Park and Columbus Circle. The restaurant is Chef Keller’s second three-Michelin-starred property featuring a nine-course tasting menu and a nine-course vegetable tasting menu using classic French technique and the finest quality ingredients available.\""
    },
    "profiles": [\
      {\
        "name": "Facebook",\
        "link": "https://www.facebook.com/perse/",\
        "image": "https://ssl.gstatic.com/kpui/social/fb_32x32.png"\
      },\
      {\
        "name": "Twitter",\
        "link": "https://twitter.com/PerSeNY",\
        "image": "https://ssl.gstatic.com/kpui/social/twitter_32x32.png"\
      }\
    ],
    "people_also_search_for": [\
      {\
        "name": "The French Laundry",\
        "link": "https://www.google.com/search?gl=us&hl=en&q=The+French+Laundry&si=AMnBZoEofOODruSEFWFjdccePwMH96ZlZt3bOiKSR9t4pqlu2Io8U409OpXl_4GpdPTC9qqss9W3vCsNmFVd37Zsm6OsH6wK8vYB02hWw9LZM6S0IYnPo3orvFKmRgYFZ0zowjZejw7Nikl_JUkG3hR6zP3lgWxr3oHBE4K3Hs7Ownsap4cUEk7nfgH9BldXNTebs9Re2hOACSTbcsAM4G7pOiyJ41hMMKqoBOlVOCCN-vLCYsba8wF4YPmssiWO4mWFcVO2x-cbCBTigXAatrKBD4503VJac29tkjizkYMBwaM8s65HfRI%3D&sa=X&ved=2ahUKEwjktb6kgaz_AhVVMDQIHSHSCKAQxA16BAg_EAU",\
        "image": "https://lh5.googleusercontent.com/p/AF1QipN14YYdAyS-Vsl5VXIhJut3c58mUfH8g8jlKV3J=w128-h72-k-no"\
      },\
      ...\
    ],
    "people_also_search_for_link": "https://www.google.com/search?gl=us&hl=en&q=Per+Se+(restaurant)&stick=H4sIAAAAAAAAAONgFuLUz9U3SC4ss6hUQjC1BIMzU1LLEyuL_VIrSoJLUguKF7EKB6QWKQSnKmgUpRaXJJYWJeaVaO5gZQQAcoYaeEQAAAA&sa=X&ved=2ahUKEwjktb6kgaz_AhVVMDQIHSHSCKAQMSgAegQIPxAB",
    "local_map": {
      "link": "https://www.google.com/maps/place/Per+Se/@40.7682178,-73.9828988,15z/data=!4m2!3m1!1s0x0:0x5e24118dffac8a65?sa=X&hl=en&gl=us",
      "gps_coordinates": {
        "latitude": 40.7682178,
        "longitude": -73.9828988,
        "altitude": 15
      },
      "image": "https://www.google.com/maps/vt/data=RJUTeny-RkqHtSWni3WUQut6_YJTA5P3d-hVCmOqa9mA2r8eJ_Uawm6Y01NaNhABeOPuWGDh3xWA5yIVKDRPHMpkrpXPOA9zI7CoNaLk6iij9Nic0IjEMgqPvm06-C3BhRZogInzhNuBr0ic4bhiPPV0vK7TlQdgiwWHCEYvFrRgPI_G5nq6JGFym4ar6mI"
    },
    "images": [\
      "data:image/jpeg;base64,...",\
      "data:image/jpeg;base64,...",\
    ],
    "ludocid": "6783566240304368229"
  }
}
```

### [Knowledge Graph - Shopping entity](https://www.searchapi.io/docs/google\#api-examples-knowledge-graph-shopping-entity)

![Knowledge Graph - Shopping entity](https://www.searchapi.io/assets/docs/google/knowledge_graph/shopping-6c0690f19aac57d8ee45da824e9f2d399151114f6cfe9eaadcca991cf1fce2a3.png)

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
  "engine": "google",
  "q": "Iphone 14",
  "location": "New York"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "knowledge_graph": {
    "kgmid": "/g/11vhqwpgql",
    "knowledge_graph_type": "Shopping entity",
    "title": "Apple iPhone 15 Pro Max",
    "rating": 4.6,
    "reviews": 29000,
    "description": "Apple iPhone 15 Pro Max is designed with aerospace-grade titanium that's strong yet lightweight...",
    "manufacturer": {
      "title": "iPhone 15 Pro Max",
      "link": "https://support.apple.com/guide/iphone/iphone-15-pro-max-iph32f348188/ios",
      "name": "support.apple.com",
      "type": "Manufacturer"
    },
    "typical_prices": {
      "currency": "USD",
      "min": 950,
      "max": 1777
    },
    "offers": [\
      {\
        "name": "Apple iPhone 15 Pro Max - Black Titanium - 256GB | Metro by T-Mobile (with plan)",\
        "link": "https://www.metrobyt-mobile.com/cell-phone/apple-iphone-15-pro-max?sku=195949050299",\
        "price": "$1,099.99",\
        "extracted_price": 1099.99,\
        "delivery_price": "Free delivery Feb 7 – 11",\
        "extracted_delivery_price": 0,\
        "tax_price": "$69.85",\
        "extracted_tax_price": 69.85,\
        "total_price": "$1,169.84",\
        "extracted_total_price": 1169.84,\
        "details": ["Free delivery Feb 7 – 11", "Contact for nearby availability", "14.5 mi"],\
        "stock_information": "In stock online",\
        "merchant": {\
          "name": "Metro by T-Mobile"\
        }\
      },\
      ...\
    ],
    "features": [\
      {\
        "name": "Screen Size",\
        "value": "6.7″"\
      },\
      ...\
    ],
    "details": {
      "description": "Apple iPhone 15 Pro Max is designed with aerospace-grade titanium that's strong yet lightweight...",
      "specifications": [\
        {\
          "attributes": [\
            {\
              "name": "Screen Size",\
              "value": "6.7″"\
            },\
            ...\
          ]\
        },\
        {\
          "category": "Display",\
          "attributes": [\
            {\
              "name": "Display Technology",\
              "value": "Retina"\
            },\
            ...\
          ]\
        },\
        ...\
      ]
    },
    "web_reviews": [\
      {\
        "title": "CNET",\
        "link": "https://www.cnet.com/tech/mobile/apple-iphone-15-pro-and-15-pro-max-review-love-at-first-zoom/",\
        "rating_text": "9.2/10",\
        "rating": 9.2,\
        "rating_out_of": 10\
      },\
      ...\
    ],
    "product_reviews": {
      "rating": 4.6,
      "reviews": 28587,
      "reviews_histogram": {
        "1": "7%",
        "2": "2%",
        "3": "3%",
        "4": "6%",
        "5": "84%"
      },
      "top_review": {
        "review": "I had been an Anti-iPhone Apple hater my whole life. Recently, I had switched everything I own from Android to Apple, own multiple Mac products and have made the decision that I will not be going back...",
        "date": "7 months ago",
        "rating": 5,
        "source": "57 months ago",
        "user": {
          "name": "JRai",
          "image": "data:image/png;base64,..."
        }
      }
    },
    "editorial_reviews": [\
      ...\
      {\
        "title": "CNET",\
        "rating_text": "9.2/10",\
        "rating": 9.2,\
        "rating_out_of": 10,\
        "review": "Apple's iPhone 15 Pro and 15 Pro Max are defined by their refinements: a lighter body made from titanium, a USB-C port for charging and fast data transfers, a… More",\
        "link": "https://www.cnet.com/tech/mobile/apple-iphone-15-pro-and-15-pro-max-review-love-at-first-zoom/",\
        "favicon": "data:image/png;base64,..."\
      }\
    ],
    "images": [\
      "data:image/webp;base64,...",\
      ...\
    ]
  }
}
```

### [AI Overview](https://www.searchapi.io/docs/google\#api-examples-ai-overview)

![AI Overview](https://www.searchapi.io/assets/docs/google/ai_overview-4c7948c5f39df130b18f980fb788dc0ea553aa665fa6687b55e67c25d700ee8c.png)

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
  "engine": "google",
  "q": "Most popular programming language?",
  "location": "New York,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "ai_overview": {
    "text_blocks": [\
      {\
        "type": "paragraph",\
        "link": "https://www.google.com/search?sca_esv=896bc82726dbc1e3&gl=us&hl=en&q=machine+learning&sa=X&ved=2ahUKEwiyl5rhqZSNAxXJk4kEHYQeMPYQxccNegQICBAB",\
        "answer": "The most popular programming language in 2025 is Python. It has surpassed JavaScript as the top language on GitHub and is widely used in fields like machine learning, data science, and scientific computing. Python's popularity is driven by its relatively simple and readable syntax, making it accessible for both beginners and experienced programmers.",\
        "reference_indexes": [1, 6],\
        "thumbnail": "data:image/png;base64..."\
      },\
      {\
        "type": "paragraph",\
        "answer": "Here's a more detailed look at the top programming languages and their popularity:"\
      },\
      {\
        "type": "unordered_list",\
        "items": [\
          {\
            "type": "paragraph",\
            "link": "https://www.google.com/search?sca_esv=896bc82726dbc1e3&gl=us&hl=en&q=Python&sa=X&ved=2ahUKEwiyl5rhqZSNAxXJk4kEHYQeMPYQ4eYNegQICRAD",\
            "answer": "Python: Continues to be the leading language, particularly in areas like AI and data science, due to its ease of use and powerful libraries.",\
            "reference_indexes": [2, 6]\
          },\
          ...\
        ]\
      }\
    ],
    "markdown": "The most popular programming language in 2025 is Python. It has surpassed JavaScript as the top language on GitHub and is widely used in fields like machine learning, data science, and scientific computing. Python's popularity is driven by its relatively simple and readable syntax, making it accessible for both beginners and experienced programmers.[1][6]...",
    "reference_links": [\
      {\
        "index": 0,\
        "title": "Most used languages among software developers globally 2024 - Statista",\
        "link": "https://www.statista.com/statistics/793628/worldwide-developer-survey-most-used-languages/",\
        "snippet": "Feb 6, 2025",\
        "source": "Statista"\
      },\
      {\
        "index": 1,\
        "title": "PYPL PopularitY of Programming Language index",\
        "link": "https://pypl.github.io/",\
        "source": "PYPL PopularitY of Programming Language"\
      },\
      ...\
    ]
  }
}
```

### [Answer Box - Organic Result](https://www.searchapi.io/docs/google\#api-examples-answer-box-organic-result)

![Answer Box - Organic Result](https://www.searchapi.io/assets/docs/google/answer_box/organic_result-08cf8a5b33c896b0c1cd031f0c2e832e673302629a4e7f040fc4a01c86bb846b.png)

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
  "engine": "google",
  "q": "Why do we have seasons?",
  "location": "New York,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "answer_box": {
    "type": "organic_result",
    "answer": "The earth's spin axis is tilted with respect to its orbital plane",
    "snippet": "The earth's spin axis is tilted with respect to its orbital plane. This is what causes the seasons. When the earth's axis points towards the sun, it is summer for that hemisphere. When the earth's axis points away, winter can be expected.",
    "organic_result": {
      "title": "Why Do We Have Seasons? - National Weather Service",
      "link": "https://www.weather.gov/lmk/seasons#:~:text=The%20earth's%20spin%20axis%20is,away%2C%20winter%20can%20be%20expected.",
      "source": "National Weather Service (.gov)",
      "domain": "www.weather.gov",
      "displayed_link": "https://www.weather.gov › lmk › seasons",
      "favicon": "data:image/png;base64,..."
    },
    "thumbnail": "data:image/png;base64,..."
  }
}
```

### [Sports Results](https://www.searchapi.io/docs/google\#api-examples-sports-results)

![Sports Results](https://www.searchapi.io/assets/docs/google/sports_results-2d3e326008c6cd82cebe4a20bd477c7e7cabde0a14e960e13b70000e06b0891d.png)

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
  "engine": "google",
  "q": "Los Angeles Lakers last game",
  "location": "Los Angeles,California"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "sports_results": {
    "type": "team_sport",
    "title": "Los Angeles Lakers",
    "subtitle": "10th in Western Conference",
    "game_spotlight": {
      "league": "NBA",
      "date": "Sun, Jan 7",
      "time": "6:30 PM",
      "stadium": "Crypto.com Arena",
      "city": "Los Angeles",
      "status": "Final",
      "videos": [\
        {\
          "title": "Game recap",\
          "link": "https://www.youtube.com/watch?v=q6ell3acNp0&feature=onebox",\
          "length": "9:49"\
        },\
        {\
          "title": "Game recap",\
          "link": "https://nba-stories.com/webstories/64d27df3-c053-aac9-f95c-3a0fd085df45.html?x-storyteller-api-key=c23993ee-0229-4b3b-aaa7-5f024cff56f5"\
        }\
      ],
      "teams": [\
        {\
          "name": "LA Clippers",\
          "stats": {\
            "wins": 22,\
            "losses": 13\
          },\
          "score": "103"\
        },\
        {\
          "name": "Los Angeles Lakers",\
          "stats": {\
            "wins": 18,\
            "losses": 19\
          },\
          "score": "106"\
        }\
      ],
      "score_table": {
        "headers": ["Team", "1", "2", "3", "4", "T"],
        "rows": [\
          ["LA Clippers", "24", "29", "24", "26", "103"],\
          ["Los Angeles Lakers", "19", "30", "32", "25", "106"]\
        ]
      }
    }
  }
}
```

### [Answer Box - Open Hours](https://www.searchapi.io/docs/google\#api-examples-answer-box-open-hours)

![Answer Box - Open Hours](https://www.searchapi.io/assets/docs/google/answer_box/open_hours-be6b7c519653c0506c1e9b3448fe32ba79fcfaadda2e3d1d1041bfb4da6d6876.png)

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
  "engine": "google",
  "q": "Central Park Zoo opening hours",
  "location": "New York,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "answer_box": {
    "type": "open_hours",
    "answer": "Central Park Zoo, Monday hours\n- 10 AM–4:30 PM\n\nCentral Park Zoo:\n- Monday: 10 AM–4:30 PM\n- Tuesday: 10 AM–4:30 PM\n- Wednesday: 10 AM–4:30 PM\n- Thursday: 10 AM–4:30 PM\n- Friday: 10 AM–4:30 PM\n- Saturday: 10 AM–4:30 PM\n- Sunday: 10 AM–4:30 PM",
    "title": "Central Park Zoo",
    "time": "10 AM–4:30 PM",
    "description": "Central Park Zoo, Wednesday hours",
    "open_hours": [\
      {\
        "title": "Central Park Zoo",\
        "items": [\
          {\
            "day": "Wednesday",\
            "time": "10 AM–4:30 PM"\
          },\
          ...\
        ]\
      }\
    ]
  }
}
```

### [Answer Box - Population Graph](https://www.searchapi.io/docs/google\#api-examples-answer-box-population-graph)

![Answer Box - Population Graph](https://www.searchapi.io/assets/docs/google/answer_box/population_graph-b02e2b69a56ee0bf6642a2cef22dc0ebccc63ad8314839d1f2251cfedbbfee80.png)

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
  "engine": "google",
  "q": "How many people are in US?"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "answer_box": {
    "type": "population_graph",
    "place": "United States",
    "answer": "331.9 million (2021)",
    "population": "331.9 million",
    "year": 2021,
    "others": [\
      {\
        "place": "Russia",\
        "population": "143.4 million‌",\
        "link": "https://www.google.com/search?sca_esv=580163193&gl=us&hl=en&q=russia+population&stick=H4sIAAAAAAAAAOPgUeLQz9U3MEvKq9IyTEm20s9JTU9MrrTKyU9OLMnMz4svLgHSxSWZyYk58UWp6SChgvyC0hywbBejHRcnSL9lsnm5gRAFBiRZGsQXkWWALRfcB2ToX8QqWFRaXJyZqIAQAwAj5U1EFQEAAA&sa=X&ved=2ahUKEwj1w5rcpbKCAxUDtlYBHTxBAqgQth96BAgpEAM"\
      },\
      {\
        "place": "Mexico",\
        "population": "126.7 million‌",\
        "link": "https://www.google.com/search?sca_esv=580163193&gl=us&hl=en&q=mexico+population&stick=H4sIAAAAAAAAAOPgUeLUz9U3SLI0iC_SMkxJttLPSU1PTK60yslPTizJzM-LLy4B0sUlmcmJOfFFqekgoYL8gtIcsGwXox0X2ADLZPNyAyEKDAC7gCwDbLk4QAaYJeVVkaF_EatgbmpFZnK-AkIMAJCs37kWAQAA&sa=X&ved=2ahUKEwj1w5rcpbKCAxUDtlYBHTxBAqgQth96BAgpEAQ"\
      }\
    ],
    "sources": [\
      {\
        "text": "United States Census Bureau",\
        "link": "https://www.census.gov/glossary/#term_Populationestimates"\
      },\
      {\
        "text": "World Bank",\
        "link": "http://datatopics.worldbank.org/world-development-indicators"\
      }\
    ],
    "explore_more_link": "https://datacommons.org/place?utm_medium=explore&dcid=country/USA&mprop=count&popt=Person&hl=en"
  }
}
```

### [Answer Box - Finance Results](https://www.searchapi.io/docs/google\#api-examples-answer-box-finance-results)

![Answer Box - Finance Results](https://www.searchapi.io/assets/docs/google/answer_box/finance-ca97c513a499aba76e2d13b29dfad3b25ba95029cc5410a65d13c567b83e915b.png)

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
  "engine": "google",
  "q": "XAUUSD price"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "answer_box": {
    "type": "finance_results",
    "title": "Gold Futures",
    "answer": "Gold Futures (Stock: GCW00, Exchange: COMEX)\nCurrent Price: 2046.9 USD\nPrevious Close: 2042.2 USD\nPrice Change: 4.7 (0.23%) since previous close\nMarket Status: Pre-market price  as of Dec 5, 8:28 AM EST\n\nMarket Details:\nOpen: 2,049.00, High: 2,059.60, Low: 2,039.60, Prev close: 2,042.20, Volume: 84,138, Open interest: 401,541\n",
    "exchange": "COMEX",
    "stock": "GCW00",
    "price": 2046.9,
    "currency": "USD",
    "previous_close": 2042.2,
    "price_change": {
      "amount": 4.7,
      "percentage": 0.23,
      "period": "today",
      "is_up": true
    },
    "market": {
      "date": "Dec 5, 8:28 AM EST"
    },
    "market_table": [\
      {\
        "name": "Open",\
        "value": 2049\
      },\
      {\
        "name": "High",\
        "value": 2059.6\
      },\
      {\
        "name": "Low",\
        "value": 2039.6\
      },\
      {\
        "name": "Prev close",\
        "value": 2042.2\
      },\
      {\
        "name": "Volume",\
        "value": 84.138\
      },\
      {\
        "name": "Open interest",\
        "value": 401.541\
      }\
    ]
  }
}
```

### [Answer Box - Currency Converter](https://www.searchapi.io/docs/google\#api-examples-answer-box-currency-converter)

![Answer Box - Currency Converter](https://www.searchapi.io/assets/docs/google/answer_box/currency_converter-4c38e5da22e673f0d8737b86124275c189215f39c7d3e2e6384f56bf2c894d1a.png)

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
  "engine": "google",
  "q": "usd to eur"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "answer_box": {
    "type": "currency_converter",
    "answer": "1 United States Dollar equals 0.92 Euro (Nov 20, 1:56 PM UTC)",
    "price": 0.92,
    "currency": "Euro",
    "date": "Nov 20, 1:56 PM UTC",
    "from": {
      "price": 1,
      "currency": "United States Dollar"
    },
    "to": {
      "price": 0.92,
      "currency": "Euro"
    },
    "chart": [\
      {\
        "price": 0.94325,\
        "datetime": "2023-10-20T23:58:00Z",\
        "unix_date": 1697846280\
      },\
      {\
        "price": 0.94325,\
        "datetime": "2023-10-21T23:58:00Z",\
        "unix_date": 1697932680\
      },\
      ...\
    ]
  }
}
```

### [Answer Box - Local Time](https://www.searchapi.io/docs/google\#api-examples-answer-box-local-time)

![Answer Box - Local Time](https://www.searchapi.io/assets/docs/google/answer_box/local_time-dc24b73390a5d7b7656161f48fbd0da054e92b1fc4fd74624771aa7bfa33584d.png)

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
  "engine": "google",
  "q": "current date",
  "location": "New York,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "answer_box": {
    "type": "local_time",
    "answer": "Friday, November 10, 2023 (Date in New York County, NY)",
    "local_time": "Friday, November 10, 2023",
    "location": "Date in New York County, NY"
  }
}
```

### [Answer Box - Location](https://www.searchapi.io/docs/google\#api-examples-answer-box-location)

![Answer Box - Location](https://www.searchapi.io/assets/docs/google/answer_box/location-bd184e9ef4cef063864209e3da517492f6f2be5e8ebccc332625983f0e639522.png)

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
  "engine": "google",
  "q": "Where is dehiwala zoo located?",
  "location": "Colombo, Sri Lanka"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "answer_box": {
    "type": "location",
    "answer": "120 Galvihara Rd, Dehiwala-Mount Lavinia, Sri Lanka",
    "landmark": "Dehiwala Zoological Gardens, Address"
  }
}
```

### [Train Results](https://www.searchapi.io/docs/google\#api-examples-train-results)

![Train Results](https://www.searchapi.io/assets/docs/google/train_results-2085221cc10b7a1d28afd83873833bc28202c48de362915f0936bdf2d699fad5.png)

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
  "engine": "google",
  "q": "trains from London to Manchester",
  "gl": "uk"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "train_results": {
    "origin": "London",
    "destination": "Manchester",
    "date": "2026-09-02",
    "trains": [\
      {\
        "position": 1,\
        "time_window": {\
          "depart_at": "00:39",\
          "depart_at_iso": "2026-09-02T00:39:00+01:00",\
          "arrive_at": "07:43",\
          "arrive_at_iso": "2026-09-02T07:43:00+01:00"\
        },\
        "formatted_duration": "7h 4m",\
        "duration": 25440,\
        "transfers": 2,\
        "price": "£193",\
        "extracted_price": 193,\
        "currency": "GBP",\
        "service_provider": {\
          "name": "West Midlands Trains"\
        },\
        "buy_ticket": {\
          "price": "£193",\
          "offers": [\
            {\
              "source": "Quno",\
              "price": "£193",\
              "extracted_price": 193,\
              "currency": "GBP",\
              "link": "https://quno.com/landingPage?service_date=%5B%2220260902%22%5D&from_ticketing_stop_time_id=%5B%22EUS%22%5D&to_ticketing_stop_time_id=%5B%22MAN%22%5D",\
              "favicon": "https://www.gstatic.com/transport/partners/svg_light/silverrail_quno.svg"\
            },\
            ...\
          ]\
        },\
        "instructions": [\
          {\
            "line": "Railway",\
            "depart_from": {\
              "place": "Euston",\
              "at": "00:39",\
              "at_iso": "2026-09-02T00:39:00+01:00",\
              "platform": "8"\
            },\
            "arrive_at": {\
              "place": "Northampton",\
              "at": "02:03",\
              "at_iso": "2026-09-02T02:03:00+01:00",\
              "platform": "3"\
            },\
            "formatted_duration": "1h 24m",\
            "duration": 5040,\
            "layover": {\
              "formatted_duration": "3h 17m",\
              "duration": 11820\
            },\
            "service_provider": {\
              "name": "West Midlands Trains",\
              "website": "https://www.westmidlandsrailway.co.uk/"\
            },\
            "stops": [\
              {\
                "place": "Harrow & Wealdstone",\
                "at": "00:52",\
                "at_iso": "2026-09-02T00:52:00+01:00"\
              },\
              ...\
            ]\
          },\
          ...\
        ]\
      },\
      ...\
    ]
  }
}
```

### [Weather Results](https://www.searchapi.io/docs/google\#api-examples-weather-results)

![Weather Results](https://www.searchapi.io/assets/docs/google/weather_results-6bfb2decf6714e8c7bedc050cb23e0084735526001970eefa8da3bcd4e47fe2b.png)

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
  "engine": "google",
  "q": "Weather in Miami"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "weather_result": {
    "temperature": {
      "fahrenheit": 73,
      "celsius": 23
    },
    "unit": "Fahrenheit",
    "precipitation": "1%",
    "humidity": "81%",
    "wind": {
      "kmh": 14,
      "mph": 9
    },
    "location": "Miami, FL",
    "date": "Wednesday 8:00 AM",
    "weather": "Sunny",
    "thumbnail": "https://ssl.gstatic.com/onebox/weather/64/sunny.png",
    "forecast": [\
      {\
        "day": "Wednesday",\
        "weather": "Mostly sunny",\
        "temperature": {\
          "high": 85,\
          "low": 73\
        },\
        "precipitation": "10%",\
        "humidity": "64%",\
        "wind": "19 mph",\
        "thumbnail": "data:image/png;base64,..."\
      },\
      ...\
    ],
    "hourly_forecast": [\
      {\
        "time": "Wednesday 8:00 AM",\
        "weather": "Sunny",\
        "temperature": "73",\
        "precipitation": "1%",\
        "humidity": "81%",\
        "wind": "9 mph"\
      },\
      ...\
    ],
    "precipitation_forecast": [\
      {\
        "precipitation": "1%",\
        "day": "Wednesday",\
        "time": "9:00 AM"\
      },\
      ...\
    ],
    "wind_forecast": [\
      {\
        "speed": "11 mph",\
        "direction": "From north",\
        "day": "Wednesday",\
        "time": "9:00 AM",\
        "angle": 74\
      },\
      ...\
    ]
  }
}
```

### [Local Results](https://www.searchapi.io/docs/google\#api-examples-local-results)

![Local Results](https://www.searchapi.io/assets/docs/google/local_results-ed3d04e11b3f7d634e7e4d5f443307385aa5494c82956615334040720c0a9735.png)

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
  "engine": "google",
  "q": "Sushi near me",
  "location": "10013,New York,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "local_map": {
    "link": "https://www.google.com/search?hl=en&gl=us&q=Sushi+near+me&npsic=0&rflfq=1&rldoc=1&rllag=40721550,-74007423,236&tbm=lcl&sa=X&ved=2ahUKEwiu98Cu8qT_AhXuFlkFHcnNBakQtgN6BAgeEAE",
    "gps_coordinates": {
      "latitude": 40.72155,
      "longitude": -74.007423,
      "altitude": 236
    },
    "thumbnail": "data:image/png;base64,..."
  },
  "local_results": [\
    {\
      "position": 1,\
      "title": "Sushi Azabu",\
      "ludocid": "745202157283138305",\
      "rating": 4.5,\
      "reviews": 351,\
      "price": "$$",\
      "price_description": "Moderately expensive",\
      "type": "Sushi",\
      "address": "428 Greenwich St",\
      "is_closed": true,\
      "service_options": [\
        "Subterranean spot for super-fresh sushi"\
      ],\
      "extensions": [\
        "Sushi Azabu",\
        "4.5(351)",\
        "$$",\
        "Sushi",\
        "428 Greenwich St",\
        "Closed",\
        "Opens 5 PM Tue",\
        "Subterranean spot for super-fresh sushi"\
      ],\
      "image": "data:image/jpeg;base64,..."\
    },\
    ...\
  ]
}
```

### [Job Results](https://www.searchapi.io/docs/google\#api-examples-job-results)

![Job Results](https://www.searchapi.io/assets/docs/google/jobs-945d5ea64abe418836ff03d989ab8ae41c6bd16602dc6d1904485e0cc2f74d4b.png)

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
  "engine": "google",
  "q": "Apple jobs",
  "location": "San Francisco Bay Area,California,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "jobs": [\
    {\
      "position": 1,\
      "title": "Applications Engineer, Safari - Apple Vision Pro",\
      "company_name": "Apple",\
      "location": "Sunnyvale, CA",\
      "via": "via Careers At Apple",\
      "description": "Summary\nPosted: Aug 9, 2024\n\nRole Number:200537915\n\nApple is where...",\
      "job_highlights": [\
        {\
          "title": "Qualifications",\
          "items": [\
            "Typically requires a minimum of 3+ years shipping iOS applications",\
            "Proficiency in a systems programming language, such as C/C++, Objective-C, Swift, etc"\
          ]\
        },\
        {\
          "title": "Benefits",\
          "items": [\
            "At Apple, base pay is one part of our total compensation package and is determined within a range",\
            "This provides the opportunity to progress as you grow and develop within a role"\
          ]\
        }\
      ],\
      "extensions": [\
        "5 days ago",\
        "Full-time",\
        "Health insurance",\
        "Dental insurance"\
      ],\
      "detected_extensions": {\
        "posted_at": "5 days ago",\
        "schedule": "Full-time",\
        "health_insurance": true,\
        "dental_insurance": true\
      },\
      "apply_link": "https://jobs.apple.com/en-us/details/200537915/applications-engineer-safari-apple-vision-pro?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",\
      "apply_links": [\
        {\
          "link": "https://jobs.apple.com/en-us/details/200537915/applications-engineer-safari-apple-vision-pro?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",\
          "source": "Careers At Apple"\
        },\
        ...\
      ],\
      "sharing_link": "https://www.google.com/search?ibp=htl;jobs&q=apple%2Bjobs&htidocid=EseHjhPd93lzesvRAAAAAA%3D%3D&hl=en-US&shndl=-1&shem=vslcea&source=sh/x/job/li/m1/1#fpstate=tldetail&htivrt=jobs&htiq=apple%2Bjobs&htidocid=EseHjhPd93lzesvRAAAAAA%3D%3D",\
      "thumbnail": "data:image/png;base64,..."\
    },\
    ...\
  ]
}
```

### [Salary Estimates](https://www.searchapi.io/docs/google\#api-examples-salary-estimates)

![Salary Estimates](https://www.searchapi.io/assets/docs/google/salary_estimates-52fadcbcb7b66662f18f1f238808580f46e213b6c37b9a89babad9fb7ac63e02.png)

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
  "engine": "google",
  "q": "Digital marketing salary miami",
  "location": "Miami,Florida,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "salary_estimates": [\
    {\
      "title": "Digital marketer",\
      "salary": {\
        "text": "$39k–120k per year",\
        "range": "$39k–120k",\
        "range_from": 39000.0,\
        "range_to": 120000.0,\
        "frequency": "per year"\
      },\
      "link": "https://www.indeed.com/career/digital-marketer/salaries/Miami--FL",\
      "location": "Miami, FL",\
      "source": "Indeed",\
      "favicon": "data:image/png;base64,..."\
    },\
    ...\
  ]
}
```

### [Shopping Ads](https://www.searchapi.io/docs/google\#api-examples-shopping-ads)

![Shopping Ads](https://www.searchapi.io/assets/docs/google/shopping_ads-3cbb4ef3ab951fa928a65be3eb1dd13c3046f515d464be0b9ec29e06506621d0.png)

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
  "engine": "google",
  "q": "MacBook",
  "location": "New York"
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
      "title": "Apple Macbook Pro 13.3In, M2 8C Cpu/10C Gpu, 8Gb, 256Gb Ssd, Space Gray, Mid 2022",\
      "seller": "Adorama",\
      "link": "http://www.google.com/shopping/product/10818728628057643970?lsf=seller:1057813,store:12938073204014769012&prds=oid:10818056173281470195&hl=en",\
      "price": "$1,299.00",\
      "extracted_price": 1299.0,\
      "order_fulfillment_method": "In store",\
      "rating": 4.8,\
      "reviews": 9000,\
      "image": "data:image/webp;base64,..."\
    },\
    ...\
  ]
}
```

### [Sponsored Tickets & Tours](https://www.searchapi.io/docs/google\#api-examples-sponsored-tickets-tours)

![Sponsored Tickets & Tours](https://www.searchapi.io/assets/docs/google/sponsored_tickets-640a820202f5591195908ee4ce42e9602bf2a1b65e26822f603d5cb8b7693dbb.png)

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
  "engine": "google",
  "q": "most popular places in las vegas",
  "location": "Las Vegas"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "sponsored_tickets": [\
    {\
      "position": 1,\
      "title": "Las Vegas: Lower Antelope Canyon and Horseshoe Bend Day Tour",\
      "link": "https://www.viator.com/las-vegas/d684",\
      "price": "$260",\
      "extracted_price": 260.0,\
      "seller": "Viator",\
      "rating": 4.9,\
      "reviews": 418,\
      "badge": "Free cancellation",\
      "image": "data:image/jpeg;base64..."\
    },\
    ...\
  ]
}
```

### [Ads](https://www.searchapi.io/docs/google\#api-examples-ads)

![Ads](https://www.searchapi.io/assets/docs/google/ads-9ded8e13b31d62d0ebcd11a3432675aa9ca547442c9bfd15ae2a4dc22f7d2597.png)

You can use the `advertiser_info_token` with our [Google Ads Advertiser Info API](https://www.searchapi.io/docs/google-ads-advertiser-info-api) to retrieve additional details about the advertiser.

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
  "engine": "google",
  "q": "VPN",
  "location": "New York"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "ads": [\
    {\
      "position": 1,\
      "block_position": "top",\
      "title": "ExpressVPN™ Official Website - Download ExpressVPN Risk-Free.",\
      "source": "ExpressVPN™",\
      "link": "https://www.expressvpn.com/go/home",\
      "domain": "www.expressvpn.com",\
      "displayed_link": "https://www.expressvpn.com",\
      "snippet": "ExpressVPN: The World's Most Trusted VPN Provider Protects All Your Devices and Platforms.",\
      "snippet_highlighted_words": [\
        "VPN"\
      ],\
      "sitelinks": {\
        "expanded": [\
          {\
            "title": "Servers in 94 Countries",\
            "snippet": "VPN Servers in 94 Countries. Get a Fast, Secure Connection.",\
            "link": "https://www.expressvpn.com/go/vpn-server"\
          },\
          {\
            "title": "What Is a VPN?",\
            "snippet": "Learn How ExpressVPN Helps You ExpressVPN: User-Friendly VPN",\
            "link": "https://www.expressvpn.com/go/what-is-vpn-1"\
          },\
          {\
            "title": "ExpressVPN for Windows",\
            "snippet": "Works on Windows 10, 8, and 7 Set up ExpressVPN for Windows",\
            "link": "https://www.expressvpn.com/go/vpn-software/vpn-windows-1"\
          }\
        ]\
      },\
      "favicon": "data:image/png;base64,...",\
      "advertiser_info_token": "QVUyaHhaMy1yTXJSTWxOS1ZDVnYyQ2lvTlpLNGlrcFctQXIwZXJWdkt3UVJfaTZYU3ByUF9LYTh4ZW1JRFlpUnlXQkxpeFdCOWdFUG44RzM4Zk5iQmd0MlpYTVVJMWRBSkdTbnFIUzYtYWpYeEhNQnRMaktuRk9Ya1dxcmZEd1psMnpHOUx6Qmg3MTlXNGRYaU4tUFhZZzJUYXNVMUV1TFZGOW5sQnpFcWpwUFBYaGhuXzl5WVZZclZwaTdVTUFuMExTVVBPbFMzZ0RJNkFtRnpVTERncDJoQlU1Nm1tRzI1NmJTUHlIb3lmTTJwY0hySHg3aTMwNUdSd3FJLVpUTzItYmM="\
    },\
    ...\
  ]
}
```

### [Local Ads](https://www.searchapi.io/docs/google\#api-examples-local-ads)

![Local Ads](https://www.searchapi.io/assets/docs/google/local_ads-ba27cf698a8aa86e9c51d030d49e4c3194a148247c030e7ed57173d69a9c3007.png)

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
  "engine": "google",
  "q": "lawyer",
  "location": "New York"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "local_ads": {
    "title": "Lawyers | New York",
    "badge": "GOOGLE SCREENED",
    "ads": [\
      {\
        "title": "Ginarte Gallardo Gonzalez & Winograd, L.L.P.",\
        "link": "https://www.google.com/localservices/prolist?g2lbs=ADZRdkvcBNrJmnKN-jG0-37dCVuT-LyN8uEfxD51qG4aYHt2SLuXSYxj4ScSd0l4mUFBXh0YLTuxs64Mb88BSykcwbLa8hG9TQ%3...",\
        "rating": 4.8,\
        "reviews": 303,\
        "extensions": [\
          "41 years in business",\
          "Serves New York",\
          "Open 24/7"\
        ],\
        "thumbnail": "https://lh3.googleusercontent.com/KqYi3bMKxkFtc64BDVWoobZC3RFu6kRIRNM2Ev3t3qzY9-iU7XFzD67b8sBs=sc0x00ffffff-w100-h100-fcrop64=1,07ba0000ff09a4ce-rj"\
      },\
      ...\
    ],
    "categories": [\
      {\
        "title": "Bankruptcy law",\
        "link": "https://www.google.com/localservices/prolist?g2lbs=ADZRdksOvsRbo7vJvFnMl9YH38oXezku9TmyPzo03vgWEv0uDRQUF_z3oStB9pJ1jQLX1rPmAxEpq7GplmKzR4ouGBjJNQTxuA%3D..."\
      },\
      {\
        "title": "Business law",\
        "link": "https://www.google.com/localservices/prolist?g2lbs=ADZRdks-TFMSdCpDKyFPPQ5CIr31xj70VUlC7WCW4i6d529xvlBfD3ej2AeWH3xG31q7r8ZmKP0o4onARe_1GIVLrgm4qS_0EQ%3D%..."\
      },\
      ...\
    ]
  }
}
```

### [Inline Shopping](https://www.searchapi.io/docs/google\#api-examples-inline-shopping)

![Inline Shopping](https://www.searchapi.io/assets/docs/google/inline_shopping-e4beffb1d69e8833ed30146f2712569e47c2dc19ec88e38c6dcf2a7da0823f95.png)

Each product carries a `product_token` that can be used with the
[Google Product API](https://www.searchapi.io/docs/google-product) and the
[Google Product Page API](https://www.searchapi.io/docs/google-product-page).


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
  "engine": "google",
  "q": "iphone 15",
  "location": "New York"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "inline_shopping": [\
    {\
      "position": 1,\
      "product_id": "5899694665380703581",\
      "title": "Apple iPhone 15",\
      "link": "https://www.google.com/search?ibp=oshop&q=iphone+15&prds=catalogid:5899694665380703581,gpcid:8053804293482199477,headlineOfferDocid:6264163870559227929,imageDocid:5295031976721632930,pvo:3,pvt:hg&gl=us&hl=en&udm=28",\
      "seller": "Amazon.com - Seller",\
      "rating": 4.6,\
      "reviews": 23000,\
      "price": "$399.99",\
      "extracted_price": 399.99,\
      "deal": "7% OFF",\
      "durability": "Refurbished",\
      "extensions": [\
        "Also nearby"\
      ],\
      "thumbnail": "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQ9LMUayJUmblHNlH0W--2pGPJt9rnl4YBmY7_8J7svsKt4ONt3TOafXTS6jYtVFnLg8t2_6b-B3JW2KzKDNwT5ebVvJbZHW4r-U6JhvOryw83M4-BnjTtV",\
      "product_token": "eyJxIjoiaXBob25lIDE1IiwiZ2wiOiJ1cyIsImhsIjoiZW4iLCJlaSI6Inl2TVRhTXpUQk9lYnZyMFA2NXp1R0EiLCJjYXRhbG9naWQiOiI1ODk5Njk0NjY1MzgwNzAzNTgxIiwiZ3BjaWQiOiI4MDUzODA0MjkzNDgyMTk5NDc3IiwiaGVhZGxpbmVPZmZlckRvY2lkIjoiNjI2NDE2Mzg3MDU1OTIyNzkyOSIsInJkcyI6IlBDXzgwNTM4MDQyOTM0ODIxOTk0Nzd8UFJPRF9QQ184MDUzODA0MjkzNDgyMTk5NDc3IiwiaW1hZ2VEb2NpZCI6IjUyOTUwMzE5NzY3MjE2MzI5MzAiLCJtaWQiOiI1NzY0NjI2ODQ3MTcxNzM3ODQiLCJwdm8iOiIzIiwicHZ0IjoiaGcifQ=="\
    },\
    {\
      "position": 2,\
      "product_id": "1006678807689670957",\
      "title": "Apple iPhone 15 Plus",\
      "link": "https://www.google.com/search?ibp=oshop&q=iphone+15&prds=catalogid:1006678807689670957,gpcid:1629698335584755936,headlineOfferDocid:5847473621243215043,imageDocid:3254563274606027332,pvo:3,pvt:hg&gl=us&hl=en&udm=28",\
      "seller": "Apple",\
      "rating": 4.6,\
      "reviews": 5600,\
      "price": "$33.30/mo",\
      "extracted_price": 33.3,\
      "installment": {\
        "months": "x 24",\
        "extracted_months": 24,\
        "cost_per_month": "$33.30/mo",\
        "extracted_cost_per_month": 33.3\
      },\
      "extensions": [\
        "Also nearby"\
      ],\
      "thumbnail": "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTuBA_gc76DFQ6VRUH2EiHghdlm2ldnbmSuk8LOYRiFWqjnFSeq5pAA8581U8c5OTJph0ricybc9qHbYO3oDpY7-AmumdUZ_KDcHuebC4TkQ98VqemAHuuYpQ",\
      "product_token": "eyJxIjoiaXBob25lIDE1IiwiZ2wiOiJ1cyIsImhsIjoiZW4iLCJlaSI6Inl2TVRhTXpUQk9lYnZyMFA2NXp1R0EiLCJjYXRhbG9naWQiOiIxMDA2Njc4ODA3Njg5NjcwOTU3IiwiZ3BjaWQiOiIxNjI5Njk4MzM1NTg0NzU1OTM2IiwiaGVhZGxpbmVPZmZlckRvY2lkIjoiNTg0NzQ3MzYyMTI0MzIxNTA0MyIsInJkcyI6IlBDXzE2Mjk2OTgzMzU1ODQ3NTU5MzZ8UFJPRF9QQ18xNjI5Njk4MzM1NTg0NzU1OTM2IiwiaW1hZ2VEb2NpZCI6IjMyNTQ1NjMyNzQ2MDYwMjczMzIiLCJtaWQiOiI1NzY0NjI0OTI3ODY2MzEwNDciLCJwdm8iOiIzIiwicHZ0IjoiaGcifQ=="\
    },\
    ...\
  ]
}
```

### [From Sources Across the Web](https://www.searchapi.io/docs/google\#api-examples-from-sources-across-the-web)

![From Sources Across the Web](https://www.searchapi.io/assets/docs/google/from_sources_across_the_web-b04b2f04a1259151f6c0e5fadca163e8cbbd701749af55f5827fbeb1f7c082be.png)

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
  "engine": "google",
  "q": "companies providing developer documentation tools"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "from_sources_across_the_web": {
    "items": [\
      {\
        "name": "Document360",\
        "thumbnail": "data:image/jpeg;base64,..."\
      },\
      {\
        "name": "README",\
        "thumbnail": "data:image/jpeg;base64,..."\
      },\
      ...\
    ]
  }
}
```

### [Discussions and Forums](https://www.searchapi.io/docs/google\#api-examples-discussions-and-forums)

![Discussions and Forums](https://www.searchapi.io/assets/docs/google/discussions_and_forums-2d7f2be43c42af55f18dbd7b5d9bf9bb2581a3c739e7804383e2f060f31d430b.png)

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
  "engine": "google",
  "q": "Mediterranean food"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "discussions_and_forums": [\
    {\
      "title": "Mediterranean restaurant recommendations?? - Sacramento",\
      "link": "https://www.reddit.com/r/Sacramento/comments/17pdufn/mediterranean_restaurant_recommendations/",\
      "source": "Reddit",\
      "date": "1 year ago",\
      "posts": "50+ comments",\
      "community": "r/Sacramento",\
      "favicon": "data:image/png;base64,...",\
      "answers": [\
        {\
          "snippet": "Kasbah Lounge is fantastic. The fattoush salad is one my favorite salads.",\
          "link": "https://www.reddit.com/r/Sacramento/comments/17pdufn/mediterranean_restaurant_recommendations/k86cbmx/",\
          "is_top_answer": true,\
          "extensions": [\
            "Top answer",\
            "18 votes",\
            "a year ago"\
          ]\
        },\
        {\
          "snippet": "Kabob house on Fulton. Tiny little place that looks to be family owned, and the food is amazing.",\
          "link": "https://www.reddit.com/r/Sacramento/comments/17pdufn/mediterranean_restaurant_recommendations/k84o4gh/",\
          "extensions": [\
            "17 votes",\
            "a year ago"\
          ]\
        },\
        ...\
      ]\
    },\
    ...\
  ]
}
```

### [Related Questions](https://www.searchapi.io/docs/google\#api-examples-related-questions)

![Related Questions](https://www.searchapi.io/assets/docs/google/google_related_questions-cf0013f54e115319db833520a141bb3d03b919511a35da0e86b13e72fd30ef72.png)

Google loads the answer for questions marked `is_ai_overview: true` asynchronously, so the search results page carries the question but not its answer. Those questions return an `error` and a `page_token` in place of `markdown`, `text_blocks`, and `reference_links`. Pass the `page_token` to the [Google AI Overview API](https://www.searchapi.io/docs/google-ai-overview-api) to fetch that question's answer.


The `next_page_token` on each question expands further related questions through the
[Google Related Questions API](https://www.searchapi.io/docs/google-related-questions-api), not the answer to the question it came from.


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
  "engine": "google",
  "q": "chatgpt"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "related_questions": [\
    {\
      "question": "Is ChatGPT safe to use?",\
      "answer": "When it comes to the safety of its answers, OpenAI has openly admitted that ChatGPT can produce biased and potentially harmful answers, but hopes to mitigate against this issue by encouraging users to give feedback.",\
      "answer_highlight": "ChatGPT can produce biased and potentially harmful answers",\
      "date": "1 day ago",\
      "source": {\
        "title": "What is ChatGPT, is it safe to use and how to delete your data from it",\
        "link": "https://www.walesonline.co.uk/news/uk-news/what-chatgpt-safe-use-how-26926213#:~:text=When%20it%20comes%20to%20the,encouraging%20users%20to%20give%20feedback.",\
        "domain": "www.walesonline.co.uk",\
        "displayed_link": "https://www.walesonline.co.uk › news › uk-news › what-...",\
        "favicon": "data:image/png;base64,..."\
      },\
      "search": {\
        "title": "Search for: Is ChatGPT safe to use?",\
        "link": "https://www.google.com/search?hl=en&gl=us&q=Is+ChatGPT+safe+to+use%3F&sa=X&ved=2ahUKEwjKjPLS0vz-AhWlATQIHVL6ARsQzmd6BAghEAY"\
      }\
    },\
    ...\
  ]
}
```

### [Questions and Answers](https://www.searchapi.io/docs/google\#api-examples-questions-and-answers)

![Questions and Answers](https://www.searchapi.io/assets/docs/google/questions_and_answers-cc41edb1c08e9d55fcbc9c70e34ff8591e8b7e62790f5e0f3cb452ed8564fb33.png)

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
  "engine": "google",
  "q": "Why do we only see one side of the moon?"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "questions_and_answers": [\
    {\
      "question": "Why is that we only see one side of the moon?",\
      "answer": "The short answer is that the Moon rotates on its axis exactly once for every time it orbits the Earth. When it has travelled half way around its orbit, it has also rotated half way, so it still shows us the same side. The mechanism that has caused this is a process called tidal locking, which is a complicated interaction between the gravity of Earth pulling on the Moon and slowing its rotation until it matched the period of its orbit.",\
      "link": "https://www.reddit.com/r/askscience/comments/166wpj1/why_is_that_we_only_see_one_side_of_the_moon/",\
      "votes": 890,\
      "source": "Reddit"\
    },\
    ...\
  ]
}
```

### [Explore Brands](https://www.searchapi.io/docs/google\#api-examples-explore-brands)

![Explore Brands](https://www.searchapi.io/assets/docs/google/explore_brands-fe2f5ae607ebd0cafc130dcd25cf6210fe7c8c13fcaec4a71aff68586a4bbe49.png)

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
  "engine": "google",
  "q": "Coffee"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "explore_brands": [\
    {\
      "title": "Stumptown Coffee Roasters",\
      "link": "https://www.stumptowncoffee.com/collections/coffee",\
      "snippet": "Shop Stumptown for single-origin coffee beans and unique blends. Roasted daily. Visit our site to see all of the coffee, espresso, and gift options.",\
      "favicon": "data:image/png;base64...",\
      "thumbnail": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRIR1S5JJsIouRNVKh_P1eLIqLIWjBxaty6W-ixvmbeZM-mVBm3e_AlRHldKr6bmBz2_eot75Ab"\
    },\
    {\
      "title": "Death Wish Coffee Company",\
      "link": "https://www.deathwishcoffee.com/",\
      "snippet": "Live with a Death Wish. Death Wish Coffee Company delivers a bold, full-bodied yet flavorful brew that will awaken your taste buds, with an extra kick of ...",\
      "merchant": {\
        "rating": 4.9,\
        "reviews": 2900,\
        "link": "https://www.google.com/shopping/ratings/merchant/immersivedetails?q=deathwishcoffee.com&c=US&v=19",\
        "badge": "Trending seller"\
      },\
      "favicon": "data:image/png;base64...",\
      "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjobj9wNrIKNUc5rN8ZaKy7MvLnjtCG6jNf1ccbsu3Y4pfPHlXlhdD-FGoQq4"\
    },\
    ...\
  ]
}
```

### [About This Result](https://www.searchapi.io/docs/google\#api-examples-about-this-result)

![About This Result](https://www.searchapi.io/assets/docs/google/about_this_result-b4823d7649fd94e4692c1ea139c486ffcf741bca92bc75821d0ce4348d1eb411.png)

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
  "engine": "google",
  "q": "LangChain.com"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "ai_overview": {
    "text_blocks": [\
      {\
        "type": "header",\
        "answer": "Airbnb"\
      },\
      {\
        "type": "paragraph",\
        "answer": "Vacation rental company"\
      },\
      {\
        "type": "paragraph",\
        "answer": "Founded in San Francisco in 2007 by Brian Chesky, Joe Gebbia, and Nathan Blecharczyk, Airbnb, Inc. is an American company operating a global online marketplace for short- and long-term homestays and experiences."\
      }\
    ],
    "reference_links": [\
      {\
        "index": 0,\
        "title": "How Airbnb Works for Hosts, Guests, and the Company Itself",\
        "link": "https://www.investopedia.com/articles/personal-finance/032814/pros-and-cons-using-airbnb.asp",\
        "source": "Investopedia",\
        "snippet": "Hosts make money by establishing a profile on the Airbnb platform and renting their spaces to guests.",\
        "thumbnail": "data:image/png;base64,..."\
      }\
    ],
    "markdown": "## Airbnb\n\nFounded in San Francisco in 2007..."
  }
}
```

### [About This Domain](https://www.searchapi.io/docs/google\#api-examples-about-this-domain)

![About This Domain](https://www.searchapi.io/assets/docs/google/about_this_domain-6837b5180a32ced45fca76cd79c5445890806990d73078f4a038573c1631ba73.png)

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
  "engine": "google",
  "q": "Colbeck Capital"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "about_this_domain": {
    "title": "About colbeck.com",
    "description": "Founded in 2009 by Jason Colodne and Jason Beckman, Colbeck Capital Management is a New York-based private credit firm specializing in strategic middle-market lending. The firm provides capital solutions to transitioning companies and has raised significant funding, including $700 million for its Colbeck Strategic Lending III fund, totaling $3 billion in invested and committed capital. Its principals have experience from institutions like Goldman Sachs. Colbeck Capital also supports various arts, children's, and healthcare charities.",
    "reference_links": [\
      {\
        "index": 0,\
        "title": "Colbeck Capital Reportedly Secures $700M For Vintage Strategic Lending Fund",\
        "link": "https://www.crowdfundinsider.com/2025/01/235389-colbeck-capital-reportedly-secures-700m-for-vintage-...",\
        "source": "Crowdfund Insider",\
        "snippet": "The Fund received support from existing Colbeck clients and new investor relationships globally, including “public and private pensions, insurance companies,...",\
        "favicon": "data:image/png;base64,iVBORw0KGgoAA..."\
      },\
      "..."\
    ]
  }
}
```

### [Things to Do](https://www.searchapi.io/docs/google\#api-examples-things-to-do)

![Things to Do](https://www.searchapi.io/assets/docs/google/things_to_do-028bbb49aa6c9a1e1f378e7f23b5350dce6e0f5c798dbbed0fda505babd2e233.png)

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
  "engine": "google",
  "q": "Sydney things to do",
  "location": "Australia"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "things_to_do": [\
    {\
      "title": "Sydney Opera House",\
      "link": "https://www.google.com/search?sca_esv=578870548&gl=us&hl=en&q=Sydney+Opera+House&stick=H4sIAAAAAAAAAONgFuLQz9U3MKs0NVeCsOLzcrUUs5Ot9HPykxNLMvPz4AyrxJKSosRkELN4EatQcGVKXmqlgn9BalGigkd-aXEqAB6qc9lOAAAA&sa=X&ved=2ahUKEwjd5b7c6qWCAxXmv4kEHU4ACYkQ2coHegQIWBAB",\
      "rating": 4.7,\
      "reviews": 75000,\
      "attraction": "Performing arts theater",\
      "price": "$27.59",\
      "extracted_price": 27.59,\
      "thumbnail": "data:image/jpeg;base64,..."\
    },\
    ...\
  ]
}
```

### [Nearby Events](https://www.searchapi.io/docs/google\#api-examples-nearby-events)

![Nearby Events](https://www.searchapi.io/assets/docs/google/nearby_events-8182e10529e6114975b5aca961dc3f54eea7c2248fbb00fb95a8179d6a5dc6e9.png)

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
  "engine": "google",
  "q": "Bars good for dates mission bay sf"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "nearby_events": [\
    {\
      "title": "‼️ This Saturday I’m back inside @alchemistbarsf spinning 90s & 2000s throwback hits! 🎶 21+ No Cover Party starts at 9pm Come early to grab some good bites Kitchen closes at 10pm 🍲 👌🏿 Your favorite throwbacks deserve five-star 🌟 drinks and our bartenders serve nothing less !🍸 #GoldenEraVibes #ThrowbackPartySF #90sBabyNight #UpscaleEvenings #BayAreaEvents #RewindWithTNT #SanFranciscoNights #BayAreaTurnUp",\
      "link": "https://www.instagram.com/p/DIlvR2pxFvK/",\
      "source": "Instagram",\
      "date": "3d",\
      "author": {\
        "name": "Alchemist Bar & Lounge",\
        "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiMawNU9SFRVIigLuVeBKhDJxkY5T3DCBRwldJ&s=0"\
      },\
      "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDHw4fDmS-042xNprO2gJQ64Ptpoy6jKxZm0Fa7sEXDA7KFfHy9w6xN_ovxyk&s"\
    },\
    ...\
  ]
}
```

### [Popular Destinations](https://www.searchapi.io/docs/google\#api-examples-popular-destinations)

![Popular Destinations](https://www.searchapi.io/assets/docs/google/popular_destinations-0d460eb3d34f4bac221a4a5c346447f2872142562524d4ed8ff67e2daeeb5fb3.png)

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
  "engine": "google",
  "q": "Popular Destinations in Croatia",
  "location": "New York"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "popular_destinations": [\
    {\
      "title": "Plitvice Lakes National Park",\
      "link": "https://www.google.com/search?sca_esv=0f676148fa9f8081&hl=en&gl=us&q=Plitvice+Lakes+National+Park&si=ACC90nzx_D3_zUKRnpAjmO0UBLNxnt7EyN4YYdru6U3bxLI-L0ztLMUTPHuAlm78dCpIHEiprIywT3B3ZU-bf90biChDVjGspw%3D%3D&sa=X&ved=2ahUKEwj0-8ShiJ2HAxXOJEQIHc-SDJAQs4ILegQIGBAD",\
      "description": "Terraced lakes linked by waterfalls",\
      "flight_price": "$587",\
      "extracted_flight_price": 587,\
      "flight_duration": "12h",\
      "drive_duration": "2h",\
      "thumbnail": "data:image/jpeg;base64,..."\
    },\
    {\
      "title": "Zadar",\
      "link": "https://www.google.com/search?sca_esv=0f676148fa9f8081&hl=en&gl=us&q=Zadar&si=ACC90nzx_D3_zUKRnpAjmO0UBLNxnt7EyN4YYdru6U3bxLI-L6CT5KZmDA4O5ovYIh1ofZa9mDylZP3a2zf33G3CsFY2hsSflQ%3D%3D&sa=X&ved=2ahUKEwj0-8ShiJ2HAxXOJEQIHc-SDJAQs4ILegQIFBAD",\
      "description": "Dalmatian coast, Sea Organ & churches",\
      "hotel_price": "$158",\
      "extracted_hotel_price": 158,\
      "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPZ5ZJc5tz8bL7mojU58yVxztajPkJWueNQBki-prfddqeedIyInbQl2Cx1xo&s=8"\
    },\
    ...\
  ]
}
```

### [Events](https://www.searchapi.io/docs/google\#api-examples-events)

![Events](https://www.searchapi.io/assets/docs/google/events-77a5d7d1b2bce87f6b3dc8e761fe926cac7fb12c119f2067b3e17458daca1ecb.png)

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
  "engine": "google",
  "q": "Events next week",
  "location": "New York,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "events": [\
    {\
      "title": "Khruangbin",\
      "link": "https://www.google.com/search?gl=us&hl=en&q=khruangbin,+the+bowery+ballroom,+28+mar&uule=w+CAIQICIWTmV3IFlvcmssVW5pdGVkIFN0YXRlcw&si=AKbGX_rO4P19IF_yO85wYpkEaz-W_oZWd5JUOOVnUVftf2aeoT77C10cD4dKOlGqQ2ko9VK3IfFLdsraeQWkqhrRbCNSMcRXNQRk6UyDlzUn5imwXJ4HJVDIXcQ1b5xrCjJl0-IxDOKcs4WGWOjcAln9h8UtomrbKWwW0eiRm6Tbws0ujvKiB_jKCA4ZLvO9u7weY5vzGkRVNFHowWmKk2eeT29YOwWaSw%3D%3D&source=ev.im&sa=X&ved=2ahUKEwij_aS6i4CFAxVZMlkFHeneAicQsdoCegQIbxAB#",\
      "date": {\
        "day": "28",\
        "month": "Mar"\
      },\
      "duration": "Thu, Mar 28 – Fri, Mar 29 - $79+",\
      "address": "The Bowery Ballroom, 6 Delancey St",\
      "location": "New York, NY",\
      "thumbnail": "data:image/jpeg;base64,..."\
    },\
    ...\
  ]
}
```

### [Scholarly Articles](https://www.searchapi.io/docs/google\#api-examples-scholarly-articles)

![Scholarly Articles](https://www.searchapi.io/assets/docs/google/scholarly_articles-f65e311fc7d2bacf8f394b0e3905a02b616391b5a183844021176138171833f0.png)

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
  "engine": "google",
  "q": "Advancements in Robotics"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "scholarly_articles": {
    "title": "Scholarly articles for Advancements in Robotics",
    "link": "https://scholar.google.com/scholar?q=Advancements+in+Robotics&hl=en&as_sdt=0&as_vis=1&oi=scholart",
    "articles": [\
      {\
        "title": "Recent advancements of robotics in construction",\
        "link": "https://www.sciencedirect.com/science/article/pii/S0926580522004617",\
        "title_highlighted_words": ["advancements", "robotics"],\
        "author": "Xiao",\
        "cited_by": 42\
      },\
      ...\
    ]
  }
}
```

### [Universities & Colleges](https://www.searchapi.io/docs/google\#api-examples-universities-colleges)

![Universities & Colleges](https://www.searchapi.io/assets/docs/google/universities-3ad0e7db4cdb86d84795b759d455f8159ff4b59f2af5cc0c8b7bedf05060cc9f.png)

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
  "engine": "google",
  "q": "Universities in California",
  "location": "New York"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "universities": [\
    {\
      "title": "University of California, Berkeley",\
      "link": "https://www.google.com/search?gl=us&hl=en&ie=UTF-8&q=universities+in+california&ibp=htl;splinter&rciv=spl&sa=X&ved=2ahUKEwiR_fTq0peHAxVNMlkFHeNXBvYQrYMDegQIJxAB#htidocid=s6bxnM5DviHd9zxxAAAAAA%3D%3D",\
      "city": "Berkeley, CA",\
      "education_type": "Public",\
      "education_duration": "4-year",\
      "extracted_education_duration": 4,\
      "thumbnail": "data:image/png;base64..."\
    }\
  ]
}
```

### [Showtimes - Theater](https://www.searchapi.io/docs/google\#api-examples-showtimes-theater)

![Showtimes - Theater](https://www.searchapi.io/assets/docs/google/showtimes-4913cd68a10f958abe36f5291c3d329b85ffa970795bb7ca0706c69f01141b95.png)

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
  "engine": "google",
  "q": "amc empire 25 showtimes",
  "location": "New York,New York,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "showtimes": [\
    {\
      "day": "Today",\
      "date": "2026-09-01",\
      "timezone_note": "All times are in ET",\
      "movies": [\
        {\
          "title": "Spider-Man: Brand New Day",\
          "link": "https://www.google.com/search?sca_esv=b8c7a0b4c4f85b93&pws=0&hl=en&gl=us&q=Spider-Man:+Brand+New+Day&si=APenkKnBlllJXMN-DBfmV3x4g6XbZbeeMEzOUDQPFlgOwiu8XLC1hTZdDhffNnyDQis7Vl5xRWlgl3AYxoTrmVo_30bCrslQksjSytu594bqKiKRWUvGq50sjDez3ohZrq7r5FS-9U-HePiGRYNaIRe_ODgKOIoLjJWh4qnTaty1wYI_A44b3t8%3D&sa=X&ved=2ahUKEwjEqZvczMyWAxVEcvEDHS7QMQ8QxyZ6BAhIEBM",\
          "showings": [\
            {\
              "type": "Standard",\
              "times": [\
                {\
                  "time": "12:00pm",\
                  "datetime": "2026-09-01T12:00:00"\
                },\
                {\
                  "time": "3:30pm",\
                  "datetime": "2026-09-01T15:30:00"\
                },\
                {\
                  "time": "7:00pm",\
                  "datetime": "2026-09-01T19:00:00"\
                },\
                {\
                  "time": "8:30pm",\
                  "datetime": "2026-09-01T20:30:00"\
                },\
                ...\
              ]\
            },\
            {\
              "type": "AMC Prime",\
              "times": [\
                {\
                  "time": "10:15am",\
                  "datetime": "2026-09-01T10:15:00"\
                },\
                {\
                  "time": "1:45pm",\
                  "datetime": "2026-09-01T13:45:00"\
                },\
                {\
                  "time": "11:00pm",\
                  "datetime": "2026-09-01T23:00:00"\
                }\
              ]\
            },\
            {\
              "type": "Dolby Cinema",\
              "times": [\
                {\
                  "time": "4:00pm",\
                  "datetime": "2026-09-01T16:00:00"\
                },\
                {\
                  "time": "7:30pm",\
                  "datetime": "2026-09-01T19:30:00"\
                }\
              ]\
            }\
          ]\
        },\
        {\
          "title": "The Dog Stars",\
          "link": "https://www.google.com/search?sca_esv=b8c7a0b4c4f85b93&pws=0&hl=en&gl=us&q=The+Dog+Stars&si=APenkKnBlllJXMN-DBfmV3x4g6XbZbeeMEzOUDQPFlgOwiu8XAssHvfAp-LZqlQezyHW0Yhe_O_x1HbuknkWVd9VBcABG-pI3MRDCEUt0fzVFLOVwP5PFNgXynWvP2otsC3DGCnVhrEJB79rFp9TZYqiXIRt6xTKUo4aQMGQ3huWNHtKjSC1P7w%3D&sa=X&ved=2ahUKEwjEqZvczMyWAxVEcvEDHS7QMQ8QxyZ6BAhIECI",\
          "showings": [\
            {\
              "type": "Standard",\
              "times": [\
                {\
                  "time": "11:00am",\
                  "datetime": "2026-09-01T11:00:00"\
                },\
                {\
                  "time": "2:00pm",\
                  "datetime": "2026-09-01T14:00:00"\
                },\
                {\
                  "time": "5:30pm",\
                  "datetime": "2026-09-01T17:30:00"\
                },\
                {\
                  "time": "10:00pm",\
                  "datetime": "2026-09-01T22:00:00"\
                }\
              ]\
            },\
            {\
              "type": "IMAX",\
              "times": [\
                {\
                  "time": "4:00pm",\
                  "datetime": "2026-09-01T16:00:00"\
                }\
              ]\
            },\
            {\
              "type": "AMC Prime",\
              "times": [\
                {\
                  "time": "8:00pm",\
                  "datetime": "2026-09-01T20:00:00"\
                }\
              ]\
            },\
            ...\
          ]\
        },\
        ...\
      ]\
    },\
    {\
      "day": "Tomorrow",\
      "date": "2026-09-02",\
      "timezone_note": "All times are in ET",\
      "movies": [\
        {\
          "title": "Spider-Man: Brand New Day",\
          "link": "https://www.google.com/search?sca_esv=b8c7a0b4c4f85b93&pws=0&hl=en&gl=us&q=Spider-Man:+Brand+New+Day&si=APenkKnBlllJXMN-DBfmV3x4g6XbZbeeMEzOUDQPFlgOwiu8XLC1hTZdDhffNnyDQis7Vl5xRWlgl3AYxoTrmVo_30bCrslQksjSytu594bqKiKRWUvGq50sjDez3ohZrq7r5FS-9U-HePiGRYNaIRe_ODgKOIoLjJWh4qnTaty1wYI_A44b3t8%3D",\
          "showings": [\
            {\
              "type": "Standard",\
              "times": [\
                {\
                  "time": "12:00pm",\
                  "datetime": "2026-09-02T12:00:00"\
                },\
                {\
                  "time": "3:30pm",\
                  "datetime": "2026-09-02T15:30:00"\
                },\
                {\
                  "time": "7:00pm",\
                  "datetime": "2026-09-02T19:00:00"\
                },\
                {\
                  "time": "10:00pm",\
                  "datetime": "2026-09-02T22:00:00"\
                },\
                ...\
              ]\
            },\
            {\
              "type": "AMC Prime",\
              "times": [\
                {\
                  "time": "10:15am",\
                  "datetime": "2026-09-02T10:15:00"\
                },\
                {\
                  "time": "1:45pm",\
                  "datetime": "2026-09-02T13:45:00"\
                },\
                {\
                  "time": "11:00pm",\
                  "datetime": "2026-09-02T23:00:00"\
                }\
              ]\
            },\
            {\
              "type": "Dolby Cinema",\
              "times": [\
                {\
                  "time": "4:00pm",\
                  "datetime": "2026-09-02T16:00:00"\
                },\
                {\
                  "time": "7:30pm",\
                  "datetime": "2026-09-02T19:30:00"\
                }\
              ]\
            }\
          ]\
        },\
        ...\
      ]\
    },\
    ...\
  ]
}
```

### [Showtimes - Movie](https://www.searchapi.io/docs/google\#api-examples-showtimes-movie)

![Showtimes - Movie](https://www.searchapi.io/assets/docs/google/showtimes_movie-25a11c8336309c735a993ecf2c1bfad858676821cc9e7fc7c819981330d3b699.png)

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
  "engine": "google",
  "q": "spider-man brand new day showtimes",
  "location": "New York,New York,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "showtimes": [\
    {\
      "day": "Today",\
      "date": "2026-09-01",\
      "theaters": [\
        {\
          "title": "Alamo Drafthouse Cinema Lower Manhattan",\
          "link": "https://www.google.com/search?sca_esv=d73b232aeeb77d90&hl=en&pws=0&gl=us&q=Alamo+Drafthouse+Cinema+Lower+Manhattan&si=APenkKmVGdgpMPDQZoEWS8RIAhsqXAKlNLP0B8DNkkiU9KPI0eIuDNa6ikFY-3sb-U9FOGjehfhqp0tiwoxtQzxAL_EpxHJH65fynHu52GrMoIGdnb9nlMH_8fL0gq7Cy1BZdVjQD41suYiZCPvreQ2McXi1yzMy6RuXtpBDUrA0A-DihTcE2mJBF24dr-D3xVi_dAG5lzI7ejle2PARwcEC8yu_RHYuXnpGatmo3KgEQh7kBSl1GSHWtSXuOiMWN7vsMqv9VD3V&sa=X&ved=2ahUKEwjLu_DezMyWAxVPoysGHdVEFfkQySZ6BAhrEBA",\
          "distance": "0.4 mi",\
          "extracted_distance": 0.4,\
          "distance_unit": "mi",\
          "address": "Suite SC301, 28 Liberty Street, New York, NY 10005",\
          "showings": [\
            {\
              "type": "Standard",\
              "times": [\
                {\
                  "time": "11:15am",\
                  "datetime": "2026-09-01T11:15:00"\
                },\
                {\
                  "time": "2:45pm",\
                  "datetime": "2026-09-01T14:45:00"\
                },\
                {\
                  "time": "4:30pm",\
                  "datetime": "2026-09-01T16:30:00"\
                },\
                {\
                  "time": "6:15pm",\
                  "datetime": "2026-09-01T18:15:00"\
                },\
                ...\
              ]\
            }\
          ]\
        },\
        {\
          "title": "Regal Battery Park",\
          "link": "https://www.google.com/search?sca_esv=d73b232aeeb77d90&hl=en&pws=0&gl=us&q=Regal+Battery+Park&si=APenkKnTl1SNyGw93eJictriFKjA8wrAY1gKp22d_AvA68HEcmVfIt2I7sJqQbdLAaSjJoHYvW7U2PL2iNoy5jmsIf62N5ZPxRvwvq6vSfM18vjUgJOU-vsJd5D7tr86fzrba96MNfzKnUV36UXKrqZxlIK3aK8ZdLeq_HEuFhFI_ZYj9ys_hgZw5v99VnooXfR8w9WrhoQGW56StDyDEqBnrVYSe3HinMVPTnpMz8TFC0GcodSMd4ZvFX2yVnMkLSVlcLgPbf9m&sa=X&ved=2ahUKEwjLu_DezMyWAxVPoysGHdVEFfkQySZ6BAhrEBg",\
          "distance": "0.6 mi",\
          "extracted_distance": 0.6,\
          "distance_unit": "mi",\
          "address": "102 North End Avenue, New York, NY 10282",\
          "showings": [\
            {\
              "type": "Standard",\
              "times": [\
                {\
                  "time": "11:50am",\
                  "datetime": "2026-09-01T11:50:00"\
                },\
                {\
                  "time": "12:20pm",\
                  "datetime": "2026-09-01T12:20:00"\
                },\
                {\
                  "time": "3:30pm",\
                  "datetime": "2026-09-01T15:30:00"\
                },\
                {\
                  "time": "6:50pm",\
                  "datetime": "2026-09-01T18:50:00"\
                },\
                ...\
              ]\
            }\
          ]\
        },\
        {\
          "title": "Regal Essex Crossing",\
          "link": "https://www.google.com/search?sca_esv=d73b232aeeb77d90&hl=en&pws=0&gl=us&q=Regal+Essex+Crossing&si=APenkKmVGdgpMPDQZoEWS8RIAhsqXAKlNLP0B8DNkkiU9KPI0YhEr5Qt9oNk_0dNr0nbEXy8M-4sJxnt2E-WW8eyuF9kgs5pTC_pZEYTp7-9KCebNw1s7iTGL918itGyuKT9ujnyBE21M_dst7iDWm8jCeCp73gHunxmGNJKbNMGmHa79ZRDuKTdfaD82_D8ZOhNDLCb3tJJza2xw4JnfCu3iX5edH93C4xeXS1Uz7MugrIMDDg-gx-3RdD4aX8KJz-ryVcawGy4&sa=X&ved=2ahUKEwjLu_DezMyWAxVPoysGHdVEFfkQySZ6BAhrECA",\
          "distance": "1.1 mi",\
          "extracted_distance": 1.1,\
          "distance_unit": "mi",\
          "address": "129 Delancey Street, New York, NY 10002",\
          "showings": [\
            {\
              "type": "Standard",\
              "times": [\
                {\
                  "time": "11:20am",\
                  "datetime": "2026-09-01T11:20:00"\
                },\
                {\
                  "time": "3:05pm",\
                  "datetime": "2026-09-01T15:05:00"\
                },\
                {\
                  "time": "10:15pm",\
                  "datetime": "2026-09-01T22:15:00"\
                }\
              ]\
            },\
            {\
              "type": "Standard",\
              "qualifier": "Subtitled in English",\
              "times": [\
                {\
                  "time": "6:45pm",\
                  "datetime": "2026-09-01T18:45:00"\
                }\
              ]\
            },\
            {\
              "type": "PX RPX",\
              "qualifier": "Subtitled in English",\
              "times": [\
                {\
                  "time": "11:50am",\
                  "datetime": "2026-09-01T11:50:00"\
                },\
                {\
                  "time": "9:30pm",\
                  "datetime": "2026-09-01T21:30:00"\
                }\
              ]\
            }\
          ]\
        },\
        ...\
      ]\
    },\
    {\
      "day": "Tomorrow",\
      "date": "2026-09-02",\
      "theaters": [\
        {\
          "title": "Alamo Drafthouse Cinema Lower Manhattan",\
          "link": "https://www.google.com/search?sca_esv=d73b232aeeb77d90&hl=en&pws=0&gl=us&q=Alamo+Drafthouse+Cinema+Lower+Manhattan&si=APenkKmVGdgpMPDQZoEWS8RIAhsqXAKlNLP0B8DNkkiU9KPI0eIuDNa6ikFY-3sb-U9FOGjehfhqp0tiwoxtQzxAL_EpxHJH65fynHu52GrMoIGdnb9nlMH_8fL0gq7Cy1BZdVjQD41suYiZCPvreQ2McXi1yzMy6RuXtpBDUrA0A-DihTcE2mJBF24dr-D3xVi_dAG5lzI7ejle2PARwcEC8yu_RHYuXnpGatmo3KgEQh7kBSl1GSHWtSXuOiMWN7vsMqv9VD3V",\
          "distance": "0.4 mi",\
          "extracted_distance": 0.4,\
          "distance_unit": "mi",\
          "address": "Suite SC301, 28 Liberty Street, New York, NY 10005",\
          "showings": [\
            {\
              "type": "Standard",\
              "times": [\
                {\
                  "time": "11:15am",\
                  "datetime": "2026-09-02T11:15:00"\
                },\
                {\
                  "time": "2:45pm",\
                  "datetime": "2026-09-02T14:45:00"\
                },\
                {\
                  "time": "3:15pm",\
                  "datetime": "2026-09-02T15:15:00"\
                },\
                {\
                  "time": "6:15pm",\
                  "datetime": "2026-09-02T18:15:00"\
                },\
                ...\
              ]\
            }\
          ]\
        },\
        ...\
      ]\
    },\
    ...\
  ]
}
```

### [Inline Videos](https://www.searchapi.io/docs/google\#api-examples-inline-videos)

![Inline Videos](https://www.searchapi.io/assets/docs/google/inline_videos-3f16f36feb0849fb6fc7c2db2af10e2bfb674cec5330df3a2874bab87bac51ec.png)

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
  "engine": "google",
  "q": "scraping tutorial"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "inline_videos": [\
    {\
      "position": 1,\
      "title": "Web Scraping with Python - Beautiful Soup Crash Course",\
      "link": "https://www.youtube.com/watch?v=XVv6mJpFOb0",\
      "source": "YouTube",\
      "channel": "freeCodeCamp.org",\
      "date": "Nov 18, 2020",\
      "key_moments": [\
        {\
          "time": "00:00",\
          "seconds": 0,\
          "title": "Basic HTML Structure, HTML Tags Explanation",\
          "link": "https://www.youtube.com/watch?v=XVv6mJpFOb0&t=0",\
          "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQslsiE3PdIL7D4-DQVjRnXizuMrrWRQeH_ITOGrxxSog&s"\
        },\
        {\
          "time": "05:35",\
          "seconds": 335,\
          "title": "Packages Installation",\
          "link": "https://www.youtube.com/watch?v=XVv6mJpFOb0&t=335",\
          "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa6fWFmZ6EtBAH26vgMvzsSUDz7aMvjAyqkeZxnceSpQ&s"\
        },\
        ...\
      ],\
      "image": "data:image/jpeg;base64,..."\
    },\
    ...\
  ]
}
```

### [Inline Shorts](https://www.searchapi.io/docs/google\#api-examples-inline-shorts)

![Inline Shorts](https://www.searchapi.io/assets/docs/google/inline_shorts-21667e6b22724f8226dc3b19b5aeffa682ff4bcda4c5374d0e395b1cf57cdfb3.png)

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
  "engine": "google",
  "q": "sydney things to do shorts"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "inline_shorts": [\
    {\
      "position": 1,\
      "title": "Things to do in Sydney Australia",\
      "link": "https://www.youtube.com/shorts/FIP4I928r5o",\
      "source": "YouTube",\
      "author": "Aquarius Traveller",\
      "length": "0:56",\
      "thumbnail": "data:image/jpeg;base64,..."\
    },\
    ...\
  ]
}
```

### [Inline Tweets](https://www.searchapi.io/docs/google\#api-examples-inline-tweets)

![Inline Tweets](https://www.searchapi.io/assets/docs/google/inline_tweets-f949fb62d8189e83844b30824fcad1f35c59754a3e5c53412382edd6ed865fb0.png)

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
  "engine": "google",
  "q": "Elon Musk tweets",
  "location": "New York,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "inline_tweets": {
    "title": "Elon Musk tweets on Twitter",
    "link": "https://twitter.com/search?q=elon+musk+tweets\u0026ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Esearch",
    "displayed_link": "https://twitter.com/search/Elon+Musk+tweets",
    "tweets": [\
      {\
        "tweet_id": "1664637044549726210",\
        "link": "https://twitter.com/elonmusk/status/1664637044549726210?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Etweet",\
        "snippet": "Let that sink in",\
        "date": "2 hours ago",\
        "author": {\
          "name": "Elon Musk",\
          "screen_name": "elonmusk",\
          "link": "https://twitter.com/elonmusk",\
          "thumbnail": "data:image/jpeg;base64,..."\
        }\
      },\
      ...\
    ]
  }
}
```

### [Apps](https://www.searchapi.io/docs/google\#api-examples-apps)

![Apps](https://www.searchapi.io/assets/docs/google/apps-bbff0402305aa9777c7366e084715e1b229cb9b0adc053e4302300626d34bb77.png)

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
  "engine": "google",
  "q": "best language learning app",
  "device": "mobile",
  "location": "Austin,Texas,United States"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "apps": [\
    {\
      "position": 1,\
      "title": "Babbel - Language Learning",\
      "link": "https://apps.apple.com/us/app/babbel-language-learning/id829587759",\
      "product_id": "829587759",\
      "rating": 4.7,\
      "reviews": 1000000,\
      "categories": [\
        "Education",\
        "Travel"\
      ],\
      "thumbnail": "https://lh3.googleusercontent.com/4hhTmSZKQDAotxf0BdsEUbOcCL8OaWfL2EgpQMIn6sxSKboAxPKdykKXie2uTkEYzayhd32VOQ=w60-h60-c0x"\
    },\
    {\
      "position": 2,\
      "title": "Busuu: Language Learning App",\
      "link": "https://apps.apple.com/us/app/busuu-language-learning-app/id379968583",\
      "product_id": "379968583",\
      "rating": 4.7,\
      "reviews": 598000,\
      "categories": [\
        "Education",\
        "Travel"\
      ],\
      "thumbnail": "https://lh3.googleusercontent.com/qGmMoXroI_Tbi4Q547ZnJQWh7UqYayqucUlwrpADPefI_7z-I6-tqfJzKqoLUrxu903Dhcv91g=w60-h60-c0x"\
    },\
    ...\
  ]
}
```

### [Inline Images](https://www.searchapi.io/docs/google\#api-examples-inline-images)

![Inline Images](https://www.searchapi.io/assets/docs/google/inline_images-13e71cf9242e762b1263d96acd3b0f3c20e653b81374b6f6d9d0bf015de2cfb2.png)

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
  "engine": "google",
  "q": "Panda images"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "inline_images": {
    "suggestions": [\
      {\
        "title": "cute",\
        "link": "https://www.google.com/search?gl=us&hl=en&q=Panda+images&tbm=isch&chips=q:panda+photo,g_1:cute:scIXM7LfkcI%3D&usg=AI4_-kSxgUC4tTpNqb53r1J-ZQFIClpuLw&sa=X&ved=2ahUKEwj6idfB8PL_AhV5J0QIHehgBokQgIoDKAB6BAgLEBE",\
        "chips": "q:panda+photo,g_1:cute:scIXM7LfkcI%3D",\
        "thumbnail": "data:image/jpeg;base64,..."\
      },\
      ...\
    ],
    "images": [\
      {\
        "title": "550+ Giant Panda Pictures | Download Free Images on Unsplash",\
        "source": {\
          "name": "Unsplash",\
          "link": "https://unsplash.com/s/photos/giant-panda"\
        },\
        "original": {\
          "link": "https://images.unsplash.com/photo-1625859043880-56acbcb6a6ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Z2lhbnQlMjBwYW5kYXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",\
          "height": 1250,\
          "width": 1000,\
          "size": "279KB"\
        },\
        "thumbnail": "data:image/jpeg;base64,..."\
      },\
      ...\
    ]
  }
}
```

### [Inline Recipes](https://www.searchapi.io/docs/google\#api-examples-inline-recipes)

![Inline Recipes](https://www.searchapi.io/assets/docs/google/inline_recipes-aa9c35a89b518bce9a70d0322782a95b5d00e298607812c8f077f06fca28a1b5.png)

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
  "engine": "google",
  "q": "Pancakes"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "inline_recipes": [\
    {\
      "title": "Good Old-Fashioned Pancakes",\
      "link": "https://www.allrecipes.com/recipe/21014/good-old-fashioned-pancakes/",\
      "rating": 4.6,\
      "reviews": 18000,\
      "ingredients": [\
        "Butter",\
        "egg",\
        "baking powder",\
        "all purpose flour",\
        "white sugar"\
      ],\
      "source": "Allrecipes",\
      "duration": "20 min",\
      "thumbnail": "data:image/jpeg;base64,..."\
    },\
    ...\
  ]
}
```

### [Top Stories](https://www.searchapi.io/docs/google\#api-examples-top-stories)

![Top Stories](https://www.searchapi.io/assets/docs/google/top_stories-d57af534489d73d6db6bd4d2349969ee51935ede73393309c2ffa571dcf8d023.png)

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
  "engine": "google",
  "q": "US news"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "top_stories": [\
    {\
      "title": "G7 Members Should Not Compete Against Each Other on Renewables - Von Der \nLeyen",\
      "link": "https://www.usnews.com/news/world/articles/2023-05-19/g7-members-should-not-compete-against-each-other-on-renewables-von-der-leyen",\
      "source": "USNews.com",\
      "date": "15 mins ago",\
      "thumbnail": "data:image/jpeg;base64,..."\
    },\
    {\
      "title": "UK Targets Grain Theft and Energy Sector With New Russian Sanctions",\
      "link": "https://www.usnews.com/news/top-news/articles/2023-05-19/uk-targets-grain-theft-and-energy-sector-with-new-russian-sanctions",\
      "source": "USNews.com",\
      "date": "33 mins ago",\
      "thumbnail": "data:image/jpeg;base64,..."\
    },\
    ...\
  ]
}
```

### [Perspectives](https://www.searchapi.io/docs/google\#api-examples-perspectives)

![Perspectives](https://www.searchapi.io/assets/docs/google/perspectives-00b09cb60ff4a93b3c615473488848ff9be656054b6a5004570173f1df8690ef.png)

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
  "engine": "google",
  "q": "Jazz Music"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "perspectives": [\
    {\
      "link": "https://twitter.com/SVG__Collection/status/1875850768252878912",\
      "author": "SVG__Collection",\
      "source": "X (Twitter)",\
      "date": "1 day ago",\
      "snippet": "\"Jazz music is the power of now.\" -- Wynton Marsalis",\
      "reactions": "790+ likes",\
      "thumbnail": "data:image/jpeg;base64,..."\
    },\
    {\
      "title": "🫠 JAZZ MAKES YOU FEEL 🫠 Tag a musician ...",\
      "link": "https://www.instagram.com/jazzmemes_/reel/DEcm2WtRXEG/",\
      "author": "jazzmemes_",\
      "source": "Instagram",\
      "date": "1 day ago",\
      "reactions": "8K+ likes",\
      "thumbnail": "data:image/jpeg;base64,..."\
    },\
    ...\
  ]
}
```

### [Local News](https://www.searchapi.io/docs/google\#api-examples-local-news)

![Local News](https://www.searchapi.io/assets/docs/google/local_news-55e69e727b660caf28041a59688a55c20670c90a731248b2e95b21e84e968600.jpg)

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
  "engine": "google",
  "q": "live news"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "local_news": [\
    {\
      "title": "Manchester School’s Trust Shortlisted for Top Inclusion Award",\
      "source": "ManchesterWorld",\
      "link": "https://www.manchesterworld.uk/community/manchester-schools-trust-shortlisted-for-top-inclusion-award-5109419",\
      "thumbnail": "data:image/jpeg;base64,...",\
      "date": "49 minutes ago"\
    },\
    ...\
  ]
}
```

### [Courses](https://www.searchapi.io/docs/google\#api-examples-courses)

![Courses](https://www.searchapi.io/assets/docs/google/courses-0ef4a21209863599e3b516669e6af9287480673fd25347fb7e99b34c6761cfb2.png)

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
  "engine": "google",
  "q": "Python courses"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "courses": [\
    {\
      "title": "Learn Python 3",\
      "link": "https://www.codecademy.com/learn/learn-python-3",\
      "source": "Codecademy",\
      "rating": 4.6,\
      "reviews": 7200,\
      "extensions": ["Beginner", "Subscription", "1 day"],\
      "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSETD8S7m7VBfEkuNcqP49pIJvxPX6yg6QG-wQl0ED2b-oeZIUmcz8PYhnD&s"\
    },\
    ...\
  ]
}
```

### [DMCA Messages](https://www.searchapi.io/docs/google\#api-examples-dmca-messages)

![DMCA Messages](https://www.searchapi.io/assets/docs/google/dmca_messages-e61505ebfca4aab323fd7c2a63cf1fa06be1687f71853e5c43815ed0e0631aea.png)

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
  "engine": "google",
  "q": "watch dune part two free online"
}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "dmca_messages": {
    "title": "Notices about Filtered Results",
    "messages": [\
      {\
        "content": "In response to a complaint we received under the US Digital Millennium Copyright Act, we have removed 1 result(s) from this page. If you wish, you may read the DMCA complaint that caused the removal(s) at LumenDatabase.org.",\
        "highlighted_content": "In response to a complaint we received under the <b>US Digital Millennium Copyright Act</b>, we have removed 1 result(s) from this page. If you wish, you may <b>read the DMCA complaint</b> that caused the removal(s) at LumenDatabase.org.",\
        "highlighted_words": [\
          {\
            "text": "US Digital Millennium Copyright Act",\
            "link": "https://www.google.com/support/answer/1386831"\
          },\
          {\
            "text": "read the DMCA complaint",\
            "link": "https://lumendatabase.org/notices/79723186"\
          }\
        ]\
      }\
    ]
  }
}
```

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy

Click to copy