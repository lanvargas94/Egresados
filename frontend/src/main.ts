import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app.routes';
import { AppComponent } from './app/components/app.component';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { errorInterceptor } from './app/interceptors/error.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
  ]
}).catch(err => console.error(err));
