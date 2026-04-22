---
title: طرق إعدادات n8n
description: كيفية تعيين المتغيرات البيئية لـ n8n.
contentType: howto
---

# الإعدادات

يمكنك تغيير إعدادات n8n باستخدام المتغيرات البيئية. للحصول على قائمة كاملة بالإعدادات المتاحة راجع [المتغيرات البيئية](/hosting/configuration/environment-variables/index.md).

## تعيين المتغيرات البيئية عبر سطر الأوامر

### npm

بالنسبة لـ npm، قم بتعيين المتغيرات البيئية المطلوبة في الطرفية. يعتمد الأمر على سطر الأوامر لديك.

واجهات Bash لسطر الأوامر:

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

في Docker، يمكنك استخدام الخيار `-e` من سطر الأوامر:

```bash
docker run -it --rm \
 --name n8n \
 -p 5678:5678 \
 -e N8N_TEMPLATES_ENABLED="false" \
 docker.n8n.io/n8nio/n8n
```

## ملف Docker Compose

في Docker، يمكنك تعيين متغيراتك البيئية في عنصر `n8n: environment:` من ملف `docker-compose.yaml` لديك.

على سبيل المثال:

```yaml
n8n:
    environment:
      - N8N_TEMPLATES_ENABLED=false
```

## تخزين البيانات الحساسة في ملفات منفصلة

يمكنك إضافة `_FILE` إلى كل متغير بيئي لتوفير إعداده في ملف منفصل، مما يتيح لك تجنب تمرير التفاصيل الحساسة عبر المتغيرات البيئية. يقوم n8n بتحميل البيانات من الملف بالاسم المعطى، مما يجعل من الممكن تحميل البيانات من [Docker-Secrets](https://docs.docker.com/engine/swarm/secrets/) و [Kubernetes-Secrets](https://kubernetes.io/docs/concepts/configuration/secret/).

انظر إلى [المتغيرات البيئية](/hosting/configuration/environment-variables/index.md) لمزيد من التفاصيل حول كل متغير.

بينما يمكن لمعظم المتغيرات البيئية استخدام لاحقة `_FILE`، فإنها تكون أكثر فائدة للبيانات الحساسة مثل [بيانات الاعتماد](/glossary.md#credential-n8n) وتكوين قاعدة البيانات. فيما يلي بعض الأمثلة:

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