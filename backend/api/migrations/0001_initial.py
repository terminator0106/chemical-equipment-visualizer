from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Dataset',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file_name', models.CharField(max_length=255)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('summary', models.JSONField()),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='datasets', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-uploaded_at', '-id'],
            },
        ),
    ]
