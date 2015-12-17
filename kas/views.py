from __future__ import unicode_literals

from django.shortcuts import render_to_response
from django.template import RequestContext

post_data = {
    'title': 'Kasbeheer',
    'ng_app': 'kas',
    'navbar': {
        'title': 'Kasbeheer',
        'items': [
            ('#/transactions', 'Transacties'),
            ('#/closures', 'Dagafsluitingen'),
            ('#/barcode', 'Barcode Tool'),
        ]
    }
}


def index(request):
    return render_to_response('kas/dashboard.html', post_data, context_instance=RequestContext(request))
