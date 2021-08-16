import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../pages/home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'addPost',
        loadChildren: () => import('../pages/add-post/add-post.module').then(m => m.AddPostPageModule)
      },
      {
        path: 'about',
        loadChildren: () => import('../pages/about/about.module').then(m => m.AboutPageModule)
      },
      {
        path: 'login',
        loadChildren: () => import('../pages/login/login.module').then(m => m.LoginPageModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('../pages/admin/admin.module').then(m => m.AdminPageModule),
        canActivate:[AuthGuard]
      },
      {
        path: 'register',
        loadChildren: () => import('../pages/register/register.module').then(m => m.RegisterPageModule),
        canActivate:[AuthGuard]
      },
      {
        path: 'detail/:id',
        loadChildren: () => import('../pages/detail/detail.module').then(m => m.DetailPageModule)
      },
      {
        path: 'edit-post/:id',
        loadChildren: () => import('../pages/edit-post/edit-post.module').then(m => m.EditPostPageModule),
        canActivate:[AuthGuard]
      },
      {
        path: 'disclaimer',
        loadChildren: () => import('../pages/disclaimer/disclaimer.module').then(m => m.DisclaimerPageModule)
      },
      {
        path: 'location',
        loadChildren: () => import('../pages/location/location.module').then(m => m.LocationPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    redirectTo: '/tabs/admin',
    pathMatch: 'full'
  },
  {
    path: 'register',
    redirectTo: '/tabs/register',
    pathMatch: 'full'
  },
  {
    path: 'login',
    redirectTo: '/tabs/login',
    pathMatch: 'full'
  },
  {
    path: 'detail/:id',
    redirectTo: '/tabs/detail/:id',
    pathMatch: 'full'
  },
  {
    path: 'edit-post/:id',
    redirectTo: '/tabs/edit-post/:id',
    pathMatch: 'full',
    canActivate:[AuthGuard]
  },
  {
    path: 'location',
    redirectTo: '/tabs/location',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
