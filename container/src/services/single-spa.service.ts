import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { addErrorHandler, getAppStatus, LOAD_ERROR, mountRootParcel, Parcel, ParcelConfig, start } from 'single-spa';

@Injectable({
  providedIn: 'root',
})
export class SingleSpaService {
  private loadedParcels: {
    [appName: string]: Parcel;
  } = {};

  constructor() {
    addErrorHandler(err => {
      if (getAppStatus(err.appOrParcelName) === LOAD_ERROR) {
        System.delete(System.resolve(err.appOrParcelName));
      }
      console.warn(err);
    });
    start();
  }

  mount(appName: string, domElement: HTMLElement): Observable<unknown> {
    return from(System.import<ParcelConfig>(appName)).pipe(
      tap((app: ParcelConfig) => {
        this.loadedParcels[appName] = mountRootParcel(app, {
          domElement
        });
      })
    );
  }

  unmount(appName: string): Observable<unknown> {
    return from(this.loadedParcels[appName].unmount()).pipe(
      tap(() => delete this.loadedParcels[appName])
    );
  }
}
