import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerComponent } from './drawer/drawer.component';
import { ButtonComponent } from './button/button.component';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [DrawerComponent, ButtonComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [DrawerComponent, ButtonComponent]
})
export class SharedComponentsModule { }
