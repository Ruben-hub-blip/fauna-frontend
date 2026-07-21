import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para usar *ngIf
import { FormsModule } from '@angular/forms';   // Para usar ngModel
import { RagService } from '../../../core/services/rag.service';

@Component({
  selector: 'app-chat-bot',
  standalone: true,           
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-bot.html', 
  styleUrls: ['./chat-bot.css']   
})
export class ChatBotComponent {
  isOpen = false;
  userInput = '';
  messages: any[] = [{ text: '¡Hola! Soy tu guía de fauna de Barranquilla. ¿En qué puedo ayudarte?', type: 'bot' }];
  loading = false;

  constructor(private ragService: RagService) {}

  toggleChat() { this.isOpen = !this.isOpen; }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMsg = this.userInput;
    this.messages.push({ text: userMsg, type: 'user' });
    this.userInput = '';
    this.loading = true;

    this.ragService.preguntar(userMsg).subscribe({
      next: (res) => {
        this.messages.push({ text: res.answer, type: 'bot' });
        this.loading = false;
      },
      error: () => {
        this.messages.push({ text: 'Error al conectar con el servidor.', type: 'bot' });
        this.loading = false;
      }
    });
  }
}