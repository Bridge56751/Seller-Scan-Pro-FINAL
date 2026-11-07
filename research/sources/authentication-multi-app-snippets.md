# Authentication and multi-app restrictions — saved search evidence

Research/search date: 2026-11-07. These sources were returned by webSearch and were not fetched. Publication dates were not supplied in the results.

## Privacy Policy

URL: https://www.searchapi.io/legal/privacy

Title: Privacy Policy

Publication/update date: Not supplied in search result.

Search query: Do SearchApi.io terms restrict use across multiple websites?

Verbatim search snippet:

> We store a record of the payment transaction, including the last 4 digits of the credit card number and as-of billing address, for account history, invoicing, and billing support.
>
> ...
>
> We log all access to all accounts by full IP address so that we can always verify no unauthorized access has happe

Evidence scope: The snippet supports IP-address access logging only. It does not establish IP whitelisting or caller restrictions.

## Google Maps OpenAPI specification

URL: https://www.searchapi.io/openapi/google_maps.yaml

Title returned by search: https://www.searchapi.io/openapi/google_maps.yaml

Publication/update date: Not supplied in search result.

Search query: site:searchapi.io documentation api_key Authorization Bearer authentication

Verbatim search snippet:

> content: application/json: schema: $ref: '#/components/schemas/ErrorResponse' '401': description: Authentication Error. The API key is missing or invalid. content: application/json: schema: $ref: '#/components/schemas/ErrorResponse' '429': description: Rate Limit Exceeded. The number of allowed requ

Evidence scope: The snippet supports a 401 response for a missing or invalid API key, and identifies 429 as Rate Limit Exceeded. It does not identify the full limit rule.
