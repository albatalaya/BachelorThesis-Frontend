import { AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { AlertController, GestureController, IonButton } from '@ionic/angular';
import axios from 'axios';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements AfterViewInit {

  @ViewChild(IonButton, {read: ElementRef}) startButton: ElementRef;

  @Input() page='';
  @Input() timer: any;

  @Output('state') state: EventEmitter<string>= new EventEmitter();
  


  buttonName='';
  img_src='';
  
  pressing = false;

  mediaRecorder : MediaRecorder ;
  blob : Blob;
  sendRecording = false;
  
  constructor(public alertController: AlertController, private router: Router, private gesture: GestureController, private zone: NgZone) { }

  ngAfterViewInit(){
    
    switch(this.page) { 
      case 'home': { 
        this.buttonName='START';
        this.img_src='assets/img/play.png';
         break; 
      } 
      case 'start': { 
         this.buttonName='PAUSE';
         this.img_src='assets/img/pause.png';
         break; 
      } 
       


   } 

    this.longPress();

    window.oncontextmenu = function() { return false; } ////////////////////////////////////nomes per veure el longpress amb l ordinador
  }

  longPress(){
    const gesture = this.gesture.create({
      el: this.startButton.nativeElement,
      threshold: 0,
      gestureName: 'long-press',
      onStart: ev => {
        Haptics.impact({style: ImpactStyle.Light});
        this.zone.run(() => {
          this.pressing = true;
        });
        if (this.page=='home' || this.page=='resume'){
          this.audioRecording();
        }

        let startTime = new Date();
        this.starting(startTime);
      },
      onEnd: ev => {
        Haptics.impact({style: ImpactStyle.Light});
        this.zone.run(() => {
          this.pressing = false;
        });
        if (this.page=='home' || this.page=='resume'){
          if(!this.sendRecording){
            this.mediaRecorder.stop();
            axios.post("http://127.0.0.1:8080/status/stop").then((res: any) => {
              console.log(res.data.connection)
            }).catch((err: any) => console.warn(err));
          } else {
            this.sendRecording = false;
          }
        }
      }
    });

    gesture.enable(true);

  }

  starting(startTime){
    let now;
    setTimeout(() => {
      if(this.pressing){
        now = new Date();

        if(now.getTime()-startTime.getTime()>=3000){
          this.zone.run(() => {
            this.pressing = false;

            if (this.page=='home'){
              this.sendRecording = true;
              this.mediaRecorder.stop();
              this.router.navigateByUrl('/home/start');
            }else if (this.page=='start'){
              this.state.emit('PAUSE');
              this.responseAlert("What do you want to do?");
            }else if (this.page=='resume'){
              this.zone.run(() => {
                this.sendRecording = true;
                this.mediaRecorder.stop();
                this.state.emit('PLAY');
                this.page='start';
                this.buttonName='PAUSE';
                this.img_src='assets/img/pause.png';
              });
            }

            
          });
        } else if(now.getTime()-startTime.getTime()>=2000){
            if(this.page=='home' || this.page=='resume'){
              this.mediaRecorder.stop();
              this.mediaRecorder.start();
            }
        } else if(now.getTime()-startTime.getTime()>=1000){
            if(this.page=='home' || this.page=='resume'){
              this.mediaRecorder.stop();
              this.mediaRecorder.start();
            }
        }
        this.starting(startTime);
      }
    },1000)
  }


  async responseAlert(response) {
    const alert = await this.alertController.create({
      message: response,
      buttons: [
        {
        text:'Pause',
        handler: ()=> this.resume()
        },
        {
          text: 'Stop',
          handler: ()=> this.stopOp()
        }
      ],
      backdropDismiss: false,
      cssClass: 'responseAlert'
    });
    await alert.present();
  }
  
  stopOp(){
    this.state.emit('STOP');
    clearInterval(this.timer);
    this.router.navigateByUrl('/home')
  }

  resume(){
    this.zone.run(() => {
      this.page='resume';
      this.buttonName='RESUME';
      this.img_src='assets/img/play.png';
    });
    
  }

  audioRecording(){
    let constraintObj = {
      audio: true,
      video: false
    };

    navigator.mediaDevices.getUserMedia(constraintObj).then(stream => {
      
      let chunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.start();
      
      this. mediaRecorder.ondataavailable= async (event) => {
          chunks.push(event.data);
          this.blob = new Blob(chunks, { 'type' : 'audio/wav' });

          var formdata = new FormData();  
          formdata.append("AudioFile",this.blob, "my_audio.wav");
            
          await axios.post("http://127.0.0.1:8080/status/play", formdata).then((res: any) => {
                
              }).catch((err: any) => {
                console.log('error 3s')
                console.warn(err)
              });


          chunks = [];
          
      }


    }).catch(err => {
      console.log(err);
    });
  }

}
