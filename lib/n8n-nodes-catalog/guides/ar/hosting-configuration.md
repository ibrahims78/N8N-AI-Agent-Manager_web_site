---
title: طرق التهيئة
description: كيفية تعيين متغيرات البيئة لـ n8n.
contentType: howto
---

# التهيئة

يمكنك تغيير إعدادات n8n باستخدام متغيرات البيئة. للاطلاع على قائمة كاملة بالتهيئات المتاحة، راجع [متغيرات البيئة](/hosting/configuration/environment-variables/index.md).

## تعيين متغيرات البيئة عبر سطر الأوامر

### npm

بالنسبة لـ npm، عيّن متغيرات البيئة المطلوبة في الطرفية. يعتمد الأمر على سطر الأوامر الخاص بك.

واجهات سطر أوامر Bash:

```bash
export <variable>=<value>
```

في cmd.exe:

```bash
set <variable>=<value>
```

في PowerShell:

```powershell
$env:<variable>=<value>
```

### Docker

في Docker، يمكنك استخدام العلامة `-e` من سطر الأوامر:

```bash
docker run -it --rm \
 --name n8n \
 -p 5678:5678 \
 -e N8N_TEMPLATES_ENABLED="false" \
 docker.n8n.io/n8nio/n8n
```

## ملف Docker Compose

في Docker، يمكنك تعيين متغيرات البيئة الخاصة بك في العنصر `n8n: environment:` ضمن ملف `docker-compose.yaml` الخاص بك.

على سبيل المثال:

```yaml
n8n:
    environment:
      - N8N_TEMPLATES_ENABLED=false
```

## الاحتفاظ بالبيانات الحساسة في ملفات منفصلة

يمكنك إلحاق `_FILE` بمتغيرات البيئة الفردية لتوفير تهيئتها في ملف منفصل، مما يتيح لك تجنب تمرير التفاصيل الحساسة باستخدام متغيرات البيئة. يقوم n8n بتحميل البيانات من الملف بالاسم المحدد، مما يجعل من الممكن تحميل البيانات من [Docker-Secrets](https://docs.docker.com/engine/swarm/secrets/) و [Kubernetes-Secrets](https://kubernetes.io/docs/concepts/configuration/secret/).

ارجع إلى [متغيرات البيئة](/hosting/configuration/environment-variables/index.md) للحصول على تفاصيل حول كل متغير.

بينما يمكن لمعظم متغيرات البيئة استخدام اللاحقة `_FILE`، إلا أنها أكثر فائدة للبيانات الحساسة مثل [بيانات الاعتماد](/glossary.md#credential-n8n) وتهيئة قاعدة البيانات. فيما يلي بعض الأمثلة:

```yaml
CREDENTIALS_OVERWRITE_DATA_FILE=/path/to/credentials_data
DB_TYPE_FILE=/path/to/db_type
DB_POSTGRESDB_DATABASE_FILE=/path/to/database_name
DB_POSTGRESDB_HOST_FILE=/path/to/database_host
DB_POSTGRESDB_PORT_FILE=/path/to/database_port
DB_POSTGRESDB_USER_FILE=/path/to/database_user
DB_POSTGRESDB_PASSWORD_FILE=/path/to/database_password
DB_POSTGRESDB_SCHEMA_FILE=/path/to/database_schema
DB_POSTGRESDB_SSL_CA_FILE=/path/to/ssl_ca
DB_POSTGRESDB_SSL_CERT_FILE=/path/to/ssl_cert
DB_POSTGRESDB_SSL_KEY_FILE=/path/to/ssl_key
DB_POSTGRESDB_SSL_REJECT_UNAUTHORIZED_FILE=/path/to/ssl_reject_unauth
```