import { AfterViewInit, Component, ElementRef, Output, ViewChild } from '@angular/core';
import { GestureController, Platform } from '@ionic/angular';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
})
export class DrawerComponent implements AfterViewInit{
  @ViewChild('drawer', {read: ElementRef}) drawer: ElementRef;
  @Output('openStateChanged') openState: EventEmitter<boolean>= new EventEmitter();

  isOpen=false;
  openingHeight = 0;
  constructor(private platform:Platform, private gesture: GestureController) { } 
  
  async ngAfterViewInit(){
    const drawer = this.drawer.nativeElement;
    this.openingHeight = (this.platform.height()/100)*50// obertura màxima

    const gesture = await this.gesture.create({ // swiping the drawer to open
      el: drawer,
      gestureName: 'swipe',
      direction: 'y',
      onMove: ev => {
        if(ev.deltaY < -this.openingHeight) return;
        drawer.style.transform = `translateY(${ev.deltaY}px)`;
      },
      onEnd: ev => {
        if(ev.deltaY < -50 && !this.isOpen) { //pujada

          drawer.style.transition = '.4s ease-out';
          drawer.style.transform = `translateY(${-this.openingHeight}px)`;
          this.openState.emit(true);
          this.isOpen = true;

        } else if (ev.deltaY > 50 && this.isOpen){ //baixada

          drawer.style.transition = '.4s ease-out';
          drawer.style.transform = '';
          this.openState.emit(false);
          this.isOpen = false;

        } else {
          drawer.style.transition = '.4s ease-out';
          drawer.style.transform = '';
          this.openState.emit(false);
          this.isOpen = false;
        }
      }
    });
    gesture.enable(true);
  }

  clickDrawer(){ //clicking on the drawer to open
    const drawer = this.drawer.nativeElement;
    this.openState.emit(!this.isOpen);

    if(this.isOpen) {
      drawer.style.transition = '.4s ease-out';
      drawer.style.transform = '';
      this.isOpen = false;
    } else {
      drawer.style.transition = '.4s ease-in';
      drawer.style.transform = `translateY(${-this.openingHeight}px)`;
      this.isOpen = true;
    }
  }
}
