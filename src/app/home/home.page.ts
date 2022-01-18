import { AfterViewInit, ChangeDetectorRef, Component, ElementRef,ViewChild} from '@angular/core';
import { IonButton} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
  page = 'home';

  backdropVisible = false;

  @ViewChild(IonButton, {read: ElementRef}) startButton: ElementRef;

  constructor( private changeDetectorRef: ChangeDetectorRef ) {}

 
  ngAfterViewInit(){
    window.oncontextmenu = function() { return false; } 
  }

  drawerBackground(isVisible){
    this.backdropVisible = isVisible;
    this.changeDetectorRef.detectChanges();
  }

}
