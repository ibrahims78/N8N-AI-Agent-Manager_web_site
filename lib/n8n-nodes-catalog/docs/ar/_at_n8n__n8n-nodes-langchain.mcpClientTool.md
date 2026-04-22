# عقدة MCP Client Tool

عقدة MCP Client Tool (أداة عميل بروتوكول سياق النموذج) هي عميل [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction)، تسمح لك باستخدام الأدوات المعروضة بواسطة خادم MCP خارجي. يمكنك ربط عقدة MCP Client Tool بنماذجك لاستدعاء أدوات خارجية باستخدام وكلاء n8n.

> **بيانات الاعتماد**
>
> تدعم عقدة MCP Client Tool طرق المصادقة [Bearer](/integrations/builtin/credentials/httprequest.md#using-bearer-auth)، و[الرأس العام](/integrations/builtin/credentials/httprequest.md#using-header-auth)، و[OAuth2](/integrations/builtin/credentials/httprequest.md#using-oauth2).

## معاملات العقدة

قم بتكوين العقدة بالمعاملات التالية.

*   **SSE Endpoint**: نقطة نهاية SSE لخادم MCP الذي ترغب في الاتصال به.
*   **Authentication**: طريقة المصادقة للمصادقة على خادم MCP الخاص بك. تدعم أداة MCP المصادقة [bearer](/integrations/builtin/credentials/httprequest.md#using-bearer-auth)، و[الرأس العام](/integrations/builtin/credentials/httprequest.md#using-header-auth)، و[OAuth2](/integrations/builtin/credentials/httprequest.md#using-oauth2). حدد **None** لمحاولة الاتصال بدون مصادقة.
*   **Tools to Include**: اختر الأدوات التي تريد عرضها لوكيل الذكاء الاصطناعي:
    *   **All**: عرض جميع الأدوات المقدمة من خادم MCP.
    *   **Selected**: ينشط معامل **Tools to Include** حيث يمكنك تحديد الأدوات التي تريد عرضها لوكيل الذكاء الاصطناعي.
    *   **All Except**: ينشط معامل **Tools to Exclude** حيث يمكنك تحديد الأدوات التي تريد تجنب مشاركتها مع وكيل الذكاء الاصطناعي. سيتمكن وكيل الذكاء الاصطناعي من الوصول إلى جميع أدوات خادم MCP التي لم يتم تحديدها.

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

لدى n8n أيضاً عقدة [MCP Server Trigger](/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger.md) (مُحفِّز خادم MCP) التي تسمح لك بعرض أدوات n8n لوكلاء الذكاء الاصطناعي الخارجيين.

ارجع إلى [توثيق MCP](https://modelcontextprotocol.io/introduction) و[مواصفات MCP](https://modelcontextprotocol.io/specification/) لمزيد من التفاصيل حول البروتوكول والخوادم والعملاء.

ارجع إلى [توثيق LangChain حول الأدوات](https://langchain-ai.github.io/langgraphjs/how-tos/tool-calling/) لمزيد من المعلومات حول الأدوات في LangChain.

اطلع على [توثيق n8n للذكاء الاصطناعي المتقدم](/advanced-ai/index.md).