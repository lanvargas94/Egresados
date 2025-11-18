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

export const appRoutes: Routes = [
  { path: '', component: IdentificationComponent },
  { path: 'confirmar', component: ConfirmEmailComponent },
  { path: 'login', component: LoginOtpComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/news', component: AdminNewsListComponent, canActivate: [adminGuard] },
  { path: 'admin/news/new', component: AdminNewsFormComponent, canActivate: [adminGuard] },
  { path: 'admin/news/:id', component: AdminNewsFormComponent, canActivate: [adminGuard] },
  { path: 'admin/jobs', component: AdminJobsListComponent, canActivate: [adminGuard] },
  { path: 'admin/jobs/new', component: AdminJobsFormComponent, canActivate: [adminGuard] },
  { path: 'admin/jobs/:id', component: AdminJobsFormComponent, canActivate: [adminGuard] },
  { path: 'admin/events', component: AdminEventsListComponent, canActivate: [adminGuard] },
  { path: 'admin/events/new', component: AdminEventsFormComponent, canActivate: [adminGuard] },
  { path: 'admin/events/:id', component: AdminEventsFormComponent, canActivate: [adminGuard] },
  { path: 'admin/analytics', component: AdminAnalyticsComponent, canActivate: [adminGuard] },
  { path: 'admin/reports', component: AdminReportsComponent, canActivate: [adminGuard] },
  { path: 'admin/reports/history', component: AdminExportHistoryComponent, canActivate: [adminGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [onboardingGuard] },
  { path: 'admin/catalog/sectors', component: AdminSectorsComponent, canActivate: [adminGuard] },
  { path: 'admin/catalog/contract-types', component: AdminContractTypesComponent, canActivate: [adminGuard] },
  { path: 'onboarding/step1', component: OnboardingStep1Component, canActivate: [onboardingGuard] },
  { path: 'onboarding/step2', component: OnboardingStep2Component, canActivate: [onboardingGuard] },
  { path: 'onboarding/step3', component: OnboardingStep3Component, canActivate: [onboardingGuard] },
  { path: 'panel', component: PanelComponent, canActivate: [onboardingGuard] },
  { path: 'news', component: NewsListComponent, canActivate: [onboardingGuard] },
  { path: 'jobs', component: JobsListComponent, canActivate: [onboardingGuard] },
  { path: 'events', component: EventsListComponent, canActivate: [onboardingGuard] },
  { path: '**', redirectTo: '' }
];
