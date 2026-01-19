import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import  Swal  from 'sweetalert2';
import { ApiResponse } from '../models/API/ApiResponse';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((httpError: HttpErrorResponse) => {
      // Check if the `error` field has the ApiResponse structure
      const error = httpError.error as ApiResponse<any>;

      if (req.url.endsWith('/register')) {
        switch (httpError.status) {
            case 400:
                    Swal.fire({
                        icon: 'error',
                        title: 'Invalid Data',
                        toast: true,
                        position: 'top-end',
                        text: 'Invalid data, please check your input.',
                        timer:1750,
                        showConfirmButton: false,
                        timerProgressBar: true,
                    });
            break;
            case 409:
                    Swal.fire({
                        icon: 'error',
                        title: 'Registration Failed',
                        toast: true,
                        position: 'top-end',
                        text: 'An user with this email already exists.',
                        timer:1750,
                        showConfirmButton: false,
                        timerProgressBar: true,
                    });
            break;
          // Other specific cases if necessary
        }
      }else if (req.url.endsWith('/login')) {
        switch (httpError.status) {
            case 401:
                Swal.fire({
                    icon: 'error',
                    title: 'Authentication Failed',
                    toast: true,
                    position: 'top-end',
                    text: 'Invalid credentials, please try again.',
                    showConfirmButton: false,   
                    timer:1750,
                    timerProgressBar: true,
                });
            break;
        }
    }
    
      return throwError(() => error);
    })
  );
};
