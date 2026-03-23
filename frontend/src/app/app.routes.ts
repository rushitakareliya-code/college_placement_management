import { Routes } from '@angular/router';
import { Notices } from './pages/admin/notices/notices';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { Dashboard } from './pages/admin/dashboard/dashboard';
import { Students } from './pages/admin/students/students';
import { Companies } from './pages/admin/companies/companies';
import { Jobs } from './pages/admin/jobs/jobs';
import { Applications } from './pages/admin/applications/applications';
import { HomeComponent } from './pages/user/home/home';
import { LoginComponent } from './pages/user/login/login';
import { SignupComponent } from './pages/user/signup/signup';
import { About } from './pages/user/about/about';
import { JobDetail} from './pages/user/job-detail/job-detail';
import { Contact } from './pages/user/contact/contact';
import { Chat } from './pages/user/chat/chat';
import { Faq } from './pages/user/faq/faq';
import { Terms } from './pages/user/terms/terms';
import { Privacy } from './pages/user/privacy/privacy';
import { StudentGuidelines } from './pages/user/student-guidelines/student-guidelines';
import { RecruiterGuidelines } from './pages/user/recruiter-guidelines/recruiter-guidelines';
import { AdminLoginComponent } from './pages/admin/admin-login/admin-login';
import { AdminAuthGuard } from './guards/admin-auth.guard';

export const routes: Routes = [
    { path: 'admin/login', component: AdminLoginComponent }, 
    {
        path: 'admin',
        component: AdminLayout,
        canActivate: [AdminAuthGuard],
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'students', component: Students },
            { path: 'companies', component: Companies },
            { path: 'jobs', component: Jobs },
            { path: 'applications', component: Applications },
            { path: 'notices', component: Notices },
        ]
    },
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'home', component: HomeComponent },
    { path: 'job/:id', component: JobDetail },
    { path: 'about', component: About },
    { path: 'contact', component: Contact },
    { path: 'chat', component: Chat },
    { path: 'faq', component: Faq },
    { path: 'terms', component: Terms },
    { path: 'privacy', component: Privacy },
    { path: 'student-guidelines', component: StudentGuidelines },
    { path: 'recruiter-guidelines', component: RecruiterGuidelines }
];
