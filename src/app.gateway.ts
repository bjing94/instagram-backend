import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from './auth/auth.service';
import { SocketService } from './socket/socket.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private socketService: SocketService,
    private authService: AuthService,
  ) {}

  @WebSocketServer()
  public server: Server;

  afterInit(server: Server) {
    this.authService.clearConnections();
    this.socketService.server = server;
  }

  async handleConnection(client: Socket) {
    console.log('Client', client.id, 'connected', 'add him to db');
    await this.authService.identifyUserBySocket(client);

    const result = await this.authService.getOnlineUsers();
    this.server.emit('activeConnections', {
      activeConnections: result.length,
    });
  }

  async handleDisconnect(client: Socket) {
    console.log('Client', client.id, 'disconnected', 'remove him from db');
    await this.authService.deidentifyUserBySocket(client);
    const result = await this.authService.getOnlineUsers();
    this.server.emit('activeConnections', {
      activeConnections: result.length,
    });
  }
}
