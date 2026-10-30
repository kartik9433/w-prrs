import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ModerationDashboardComponent } from './components/moderation-dashboard/moderation-dashboard.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: ProductListComponent, title: 'W-PRRS | Products & Reviews' },
  { path: 'products/:id', component: ProductDetailComponent, title: 'W-PRRS | Product Details & Reviews' },
  { path: 'moderation', component: ModerationDashboardComponent, title: 'W-PRRS | Moderation Queue' },
  { path: 'users/:id/reviews', component: UserProfileComponent, title: 'W-PRRS | User Reviews' },
  { path: '**', redirectTo: 'products' }
];
