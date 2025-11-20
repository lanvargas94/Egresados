import { Routes } from '@angular/router';
import { IdentificationComponent } from './components/identification.component';
import { OnboardingStep1Component } from './components/onboarding-step1.component';
import { OnboardingStep2Component } from './components/onboarding-step2.component';
import { OnboardingStep3Component } from './components/onboarding-step3.component';
import { PanelComponent } from './components/panel.component';
import { onboardingGuard } from './guards/onboarding.guard';
import { ConfirmEmailComponent } from './components/confirm-email.component';
import { NewsListComponent } from './components/news-list.component';
import { JobsListComponent } from './components/jobs-list.component';
import { JobDetailComponent } from './components/job-detail.component';
import { EventsListComponent } from './components/events-list.component';
import { LoginOtpComponent } from './components/login-otp.component';
import { AdminLoginComponent } from './components/admin-login.component';
import { AdminNewsListComponent } from './components/admin-news-list.component';
import { AdminNewsFormComponent } from './components/admin-news-form.component';
import { AdminJobsListComponent } from './components/admin-jobs-list.component';
import { AdminJobsFormComponent } from './components/admin-jobs-form.component';
import { adminGuard } from './guards/admin.guard';
import { AdminEventsListComponent } from './components/admin-events-list.component';
import { AdminEventsFormComponent } from './components/admin-events-form.component';
import { AdminAnalyticsComponent } from './components/admin-analytics.component';
import { AdminReportsComponent } from './components/admin-reports.component';
import { AdminExportHistoryComponent } from './components/admin-export-history.component';
import { ProfileComponent } from './components/profile.component';
import { AdminSectorsComponent } from './components/admin-sectors.component';
import { AdminContractTypesComponent } from './components/admin-contract-types.component';
import { AdminGraduatesListComponent } from './components/admin-graduates-list.component';
import { AdminGraduateDetailComponent } from './components/admin-graduate-detail.component';
import { AdminLayoutComponent } from './components/admin-layout.component';
import { AdminBannersListComponent } from './components/admin-banners-list.component';
import { AdminBannersFormComponent } from './components/admin-banners-form.component';
import { AdminUsersListComponent } from './components/admin-users-list.component';
import { AdminUsersFormComponent } from './components/admin-users-form.component';
import { AdminCatalogsComponent } from './components/admin-catalogs.component';
import { AdminAuditLogComponent } from './components/admin-audit-log.component';

export const appRoutes: Routes = [
  { path: '', component: IdentificationComponent },
  { path: 'confirmar', component: ConfirmEmailComponent },
  { path: 'login', component: LoginOtpComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: 'graduates', component: AdminGraduatesListComponent },
      { path: 'graduates/:id', component: AdminGraduateDetailComponent },
      { path: 'news', component: AdminNewsListComponent },
      { path: 'news/new', component: AdminNewsFormComponent },
      { path: 'news/:id', component: AdminNewsFormComponent },
      { path: 'jobs', component: AdminJobsListComponent },
      { path: 'jobs/new', component: AdminJobsFormComponent },
      { path: 'jobs/:id', component: AdminJobsFormComponent },
      { path: 'events', component: AdminEventsListComponent },
      { path: 'events/new', component: AdminEventsFormComponent },
      { path: 'events/:id', component: AdminEventsFormComponent },
      { path: 'analytics', component: AdminAnalyticsComponent },
      { path: 'reports', component: AdminReportsComponent },
      { path: 'reports/history', component: AdminExportHistoryComponent },
      { path: 'banners', component: AdminBannersListComponent },
      { path: 'banners/new', component: AdminBannersFormComponent },
      { path: 'banners/:id', component: AdminBannersFormComponent },
      { path: 'users', component: AdminUsersListComponent },
      { path: 'users/new', component: AdminUsersFormComponent },
      { path: 'users/:id', component: AdminUsersFormComponent },
      { path: 'catalog', component: AdminCatalogsComponent },
      { path: 'catalog/sectors', component: AdminSectorsComponent },
      { path: 'catalog/contract-types', component: AdminContractTypesComponent },
      { path: 'audit', component: AdminAuditLogComponent },
      { path: '', redirectTo: 'graduates', pathMatch: 'full' }
    ]
  },
  { path: 'profile', component: ProfileComponent, canActivate: [onboardingGuard] },
  { path: 'onboarding/step1', component: OnboardingStep1Component, canActivate: [onboardingGuard] },
  { path: 'onboarding/step2', component: OnboardingStep2Component, canActivate: [onboardingGuard] },
  { path: 'onboarding/step3', component: OnboardingStep3Component, canActivate: [onboardingGuard] },
  { path: 'panel', component: PanelComponent, canActivate: [onboardingGuard] },
  { path: 'news', component: NewsListComponent, canActivate: [onboardingGuard] },
  { path: 'jobs', component: JobsListComponent, canActivate: [onboardingGuard] },
  { path: 'jobs/:id', component: JobDetailComponent, canActivate: [onboardingGuard] },
  { path: 'events', component: EventsListComponent, canActivate: [onboardingGuard] },
  { path: '**', redirectTo: '' }
];
