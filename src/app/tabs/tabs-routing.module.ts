import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

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
        loadChildren: () => import('../pages/admin/admin.module').then(m => m.AdminPageModule)
      },
      {
        path: 'register',
        loadChildren: () => import('../pages/register/register.module').then(m => m.RegisterPageModule)
      },
      {
        path: 'detail/:id',
        loadChildren: () => import('../pages/detail/detail.module').then(m => m.DetailPageModule)
      },
      {
        path: 'edit-post/:id',
        loadChildren: () => import('../pages/edit-post/edit-post.module').then(m => m.EditPostPageModule)
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
