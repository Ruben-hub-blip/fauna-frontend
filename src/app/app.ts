import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatBotComponent } from './shared/components/chat-bot/chat-bot';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [RouterOutlet, ChatBotComponent], // <--- Una sola línea con ambos
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('proyecto_final');
}
