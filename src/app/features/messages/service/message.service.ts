import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { MainSocket } from '../../../core/socket/main-socket';
import { AuthInterceptor } from '../../auth/interceptor/auth.interceptor';
import { User } from '../../auth/service/auth.service';
import { Room } from '../../room/service/room.service';
import { MessageType } from '../components/messages/messages.component';

export interface Message {
  _id: string;
  message: string;
  to: string;
  room?: string;
  from?: User;
}
const { api } = environment;

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private socket: MainSocket, private http: HttpClient) {}

  getMessages(type: MessageType, id: string) {
    return this.http.get<Message[]>(`${api}/message/${type}/${id}`);
  }

  getMessage(type: MessageType) {
    return this.socket.fromEvent<Message>(`message:${type}`);
  }

  sendRoomMessage<T>(
    room: Room,
    message: string,
    callback?: (data: T) => void,
  ) {
    return this.socket.emit(
      `message:room`,
      {
        roomId: room._id,
        message,
      },
      callback,
    );
  }

  sendDirectMessage<T>(
    to: User,
    message: string,
    callback?: (data: T) => void,
  ) {
    return this.socket.emit(`message:direct`, {
      to: to._id,
      message,
      callback,
    });
  }

  deleteMessage(type: MessageType, message: Message) {
    return this.http.delete(`${api}/message/${type}`, {
      body: {
        messageId: message._id,
        roomId: message.room,
        to: message.to,
      },
      headers: {
        [AuthInterceptor.skipHeader]: 'true',
      },
    });
  }

  onDeleteMessagesEvent(type: MessageType) {
    return this.socket.fromEvent<void>(`${type}:delete_messages`);
  }

  onDeleteMessageEvent(type: MessageType) {
    return this.socket.fromEvent<string>(`${type}:delete_message`);
  }
}
