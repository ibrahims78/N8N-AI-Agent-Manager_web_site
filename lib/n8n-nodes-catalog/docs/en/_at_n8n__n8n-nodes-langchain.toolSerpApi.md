# SerpApi (Google Search) node documentation

> Learn how to use the SerpApi (Google Search) node in n8n. Follow technical documentation to integrate SerpApi (Google Search) node into your workflows.

# SerpApi (Google Search) node

The SerpAPI node allows an [agent](https://docs.n8n.io/glossary/#ai-agent) in your workflow to call Google's Search API.

On this page, you'll find the node parameters for the SerpAPI node, and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](https://docs.n8n.io/integrations/builtin/credentials/serp/).

> **Parameter resolution in sub-nodes**
>
> Sub-nodes behave differently to other nodes when processing multiple items using an expression.
> 
> Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `` resolves to each name in turn.
> 
> In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `` always resolves to the first name.

## Node options

* **Country**: Enter the country code you'd like to use. Refer to [Google GL Parameter: Supported Google Countries](https://serpapi.com/google-countries) for supported countries and country codes.
* **Device**: Select the device to use to get the search results.
* **Explicit Array**: Choose whether to force SerpApi to fetch the Google results even if a cached version is already present (turned on) or not (turned off).
* **Google Domain**: Enter the Google Domain to use. Refer to [Supported Google Domains](https://serpapi.com/google-domains) for supported domains.
* **Language**: Enter the language code you'd like to use. Refer to [Google HL Parameter: Supported Google Languages](https://serpapi.com/google-languages) for supported languages and language codes.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for serpapi at [https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolserpapi/](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolserpapi/)

## Related resources

Refer to [Serp's documentation](https://serpapi.com/search-api) for more information about the service. You can also view [LangChain's documentation on their Serp integration](https://js.langchain.com/docs/integrations/tools/serpapi/).

View n8n's [Advanced AI](https://docs.n8n.io/advanced-ai/) documentation.