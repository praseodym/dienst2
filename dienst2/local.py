import ldap

# Example for development purposes only!

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'dienst2',
        'USER': 'dienst2',
        'PASSWORD': '',
        'HOST': 'postgres',
        'PORT': '',
        'CONN_MAX_AGE': 10800,
        'ATOMIC_REQUESTS': True
    }
}

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'CHANGEME'

DEBUG = True
AUTH_LDAP_GLOBAL_OPTIONS = {ldap.OPT_X_TLS_REQUIRE_CERT: ldap.OPT_X_TLS_NEVER}

# Uncomment and edit to override default CH LDAP
# AUTH_LDAP_SERVER_URI = "ldaps://ank.chnet"
# AUTH_LDAP_BIND_DN = ""
# AUTH_LDAP_BIND_PASSWORD = ""
# AUTH_LDAP_USER_DN_TEMPLATE = "uid=%(user)s,ou=People,dc=ank,dc=chnet"
# AUTH_LDAP_GROUP_SEARCH = LDAPSearch("ou=Group,dc=ank,dc=chnet", ldap.SCOPE_SUBTREE, "(objectClass=posixGroup)")
# AUTH_LDAP_GROUP_TYPE = PosixGroupType()
#
# AUTH_LDAP_REQUIRE_GROUP = "cn=dienst2,ou=Group,dc=ank,dc=chnet"
#
# AUTH_LDAP_USER_FLAGS_BY_GROUP = {
#     "is_active": "cn=dienst2,ou=Group,dc=ank,dc=chnet",
#     "is_staff": "cn=dienst2-admin,ou=Group,dc=ank,dc=chnet",
#     "is_superuser": "cn=dienst2-admin,ou=Group,dc=ank,dc=chnet"
# }
#
# AUTH_LDAP_MIRROR_GROUPS = True

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
# STATIC_ROOT = '/tmp/dienst2-static/'

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/static/'

LOGIN_URL = '/accounts/login/'

HAYSTACK_CONNECTIONS = {
    'default': {
        'ENGINE': 'haystack.backends.simple_backend.SimpleEngine'
    },
}

import logging

logger = logging.getLogger('django_auth_ldap')
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.DEBUG)
