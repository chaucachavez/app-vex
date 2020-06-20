import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService extends ServiceBase {

  public url = `https://api.spotify.com/v1`;
  public token = 'Bearer BQCZnQcBnLs6dSaH-imcuP7hYR0GFYZNSMSx-f6a4kfxdkoG6vLciqcIdEJcioTdSslSRNKpKQtCKNbirZU'
 
  constructor(public http: HttpClient) { 
    super();
    console.log('SpotifyService listo!');
  }

  getNewReleases() {
    return this.getQuery('browse/new-releases?limit=20')
      .pipe(map(data => data['albums'].items));

  }

  getArtistas(termino: string) {
    return this.getQuery(`search?q=${termino}&type=artist&limit=15`)
      .pipe(map(data => data['artists'].items));
  }

  getArtista(id: string) {
    return this.getQuery(`artists/${id}`);
    // .pipe( map(data => data['artists'].items ));  
  }

  getTopTracks(id: string) {
    return this.getQuery(`artists/${id}/top-tracks?country=us`)
      .pipe(map(data => data['tracks']));
  } 

}
