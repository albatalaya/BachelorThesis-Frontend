import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { Haptics, ImpactStyle } from '@capacitor/haptics';


@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit {
  page = 'start';
  time = new Date(0, 0, 0, 0, 0, 0);
  timer: any;
  pause = false;
  recording= false;
  mediaRecorder : MediaRecorder ;


  constructor() {}


  ngOnInit() { 
    this.start();

    this.startAudioRecording();
  
  }
  
  start() {
    this.timer = setInterval(() => {
      if(!this.pause){
          this.time.setSeconds(this.time.getSeconds()+1);
          this.mediaRecorder.stop();
          this.mediaRecorder.start();
      }
    }, 1000)
  }

  changeState(state){
    switch(state){
      case 'PLAY':{
        this.pause = false;
        this.mediaRecorder.start();
        break;
      }
      case 'PAUSE': {
        this.pause = true;
        this.mediaRecorder.stop();

        axios.post("http://193.170.63.37:8080/status/pause").then((res: any) => {
          console.log(res.data.connection)
        }).catch((err: any) => console.warn(err)); 

        break;
      }
      case 'STOP': {
        this.pause = true; 

        axios.post("http://193.170.63.37:8080/status/stop").then((res: any) => {
          console.log(res.data.connection)
        }).catch((err: any) => console.warn(err));  

        break;
      }
    }

  }

  
  startAudioRecording(){
    let constraintObj = {
      audio: true,
      video: false
    };

    navigator.mediaDevices.getUserMedia(constraintObj).then(stream => {
      
      let chunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.start();
      let a =0;

     this. mediaRecorder.ondataavailable = async (event) => {
        chunks.push(event.data);
        
            let blob = new Blob(chunks, { 'type' : 'audio/wav; codecs=0'});

            var formdata = new FormData();  
            formdata.append("AudioFile",blob, "my_audio.wav");
          if (chunks.length ==1){ //SEND DATA
            
            await axios.post("http://193.170.63.37:8080/status/play", formdata).then((res: any) => {
                console.log(res.data.warning)
                if(res.data.warning){
                  Haptics.impact({style: ImpactStyle.Light});
                }
              }).catch((err: any) => {
                console.warn(err)
              });    
             chunks = [];
        }
       
        a+=1;
      }


    }).catch(err => {
      console.log(err);
    });
  }

 

}
