# تحرير الحقول (Set)

استخدم عقدة Edit Fields لتعيين بيانات سير العمل. يمكن لهذه العقدة تعيين بيانات جديدة بالإضافة إلى الكتابة فوق البيانات الموجودة بالفعل. تُعد هذه العقدة حاسمة في سير العمل التي تتوقع بيانات واردة من العقد السابقة، مثل عند إدراج قيم في جداول بيانات Google أو قواعد البيانات.

## معاملات العقدة

فيما يلي الإعدادات والخيارات المتاحة في عقدة Edit Fields.

### الوضع

يمكنك إما استخدام **Manual Mapping** لتحرير الحقول باستخدام واجهة المستخدم الرسومية (GUI) أو **JSON Output** لكتابة JSON الذي تضيفه n8n إلى بيانات المدخلات.

### الحقول المراد تعيينها

إذا حددت **Mode** > **Manual Mapping**، يمكنك تكوين الحقول عن طريق سحب وإفلات القيم من **INPUT**.

السلوك الافتراضي عند سحب قيمة هو:

*   تعيّن n8n اسم القيمة كاسم للحقل.
*   تحتوي قيمة الحقل على تعبير يصل إلى القيمة.

إذا كنت لا ترغب في استخدام تعبيرات:

1.  مرر مؤشر الفأرة فوق حقل. تعرض n8n مفتاح التبديل **Fixed | Expressions**.
2.  حدد **Fixed**.

يمكنك القيام بذلك لكل من اسم الحقل وقيمته.

![صورة متحركة توضح إجراء السحب والإفلات، بالإضافة إلى تغيير حقل إلى ثابت](/_images/integrations/builtin/core-nodes/set/drag-drop-fixed-toggle.gif)

### الاحتفاظ بالحقول المعينة فقط

قم بتمكين هذا لتجاهل أي بيانات مدخلات لا تستخدمها في **Fields to Set**.

### التضمين في المخرجات

اختر أي بيانات مدخلات لتضمينها في بيانات مخرجات العقدة.

## خيارات العقدة

استخدم هذه الخيارات لتخصيص سلوك العقدة.

### تضمين البيانات الثنائية

إذا كانت بيانات المدخلات تتضمن بيانات ثنائية، فاختر ما إذا كنت تريد تضمينها في بيانات مخرجات عقدة Edit Fields.

### تجاهل أخطاء تحويل النوع

لـ Manual Mapping فقط.

يسمح تمكين هذا لـ n8n بتجاهل بعض أخطاء أنواع البيانات عند تعيين الحقول.

### دعم تدوين النقطة

بشكل افتراضي، تدعم n8n تدوين النقطة.

على سبيل المثال، عند استخدام التعيين اليدوي، تتبع العقدة تدوين النقطة لحقل **Name**. هذا يعني أنه إذا قمت بتعيين الاسم في حقل **Name** كـ `number.one` والقيمة في حقل **Value** كـ `20`، فإن JSON الناتج يكون:

```json
{ "number": { "one": 20} }
```

يمكنك منع هذا السلوك عن طريق تحديد **Add Option** > **Support Dot Notation**، وتعيين حقل **Dot Notion** إلى إيقاف التشغيل. الآن يكون JSON الناتج هو:

```json
{ "number.one": 20 }
```

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## المصفوفات والتعبيرات في وضع JSON Output

يمكنك استخدام المصفوفات والتعبيرات عند إنشاء JSON Output الخاص بك.

على سبيل المثال، بالنظر إلى بيانات المدخلات (Input) هذه التي تم إنشاؤها بواسطة عقدة Customer Datastore (مخزن بيانات العملاء):

```json
[
  {
    "id": "23423532",
    "name": "Jay Gatsby",
    "email": "gatsby@west-egg.com",
    "notes": "Keeps asking about a green light??",
    "country": "US",
    "created": "1925-04-10"
  },
  {
    "id": "23423533",
    "name": "José Arcadio Buendía",
    "email": "jab@macondo.co",
    "notes": "Lots of people named after him. Very confusing",
    "country": "CO",
    "created": "1967-05-05"
  },
  {
    "id": "23423534",
    "name": "Max Sendak",
    "email": "info@in-and-out-of-weeks.org",
    "notes": "Keeps rolling his terrible eyes",
    "country": "US",
    "created": "1963-04-09"
  },
  {
    "id": "23423535",
    "name": "Zaphod Beeblebrox",
    "email": "captain@heartofgold.com",
    "notes": "Felt like I was talking to more than one person",
    "country": null,
    "created": "1979-10-12"
  },
  {
    "id": "23423536",
    "name": "Edmund Pevensie",
    "email": "edmund@narnia.gov",
    "notes": "Passionate sailor",
    "country": "UK",
    "created": "1950-10-16"
  }
]
```

أضف JSON التالي في حقل **JSON Output**، مع تعيين **Include in Output** إلى **All Input Fields**:

```json
{
  "newKey": "new value",
  "array": [,""],
  "object": {
    "innerKey1": "new value",
    "innerKey2": "",
    "innerKey3": "",
 }
}
```

تحصل على المخرجات (Output) التالية:

```json
[
  {
    "id": "23423532",
    "name": "Jay Gatsby",
    "email": "gatsby@west-egg.com",
    "notes": "Keeps asking about a green light??",
    "country": "US",
    "created": "1925-04-10",
    "newKey": "new value",
    "array": [
      23423532,
      "Jay Gatsby"
    ],
    "object": {
      "innerKey1": "new value",
      "innerKey2": "23423532",
      "innerKey3": "Jay Gatsby"
    }
  },
  {
    "id": "23423533",
    "name": "José Arcadio Buendía",
    "email": "jab@macondo.co",
    "notes": "Lots of people named after him. Very confusing",
    "country": "CO",
    "created": "1967-05-05",
    "newKey": "new value",
    "array": [
      23423533,
      "José Arcadio Buendía"
    ],
    "object": {
      "innerKey1": "new value",
      "innerKey2": "23423533",
      "innerKey3": "José Arcadio Buendía"
    }
  },
  {
    "id": "23423534",
    "name": "Max Sendak",
    "email": "info@in-and-out-of-weeks.org",
    "notes": "Keeps rolling his terrible eyes",
    "country": "US",
    "created": "1963-04-09",
    "newKey": "new value",
    "array": [
      23423534,
      "Max Sendak"
    ],
    "object": {
      "innerKey1": "new value",
      "innerKey2": "23423534",
      "innerKey3": "Max Sendak"
    }
  },
  {
    "id": "23423535",
    "name": "Zaphod Beeblebrox",
    "email": "captain@heartofgold.com",
    "notes": "Felt like I was talking to more than one person",
    "country": null,
    "created": "1979-10-12",
    "newKey": "new value",
    "array": [
      23423535,
      "Zaphod Beeblebrox"
    ],
    "object": {
      "innerKey1": "new value",
      "innerKey2": "23423535",
      "innerKey3": "Zaphod Beeblebrox"
    }
  },
  {
    "id": "23423536",
    "name": "Edmund Pevensie",
    "email": "edmund@narnia.gov",
    "notes": "Passionate sailor",
    "country": "UK",
    "created": "1950-10-16",
    "newKey": "new value",
```

```json
    "array": [
      23423536,
      "Edmund Pevensie"
    ],
    "object": {
      "innerKey1": "new value",
      "innerKey2": "23423536",
      "innerKey3": "Edmund Pevensie"
    }
  }
]
```