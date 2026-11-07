Source: https://www.searchapi.io/announcements/7
Title: Google Search API for real-time SERP scraping
Fetched: 2026-11-07T22:01:46.031Z

# What's New

New updates and improvements to SearchApi

[←\\
Back](https://www.searchapi.io/announcements)

[Nov 6, 2023](https://www.searchapi.io/announcements/7)

## November 2023 Update

New

As another month wraps up, we're eager to share our latest strides in enhancing your development workflow.

# `🛠️` **Developer Experience**

- **Integration Examples.** Expanded support for 13 programming languages, enhancing our library support to facilitate seamless integration with SearchApi. We've introduced intuitive icons for quick actions, enabling you to copy code snippets or open API examples in a new tab more efficiently.

​​

![](https://embed.filekitcdn.com/e/6pbb7zeSHw4uPRJi1oJ36j/pJCzMs23bqip5rKZ1eJhwE/email)

- **API Key Management**
  - **Multiple API Keys.** [​The new Account API keys page​](https://www.searchapi.io/api_tokens) allows the creation of distinct API keys for different environments or individual team members, reinforcing your operational security posture.
  - **Zero downtime rotation.** Transition between old and new API keys without service interruption, ensuring continuous operation.
  - **Default API key.** The default API key is used sitewide across all integration examples, so you can test the API faster.
  - The default API key is now hidden in the dashboard.

# **🔧 Engine Improvements**

**Google**

- New "Salary Estimates" block providing valuable compensation data.

![](https://embed.filekitcdn.com/e/6pbb7zeSHw4uPRJi1oJ36j/k4ubZiM7NbPYGWicb4uckR/email)

- New "About this result" block offering contextual information about search results.

![](https://embed.filekitcdn.com/e/6pbb7zeSHw4uPRJi1oJ36j/88Wk2VnfJC9r93S5Kcmv7w/email)

- "People also search for" block is now parsed as \`related\_searches\` on mobile.
- Added pagination for Google searches, News, and Jobs.

**Google Lens**

- Now supports query parameters in image URLs, correcting previously encountered encoding issues.

# **👨‍💻 DevOps**

- Resolved 504 HTTP response timeouts by adjusting the CloudFront to accommodate longer wait times for AWS ALB responses and established CloudWatch alerts for proactive monitoring.
- Upgraded our infrastructure to utilize Rails 7.1.1 & Ruby 3.2.2 for improved performance and stability.

# **🔗** **New Integrations**

- [​ **Flowise** ​](https://github.com/FlowiseAI/Flowise) **Integration.** A new addition to facilitate low-code/no-code development for LLM applications.
- [​ **Pipedream** ​](https://github.com/PipedreamHQ/pipedream) **Integration.** Enables connection to over 1000+ APIs with options for both coders and non-coders. Detailed information is available on our [​SearchApi Pipedream page​](https://pipedream.com/apps/search-api).

# **⏭️ What's coming next?**

- Amazon Product API
- Google Maps API
- TikTok API
- More integrations

Your engagement is crucial for our continuous improvement. We encourage you to test these updates and look forward to your valuable feedback. Thank you for being an integral part of the SearchApi developer community.