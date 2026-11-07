Source: https://www.searchapi.io/openapi/amazon_categories.yaml
Title: 
Fetched: 2026-11-07T22:01:52.606Z

openapi: 3.0.0
info:
 title: Amazon Categories API
 description: \|
 Browse Amazon's complete category hierarchy (browse nodes) across all supported domains.
 List root categories, drill into subcategories, look up individual nodes by ID, or search by name.

 \*\*Cross-linking\*\*: The category \`id\` returned by this API can be used as the \`category\_id\` parameter
 in the Amazon Search API to filter search results by category.
 version: 1.0.0
servers:
 \- url: https://www.searchapi.io/api/v1
paths:
 /search:
 get:
 summary: Amazon Categories
 security:
 \- ApiKeyAuth: \[\]
 \- ApiKeyQuery: \[\]
 parameters:
 \- name: engine
 in: query
 required: true
 description: Search engine to use
 schema:
 type: string
 enum: \["amazon\_categories"\]
 \- name: category\_type
 in: query
 required: false
 description: \|
 The type of category tree to browse. Different types represent different Amazon features:
 \- \`standard\` (default): Regular Amazon browse node categories used for product search
 \- \`deals\`: Department categories from Amazon's Today's Deals page
 \- \`bestsellers\`: Categories from Amazon's Best Sellers rankings (top 100 by sales)
 \- \`new\_releases\`: Categories from Amazon's New Releases (last 30 days)
 \- \`most\_wished\_for\`: Categories from Amazon's Most Wished For lists
 \- \`most\_gifted\`: Categories from Amazon's Most Gifted
 schema:
 type: string
 enum: \["standard", "deals", "bestsellers", "new\_releases", "most\_wished\_for", "most\_gifted"\]
 default: "standard"
 \- name: category\_id
 in: query
 required: false
 description: Amazon browse node ID to look up a specific category. Returns the category, its parent context, and direct children. Cannot be used together with q.
 schema:
 type: string
 maxLength: 64
 \- name: q
 in: query
 required: false
 description: Text query to search categories by name. Cannot be used together with category\_id.
 schema:
 type: string
 minLength: 3
 maxLength: 200
 \- name: amazon\_domain
 in: query
 required: false
 description: Amazon domain to browse categories for.
 schema:
 type: string
 enum: \["amazon.ae", "amazon.ca", "amazon.co.jp", "amazon.co.uk", "amazon.com", "amazon.com.au", "amazon.com.be", "amazon.com.br", "amazon.com.tr", "amazon.com.mx", "amazon.de", "amazon.es", "amazon.eg", "amazon.fr", "amazon.in", "amazon.ie", "amazon.it", "amazon.nl", "amazon.pl", "amazon.sa", "amazon.se", "amazon.sg", "amazon.co.za"\]
 default: "amazon.com"
 responses:
 '200':
 description: Successful response
 content:
 application/json:
 schema:
 oneOf:
 \- $ref: '#/components/schemas/RootCategoriesResponse'
 \- $ref: '#/components/schemas/CategoryByIdResponse'
 \- $ref: '#/components/schemas/SearchCategoriesResponse'
 '400':
 description: Validation Error. There is an issue with query parameters, such as missing required parameters or invalid values.
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 '401':
 description: Authentication Error. The API key is missing or invalid.
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 '404':
 description: Category Not Found. The \`category\_id\` is well-formed but does not exist for the given \`amazon\_domain\` and \`category\_type\`.
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 '429':
 description: Rate Limit Exceeded. The number of allowed requests has been exceeded. Consider upgrading your plan or waiting for the limit to reset.
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
 '500':
 description: Server Error. Internal server error.
 content:
 application/json:
 schema:
 $ref: '#/components/schemas/ErrorResponse'
components:
 securitySchemes:
 ApiKeyAuth:
 type: apiKey
 in: header
 name: Authorization
 description: 'Use Bearer authentication. Format: "Bearer YOUR\_API\_KEY"'
 ApiKeyQuery:
 type: apiKey
 in: query
 name: api\_key
 description: Pass API key as query parameter
 schemas:
 SearchMetadata:
 type: object
 required: \[id, status, created\_at\]
 properties:
 id:
 type: string
 description: Unique identifier for the search request
 status:
 type: string
 description: Status of the search request
 created\_at:
 type: string
 format: date-time
 description: Timestamp when the search was created
 request\_time\_taken:
 type: number
 description: Time taken to make the request in seconds
 parsing\_time\_taken:
 type: number
 description: Time taken to parse the results in seconds
 total\_time\_taken:
 type: number
 description: Total time taken for the search in seconds
 json\_url:
 type: string
 description: URL to view JSON results

 SearchParameters:
 type: object
 properties:
 engine:
 type: string
 description: Search engine used
 category\_type:
 type: string
 description: Category tree type
 amazon\_domain:
 type: string
 description: Amazon domain used
 category\_id:
 type: string
 description: Amazon browse node ID
 q:
 type: string
 description: Text query used to search categories by name

 Category:
 type: object
 required:
 \- id
 \- name
 \- domain
 \- link
 \- has\_children
 \- is\_root
 properties:
 id:
 type: string
 description: Amazon browse node ID
 name:
 type: string
 description: Category display name
 link:
 type: string
 description: Direct link to Amazon page for this category
 has\_children:
 type: boolean
 description: Whether this category has subcategories
 is\_root:
 type: boolean
 description: Whether this is a root-level category
 path:
 type: string
 description: Full breadcrumb path
 domain:
 type: string
 parent\_id:
 type: string
 description: Parent category's browse node ID (absent for root categories)
 parent\_name:
 type: string
 description: Parent category's name (absent for root categories)

 SearchInformation:
 type: object
 required: \[total\_categories\]
 properties:
 total\_categories:
 type: integer
 description: Total number of categories returned

 RootCategoriesResponse:
 type: object
 description: Default response when no parameters are provided. Returns all root-level categories.
 properties:
 search\_metadata:
 $ref: "#/components/schemas/SearchMetadata"
 search\_parameters:
 $ref: "#/components/schemas/SearchParameters"
 search\_information:
 $ref: "#/components/schemas/SearchInformation"
 categories:
 type: array
 items:
 $ref: "#/components/schemas/Category"

 CategoryByIdResponse:
 type: object
 description: Response when category\_id parameter is provided. Returns the category, its parent context, and direct children. Cannot be combined with q.
 properties:
 search\_metadata:
 $ref: "#/components/schemas/SearchMetadata"
 search\_parameters:
 $ref: "#/components/schemas/SearchParameters"
 search\_information:
 $ref: "#/components/schemas/SearchInformation"
 current\_category:
 $ref: "#/components/schemas/Category"
 parent\_category:
 $ref: "#/components/schemas/Category"
 categories:
 type: array
 description: Direct child categories
 items:
 $ref: "#/components/schemas/Category"

 SearchCategoriesResponse:
 type: object
 description: Response when q parameter is provided. Returns matching categories.
 properties:
 search\_metadata:
 $ref: "#/components/schemas/SearchMetadata"
 search\_parameters:
 $ref: "#/components/schemas/SearchParameters"
 search\_information:
 $ref: "#/components/schemas/SearchInformation"
 categories:
 type: array
 items:
 $ref: "#/components/schemas/Category"

 ErrorResponse:
 type: object
 required: \[error\]
 properties:
 error:
 type: string
 description: Error message describing what went wrong