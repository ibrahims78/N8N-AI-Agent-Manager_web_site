---
title: n8n public REST API Documentation and Guides
description: Access n8n public REST API documentation and guides. Find comprehensive resources to programmatically perform tasks with the public API instead of the GUI.
contentType: overview
search:
    boost: 5
hide:
  - feedback
  - kapaButton
---

# واجهة REST العامة لـ n8n

/// info | Feature availability
The n8n API isn't available during the free trial. Please upgrade to access this feature.  
///


باستخدام [API] العامة لـ n8n [API](/glossary.md#api)، يمكن تنفيذ العديد من المهام نفسها التي يمكن تنفيذها في الواجهة الرسومية للمستخدم برمجياً. تُقدم هذه الفقرة مقدمة عن REST API لـ n8n، بما في ذلك:

* كيفية [المصادقة](/api/authentication.md)
* [ترقيم الصفحات](/api/pagination.md) للنتائج
* باستخدام [ساحة تجربة API المدمجة](/api/using-api-playground.md) (n8n مُستضافة محلياً فقط)
* [مرجع نقاط النهاية](/api/api-reference.md)

تُوفر n8n عقدة [n8n API node](/integrations/builtin/core-nodes/n8n-nodes-base.n8n.md) للوصول إلى API داخل سير عملك. (n8n API node — عقدة API لـ n8n)

## تعلم حول واجهات REST

تفترض وثائق API أنك على دراية بـواجهات REST. إذا لم تكن كذلك، فربما تكون هذه الموارد مفيدة:

* [دليل KnowledgeOwl للعمل مع واجهات برمجة التطبيقات](https://support.knowledgeowl.com/help/working-with-apis): مقدمة أساسية، تتضمن أمثلة حول كيفية استدعاء واجهات REST.
* [IBM Cloud Learn Hub - ما هو واجهة برمجة تطبيقات (API)](https://www.ibm.com/cloud/learn/api): تقدم مقدمة عامة، تقنية، عن واجهات البرمجة.
* [IBM Cloud Learn Hub - ما هي REST API؟](https://www.ibm.com/cloud/learn/rest-apis): معلومات أكثر تفصيلاً حول واجهات REST.
* [MDN web docs - نظرة عامة على HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview): تعمل واجهات REST عبر HTTP وتستخدم أفعال HTTP، أو أساليب، لتحديد الإجراء المطلوب.

/// tip | استخدم ساحة API التجريبية
إن تجربة API في [playground](/api/using-api-playground.md) يمكن أن تساعدك على فهم كيفية عمل واجهات API. إذا كنت قلقاً بشأن تغيير البيانات الحية، فكر في إنشاء سير عمل اختبار، أو نسخة تجربة من n8n، لاستكشاف الأمان.