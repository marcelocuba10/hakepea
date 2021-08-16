import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Platform, LoadingController } from '@ionic/angular';

declare const google;

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit {

  mapRef: any;

  constructor(
    private platform: Platform,
    private geolocation: Geolocation,
    private loadingCtrl: LoadingController,
  ) { }

  ngOnInit() {
    this.loadmap();
  }
  async loadmap() {
    //show loading
    const loading = await this.loadingCtrl.create();
    loading.present();

    const myLatLng = await this.getLocation();
    console.log(myLatLng);
    const mapEle: HTMLElement = document.getElementById('map');

    // //crear mapa
    this.mapRef = new google.maps.Map(mapEle, {
      center: { lat: myLatLng.lat, lng: myLatLng.lng },
      zoom: 18,
      mapTypeId: 'roadmap'
    });

    google.maps.event.addListenerOnce(this.mapRef, 'idle', () => {
      loading.dismiss();
      this.addMarker(myLatLng.lat, myLatLng.lng);
    });
  }

  private async getLocation() {
    const rta = await this.geolocation.getCurrentPosition();
    return {
      lat: rta.coords.latitude,
      lng: rta.coords.longitude
    };
  }

  private addMarker(lat: number, lng: number) {
    const marker = new google.maps.Marker({
      position: {
        lat, lng
      },
      map: this.mapRef,
      title: 'hello world!'
    });
  }

}
