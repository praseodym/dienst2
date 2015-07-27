from django.db.models import Prefetch
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response, redirect
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.views.generic import DetailView, DeleteView
from haystack.query import SearchQuerySet

from ldb.forms import OrganizationForm, PersonForm, MemberFormSet, StudentFormSet, AlumnusFormSet, EmployeeFormSet, \
    CommitteeMembershipFormSet
from ldb.models import Organization, Person, CommitteeMembership


def index(request):
    post_data = {
        'title': 'Ledendatabase',
        'ng_app': 'ldb',
        'navbar': {
            'title': 'Ledendatabase',
            'items': [
                ('#/dashboard', 'Zoeken'),
                ('#/person/new', 'Nieuw Persoon'),
                ('#/organization/new', 'Nieuwe Organisatie'),
                ('#/committees', 'Commissies'),
                ('#/export', 'Exporteren')
            ]
        }
    }

    if request.user.has_module_perms('admin'):
        post_data['navbar']['items'].append((reverse('admin:ldb_person_changelist'), "Beheer"))

    return render_to_response('ldb/dashboard.html', post_data, context_instance=RequestContext(request))

def index_old(request):
    data = {
        'title' : 'Ledenadministratie'
    }
    return render_to_response( 'ldb/index.html', data,
                               context_instance = RequestContext(request))

def ajax_people_search(request):
    if request.is_ajax():
        q = request.GET.get('q')
        if q is not None:
            results    = SearchQuerySet().auto_query(q)
            # suggestion = results.spelling_suggestion()
            template   = 'ldb/results.html'
            data       = {'results': results[:10], 'count': len(results), 'remainder': len(results)-10}
            return render_to_response( template, data,
                                       context_instance = RequestContext(request))
    else:
        return redirect('ldb_index_old')

class OrganizationDetailView(DetailView):
    context_object_name = 'organization'
    model = Organization

class OrganizationDeleteView(DeleteView):
    context_object_name = 'organization'
    model = Organization
    success_url = '/'

def organization_edit(request, pk=None):
    data = {
        'title' : 'Ledenadministratie'
    }
    if pk:
        organization = Organization.objects.get(pk=pk)
    else:
        organization = Organization()
    if request.method == 'POST':
        form = OrganizationForm(request.POST, instance=organization)
        if form.is_valid():
            person = form.save()
            # FIXME: redirect
            return HttpResponseRedirect(reverse('ldb_organizations_detail', args=(organization.id,)))
    else:
        form = OrganizationForm(instance=organization)
    data['form'] = form
    return render_to_response('ldb/organization_form.html', data,
                              context_instance = RequestContext(request))

class PersonDetailView(DetailView):
    context_object_name = 'person'
    model = Person

    def get_queryset(self):
        qs = super(PersonDetailView, self).get_queryset()
        qs = qs.select_related('member', 'student', 'alumnus', 'employee')
        qs = qs.prefetch_related(
            Prefetch(
                'committee_memberships',
                queryset=CommitteeMembership.objects.order_by('-board').prefetch_related('committee')
            ))
        return qs

class PersonDeleteView(DeleteView):
    context_object_name = 'person'
    model = Person
    success_url = '/'

def person_edit(request, pk=None):
    data = {
        'title' : 'Ledenadministratie'
    }
    if pk:
        person = Person.objects.get(pk=pk)
    else:
        person = Person()
    if request.method == 'POST':
        form = PersonForm(request.POST, instance=person)
        member_formset = MemberFormSet(request.POST, instance=person)
        student_formset = StudentFormSet(request.POST, instance=person)
        alumnus_formset = AlumnusFormSet(request.POST, instance=person)
        employee_formset = EmployeeFormSet(request.POST, instance=person)
        committeemembership_formset = CommitteeMembershipFormSet(request.POST, instance=person)
        if form.is_valid() and \
           member_formset.is_valid() and \
           student_formset.is_valid() and \
           alumnus_formset.is_valid and \
           employee_formset.is_valid() and \
           committeemembership_formset.is_valid():
            person = form.save()

            member_form = member_formset.forms[0]
            if member_form.has_changed():
                member = member_form.save(commit=False)
                member.person = person
                member.save()

            student_form = student_formset.forms[0]
            if student_form.has_changed():
                student = student_form.save(commit=False)
                student.person = person
                student.save()

            alumnus_form = alumnus_formset.forms[0]
            if alumnus_form.has_changed():
                alumnus = alumnus_form.save(commit=False)
                alumnus.person = person
                alumnus.save()

            employee_form = employee_formset.forms[0]
            if employee_form.has_changed():
                employee = employee_form.save(commit=False)
                employee.person = person
                employee.save()

            for form in committeemembership_formset.forms:
                if form.has_changed():
                    committeemembership = form.save(commit=False)
                    committeemembership.person = person
                    committeemembership.save()
            return HttpResponseRedirect(reverse('ldb_people_detail', args=(person.id,)))
    else:
        form = PersonForm(instance=person)
        member_formset = MemberFormSet(instance=person)
        student_formset = StudentFormSet(instance=person)
        alumnus_formset = AlumnusFormSet(instance=person)
        employee_formset = EmployeeFormSet(instance=person)
        committeemembership_formset = CommitteeMembershipFormSet(instance=person)
    data['form'] = form
    data['member_formset'] = member_formset
    data['student_formset'] = student_formset
    data['alumnus_formset'] = alumnus_formset
    data['employee_formset'] = employee_formset
    data['committeemembership_formset'] = committeemembership_formset
    return render_to_response('ldb/person_form.html', data,
                              context_instance = RequestContext(request))
