import { Routes } from '@angular/router';
import { Notices } from './pages/admin/notices/notices';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { Dashboard } from './pages/admin/dashboard/dashboard';
import { Students } from './pages/admin/students/students';
import { Companies } from './pages/admin/companies/companies';
import { Jobs } from './pages/admin/jobs/jobs';
import { Applications } from './pages/admin/applications/applications';

export const routes: Routes = [
    {
        path: 'admin',
        component: AdminLayout,
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'students', component: Students },
            { path: 'companies', component: Companies },
            { path: 'jobs', component: Jobs },
            { path: 'applications', component: Applications },
            { path: 'notices', component: Notices }
        ]
    }

];
