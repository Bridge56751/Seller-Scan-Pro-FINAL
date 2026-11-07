Source: https://www.searchapi.io/docs/account-api
Title: Account API Documentation
Fetched: 2026-11-07T22:01:34.455Z

Close sidebar

[LogoSearchApi](https://www.searchapi.io/)

[Sign in](https://www.searchapi.io/users/sign_in) [Sign up](https://www.searchapi.io/users/sign_up)

Open sidebar

[LogoSearchApi](https://www.searchapi.io/)

[Sign in](https://www.searchapi.io/users/sign_in) [Sign up](https://www.searchapi.io/users/sign_up)

# Account API

GET/api/v1/me

The Account API provides access to your account usage statistics, allowing you to **retrieve real-time data** on your current monthly usage, remaining credits, and hourly limits.


## [API Parameters](https://www.searchapi.io/docs/account-api\#api-parameters)

### [Search Parameters](https://www.searchapi.io/docs/account-api\#api-parameters-search-parameters)

- Name[`api_key`](https://www.searchapi.io/docs/account-api#api-parameters-search-parameters-api-key)Required
Required
Description


The `api_key` authenticates your requests. Use it as a query parameter (`https://www.searchapi.io/api/v1/me?api_key=YOUR_API_KEY`) or in the Authorization header (`Bearer YOUR_API_KEY`).



### [Zero Data Retention](https://www.searchapi.io/docs/account-api\#api-parameters-zero-data-retention)

- Name[`zero_retention`](https://www.searchapi.io/docs/account-api#api-parameters-zero-data-retention-zero-retention)Enterprise OnlyEnterprise OnlyRequired
Optional
Description


Set this parameter to `true` to disable all logging and persistent storage. No request parameters, HTML, or JSON responses are stored or logged. Suitable for high-compliance use cases. Debugging and support may be limited while enabled.



## [API Example](https://www.searchapi.io/docs/account-api\#api-examples)

### [Account Usage](https://www.searchapi.io/docs/account-api\#api-examples-account-usage)

This example shows current usage details, helping you stay within your monthly limits and track remaining credits.


Response structure:


`account` General account usage data:


- `current_month_usage` Total searches performed this month.
- `monthly_allowance` Maximum allowable searches per month.
- `remaining_credits` Search credits remaining for the month.

`api_usage` Hourly limits and recent search activity:


- `searches_this_hour` Searches made in the current hour.
- `hourly_rate_limit` Maximum searches allowed per hour.

`subscription` Subscription period information (if an active subscription exists):


- `period_start` Start date of the current subscription period.
- `period_end` End date of the current subscription period.

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

url = "https://www.searchapi.io/api/v1/me"
params = {}

response = requests.get(url, params=params)
print(response.text)
```

Copy code

Response

```json
{
  "account": {
    "current_month_usage": 4800,
    "monthly_allowance": 10000,
    "remaining_credits": 5200
  },
  "api_usage": {
    "searches_this_hour": 250,
    "hourly_rate_limit": 200000
  },
  "subscription": {
    "period_start": "2024-12-04T00:34:59Z",
    "period_end": "2025-01-04T00:34:59Z"
  }
}
```

Click to copy