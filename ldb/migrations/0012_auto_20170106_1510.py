# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-01-06 14:10
from __future__ import unicode_literals

from django.db import migrations
import ldb.models


class Migration(migrations.Migration):

    dependencies = [
        ('ldb', '0011_auto_20160914_1529'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='_membership_status',
            field=ldb.models.MembershipStatusField(db_column='membership_status', default=0, enum=ldb.models.MembershipStatus),
        ),
    ]
