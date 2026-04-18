import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  products: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('http://127.0.0.1:8000/api/v1/product/')
      .subscribe({
        next: (data) => {
          this.products = data;
          console.log('Data received:', data);
        },
        error: (err) => console.error('Backend is not running!', err)
      });
  }
}