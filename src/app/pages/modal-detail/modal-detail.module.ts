import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalDetailPageRoutingModule } from './modal-detail-routing.module';

import { ModalDetailPage } from './modal-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalDetailPageRoutingModule
  ],
  declarations: [ModalDetailPage]
})
export class ModalDetailPageModule {}
