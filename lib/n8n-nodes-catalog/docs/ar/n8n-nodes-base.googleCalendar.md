# عقدة Google Calendar

استخدم عقدة Google Calendar (تقويم جوجل) لأتمتة سير العمل في Google Calendar، وتكامل Google Calendar مع التطبيقات الأخرى. يدعم n8n بشكل مدمج مجموعة واسعة من ميزات Google Calendar، بما في ذلك إضافة أحداث التقويم واسترجاعها وحذفها وتحديثها.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة Google Calendar وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Google Calendar](/integrations/builtin/credentials/google/index.md) للحصول على إرشادات حول إعداد المصادقة.

> **يمكن استخدام هذه العقدة كأداة ذكاء اصطناعي**
>
> يمكن استخدام هذه العقدة لتعزيز قدرات وكيل الذكاء الاصطناعي. عند استخدامها بهذه الطريقة، يمكن تعيين العديد من المعاملات تلقائيًا، أو بمعلومات موجهة بواسطة الذكاء الاصطناعي - اكتشف المزيد في [توثيق معاملات أداة الذكاء الاصطناعي](/advanced-ai/examples/using-the-fromai-function.md).

## العمليات

*   **التقويم**
    *   [**التوفر**](/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/calendar-operations.md#availability): ما إذا كانت فترة زمنية متاحة في تقويم
*   **الحدث**
    *   [**إنشاء**](/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/event-operations.md#create): إضافة حدث إلى التقويم
    *   [**حذف**](/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/event-operations.md#delete): حذف حدث
    *   [**الحصول على**](/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/event-operations.md#get): استرجاع حدث
    *   [**الحصول على العديد**](/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/event-operations.md#get-many): استرجاع جميع الأحداث من تقويم
    *   [**تحديث**](/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/event-operations.md#update): تحديث حدث

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

يوفر n8n عقدة مُحفِّز لـ Google Calendar. يمكنك العثور على توثيق عقدة المُحفِّز [هنا](/integrations/builtin/trigger-nodes/n8n-nodes-base.googlecalendartrigger.md).

ارجع إلى [توثيق Google Calendar](https://developers.google.com/calendar/api/v3/reference) لمزيد من المعلومات حول الخدمة.

اعرض [سير العمل الأمثلة والمحتوى ذي الصلة](https://n8n.io/integrations/google-calendar/) على موقع n8n الإلكتروني.

---

<!-- vale Vale.Repetition = NO -->
<!-- vale from-write-good.Illusions = NO -->

# عمليات التقويم في Google Calendar
<!-- vale from-write-good.Illusions = YES -->
<!-- vale Vale.Repetition = YES -->

استخدم هذه العملية للتحقق من التوفر في تقويم ضمن Google Calendar. ارجع إلى [Google Calendar](/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/index.md) لمزيد من المعلومات حول عقدة Google Calendar نفسها.

## التوفر

استخدم هذه العملية للتحقق مما إذا كانت فترة زمنية متاحة في تقويم.

أدخل هذه المعاملات:

-   **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد Google Calendar](/integrations/builtin/credentials/google/index.md) موجودة.
-   **Resource**: حدد **Calendar**.
-   **Operation**: حدد **Availability**.
-   **Calendar**: اختر التقويم الذي تريد التحقق منه. حدد **From list** لاختيار العنوان من القائمة المنسدلة أو **By ID** لإدخال معرّف التقويم.
-   **Start Time**: وقت البدء للفترة الزمنية التي تريد التحقق منها. افتراضياً، يستخدم تعبيراً يقيم إلى الوقت الحالي (``).
-   **End Time**: وقت الانتهاء للفترة الزمنية التي تريد التحقق منها. افتراضياً، يستخدم تعبيراً يقيم إلى ساعة من الآن (``).

### الخيارات

-   **Output Format**: حدد التنسيق لمعلومات التوفر:
    -   **Availability**: يُرجع ما إذا كانت هناك أحداث متداخلة بالفعل مع الفترة الزمنية المحددة أم لا.
    -   **Booked Slots**: يُرجع الفترات الزمنية المحجوزة.
    -   **RAW**: يُرجع البيانات الخام من API.
-   **Timezone**: المنطقة الزمنية المستخدمة في الاستجابة. افتراضياً، يستخدم المنطقة الزمنية لـ n8n.

ارجع إلى توثيق API الخاص بـ [Freebusy: query | Google Calendar](https://developers.google.com/calendar/api/v3/reference/freebusy/query) لمزيد من المعلومات.

---

# عمليات الأحداث في Google Calendar

استخدم هذه العمليات لإنشاء الأحداث وحذفها والحصول عليها وتحديثها في Google Calendar. ارجع إلى [Google Calendar](/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/index.md) لمزيد من المعلومات حول عقدة Google Calendar نفسها.

## إنشاء

استخدم هذه العملية لإضافة حدث إلى Google Calendar.

أدخل هذه المعاملات:

-   **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد Google Calendar](/integrations/builtin/credentials/google/index.md) موجودة.
-   **Resource**: حدد **Event**.
-   **Operation**: حدد **Create**.
-   **Calendar**: اختر التقويم الذي تريد إضافة حدث إليه. حدد **From list** لاختيار العنوان من القائمة المنسدلة أو **By ID** لإدخال معرّف التقويم.
-   **Start Time**: وقت البدء للحدث. افتراضياً، يستخدم تعبيراً يقيم إلى الوقت الحالي (``).
-   **End Time**: وقت الانتهاء للحدث. افتراضياً، يستخدم هذا تعبيراً يقيم إلى ساعة من الآن (``).
-   **Use Default Reminders**: ما إذا كان سيتم تمكين التذكيرات الافتراضية للحدث وفقاً لتكوين التقويم.

### الخيارات

-   **All Day**: ما إذا كان الحدث يستمر طوال اليوم أم لا.
-   **Attendees**: الحاضرون المراد دعوتهم إلى الحدث.
-   **Color Name or ID**: لون الحدث. اختر من القائمة أو حدد المعرّف باستخدام تعبير.
-   **Conference Data**: ينشئ رابط مؤتمر (Hangouts، Meet، إلخ) ويرفقه بالحدث.
-   **Description**: وصف للحدث.
-   **Guests Can Invite Others**: ما إذا كان بإمكان الحاضرين بخلاف المنظم دعوة آخرين إلى الحدث.
-   **Guests Can Modify**: ما إذا كان بإمكان الحاضرين بخلاف المنظم تعديل الحدث.
-   **Guests Can See Other Guests**: ما إذا كان بإمكان الحاضرين بخلاف المنظم رؤية من هم حاضرو الحدث.
-   **ID**: معرّف مبهم للحدث.
-   **Location**: الموقع الجغرافي للحدث كنص حر.
-   **Max Attendees**: الحد الأقصى لعدد الحاضرين المراد تضمينهم في الاستجابة. إذا كان هناك عدد أكبر من الحاضرين المحدد، فإنه يعيد المشارك فقط.
-   **Repeat Frequency**: فاصل التكرار للأحداث المتكررة.
-   **Repeat How Many Times?**: عدد النسخ المراد إنشاؤها للأحداث المتكررة.
-   **Repeat Until**: التاريخ الذي يجب أن تتوقف فيه الأحداث المتكررة.
-   **RRULE**: قاعدة التكرار. عند التعيين، يتم تجاهل المعاملات Repeat Frequency و Repeat How Many Times و Repeat Until.
-   **Send Updates**: ما إذا كان سيتم إرسال إشعارات حول إنشاء الحدث الجديد.
-   **Show Me As**: ما إذا كان الحدث يحجز وقتًا في التقويم.
-   **Summary**: عنوان الحدث.

ارجع إلى توثيق [Events: insert | Google Calendar](https://developers.google.com/calendar/api/v3/reference/events/insert) API لمزيد من المعلومات.

## حذف

استخدم هذه العملية لحذف حدث من تقويم Google.

أدخل هذه المعاملات:

-   **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد Google Calendar](/integrations/builtin/credentials/google/index.md) موجودة.
-   **Resource**: حدد **الحدث**.
-   **Operation**: حدد **حذف**.
-   **Calendar**: اختر تقويمًا تريد حذف حدث منه. حدد **من القائمة** لاختيار العنوان من القائمة المنسدلة أو **بواسطة المعرّف** لإدخال معرّف التقويم.
-   **Event ID**: معرّف الحدث المراد حذفه.

### الخيارات

-   **Send Updates**: هل يجب إرسال إشعارات حول حذف الحدث.

ارجع إلى توثيق API [Events: delete | Google Calendar](https://developers.google.com/calendar/api/v3/reference/events/delete) لمزيد من المعلومات.

## الحصول (Get)

استخدم هذه العملية لاسترداد حدث من تقويم Google (Google Calendar).

أدخل هذه المعاملات (parameters):

-   **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد Google Calendar](/integrations/builtin/credentials/google/index.md) موجودة.
-   **Resource**: حدد **Event**.
-   **Operation**: حدد **Get**.
-   **Calendar**: اختر التقويم الذي تريد استرداد حدث منه. حدد **From list** لاختيار العنوان من القائمة المنسدلة أو **By ID** لإدخال معرّف التقويم.
-   **Event ID**: معرّف الحدث المراد استرداده.

### الخيارات

-   **Max Attendees**: العدد الأقصى للحضور المراد تضمينهم في الاستجابة. إذا كان هناك عدد أكبر من الحضور المحدد، فإنه يعيد المشارك فقط.
-   **Return Next Instance of Recurrent Event**: هل يجب إرجاع النسخة (instance) التالية من حدث متكرر بدلاً من الحدث نفسه.
-   **Timezone**: المنطقة الزمنية المستخدمة في الاستجابة. افتراضياً، تستخدم المنطقة الزمنية لـ n8n.

ارجع إلى توثيق API [Events: get | Google Calendar](https://developers.google.com/calendar/api/v3/reference/events/get) لمزيد من المعلومات.

<!-- vale from-write-good.Weasel = NO -->
## الحصول على العديد (Get Many)
<!-- vale from-write-good.Weasel = YES -->

استخدم هذه العملية لاسترداد أكثر من حدث واحد من تقويم Google.

أدخل هذه المعاملات (parameters):

-   **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد Google Calendar](/integrations/builtin/credentials/google/index.md) موجودة.
-   **Resource**: حدد **Event**.
-   **Operation**: حدد **Get Many**.
-   **Calendar**: اختر التقويم الذي تريد استرداد حدث منه. حدد **From list** لاختيار العنوان من القائمة المنسدلة أو **By ID** لإدخال معرّف التقويم.
-   **Return All**: هل يجب إرجاع جميع النتائج أم فقط حتى حد معين.
-   **Limit**: (عند عدم تحديد "Return All") العدد الأقصى للنتائج المراد إرجاعها.
-   **After**: استرداد الأحداث التي تحدث بعد هذا الوقت. يجب أن يكون جزء على الأقل من الحدث بعد هذا الوقت. افتراضياً، يستخدم هذا تعبيراً (expression) يقيم إلى الوقت الحالي (``). قم بتبديل الحقل إلى "fixed" لتحديد تاريخ من أداة اختيار التاريخ.
-   **Before**: استرداد الأحداث التي تحدث قبل هذا الوقت. يجب أن يكون جزء على الأقل من الحدث قبل هذا الوقت. افتراضياً، يستخدم هذا تعبيراً (expression) يقيم إلى الوقت الحالي بالإضافة إلى أسبوع (`{{ $now.plus({ week: 1 }) }}`). قم بتبديل الحقل إلى "fixed" لتحديد تاريخ من أداة اختيار التاريخ.

### الخيارات

-   **Fields**: حدد الحقول المراد إرجاعها. بشكل افتراضي، يتم إرجاع مجموعة من الحقول شائعة الاستخدام والمحددة مسبقًا بواسطة Google. استخدم "*" لإرجاع جميع الحقول. يمكنك معرفة المزيد في [توثيق تقويم Google حول العمل مع الموارد الجزئية](https://developers.google.com/calendar/api/guides/performance#partial).
-   **iCalUID**: يحدد معرّف حدث (بتنسيق iCalendar) لتضمينه في الاستجابة.
-   **Max Attendees**: الحد الأقصى لعدد الحضور المراد تضمينهم في الاستجابة. إذا كان هناك عدد أكبر من الحضور المحدد، يتم إرجاع المشارك فقط.
-   **Order By**: الترتيب الذي سيتم استخدامه للأحداث في الاستجابة.
-   **Query**: مصطلحات بحث نصية حرة للعثور على الأحداث المطابقة. يبحث هذا في جميع الحقول باستثناء الخصائص الموسعة.
-   **Recurring Event Handling**: ما يجب فعله للأحداث المتكررة:
    -   **All Occurrences**: إرجاع جميع نُسخ الحدث المتكرر للنطاق الزمني المحدد.
    -   **First Occurrence**: إرجاع الحدث الأول لحدث متكرر ضمن النطاق الزمني المحدد.
    -   **Next Occurrence**: إرجاع النسخة التالية من حدث متكرر ضمن النطاق الزمني المحدد.
-   **Show Deleted**: ما إذا كان سيتم تضمين الأحداث المحذوفة (ذات الحالة "cancelled") في النتائج.
-   **Show Hidden Invitations**: ما إذا كان سيتم تضمين الدعوات المخفية في النتائج.
-   **Timezone**: المنطقة الزمنية المستخدمة في الاستجابة. بشكل افتراضي، تستخدم المنطقة الزمنية لـ n8n.
-   **Updated Min**: الحدود الدنيا لآخر وقت تعديل لحدث (كـ [طابع زمني RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339))

ارجع إلى توثيق [واجهة برمجة تطبيقات الأحداث: قائمة | تقويم Google](https://developers.google.com/calendar/api/v3/reference/events/list) لمزيد من المعلومات.

## تحديث

استخدم هذه العملية لتحديث حدث في تقويم Google.

أدخل هذه المعاملات:

-   **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد تقويم Google](/integrations/builtin/credentials/google/index.md) موجودة.
-   **Resource**: حدد **حدث**.
-   **Operation**: حدد **تحديث**.
-   **Calendar**: اختر تقويمًا تريد إضافة حدث إليه. حدد **من القائمة** لاختيار العنوان من القائمة المنسدلة أو **حسب المعرّف** لإدخال معرّف التقويم.
-   **Event ID**: معرّف الحدث المراد تحديثه.
-   **Modify**: بالنسبة للأحداث المتكررة، اختر ما إذا كنت تريد تحديث الحدث المتكرر أو نسخة معينة من الحدث المتكرر.
-   **Use Default Reminders**: ما إذا كان سيتم تمكين التذكيرات الافتراضية للحدث وفقًا لتكوين التقويم.
-   **Update Fields**: حقول الحدث المراد تحديثها:
    -   **All Day**: ما إذا كان الحدث يستمر طوال اليوم أم لا.
    -   **Attendees**: الحاضرون المراد دعوتهم إلى الحدث. يمكنك اختيار إضافة حاضرين أو استبدال قائمة الحاضرين الموجودة.
    -   **Color Name or ID**: لون الحدث. اختر من القائمة أو حدد المعرّف باستخدام تعبير.
    -   **Description**: وصف للحدث.
    -   **End**: وقت انتهاء الحدث.
    -   **Guests Can Invite Others**: ما إذا كان يمكن للحاضرين بخلاف المنظم دعوة آخرين إلى الحدث.
    -   **Guests Can Modify**: ما إذا كان يمكن للحاضرين بخلاف المنظم إجراء تغييرات على الحدث.
    -   **Guests Can See Other Guests**: ما إذا كان يمكن للحاضرين بخلاف المنظم رؤية من هم حاضرون الحدث.

- **ID**: معرف مبهم للحدث.
- **Location**: الموقع الجغرافي للحدث كنص حر.
- **Max Attendees**: العدد الأقصى للحضور المراد تضمينهم في الاستجابة. إذا كان هناك عدد أكبر من الحضور المحدد، يتم إرجاع المشارك فقط.
- **Repeat Frequency**: الفاصل الزمني للتكرار للأحداث المتكررة.
- **Repeat How Many Times?**: عدد النسخ المراد إنشاؤها للأحداث المتكررة.
- **Repeat Until**: التاريخ الذي يجب أن تتوقف فيه الأحداث المتكررة.
- **RRULE**: قاعدة التكرار. عند التعيين، يتم تجاهل المعاملات Repeat Frequency و Repeat How Many Times و Repeat Until.
- **Send Updates**: ما إذا كان سيتم إرسال إشعارات حول إنشاء الحدث الجديد.
- **Show Me As**: ما إذا كان الحدث يحجز وقتًا في التقويم.
- **Start**: وقت بدء الحدث.
- **Summary**: عنوان الحدث.
- **Visibility**: رؤية الحدث:
  - **Confidential**: الحدث خاص. يتم توفير هذه القيمة للتوافق.
  - **Default**: يستخدم الرؤية الافتراضية للأحداث في التقويم.
  - **Public**: الحدث عام وتفاصيله مرئية لجميع قراء التقويم.
  - **Private**: الحدث خاص ولا يمكن لغير الحضور عرض تفاصيله.

ارجع إلى توثيق API [Events: update | Google Calendar](https://developers.google.com/calendar/api/v3/reference/events/update) لمزيد من المعلومات.