import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AdminOrderNotificationDto } from '../dto/admin-notification.dto';
import { NotificationConnectionStatus } from '../../models/admin-notification.model';

const ADMIN_ORDERS_TOPIC = '/topic/admin/orders';

@Injectable()
export class AdminNotificationSocketService {
  private readonly notificationSubject = new Subject<AdminOrderNotificationDto>();
  private readonly connectionStatusSubject =
    new BehaviorSubject<NotificationConnectionStatus>('disconnected');
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;

  readonly notifications$: Observable<AdminOrderNotificationDto> =
    this.notificationSubject.asObservable();
  readonly connectionStatus$: Observable<NotificationConnectionStatus> =
    this.connectionStatusSubject.asObservable();

  connect(tokenType: string, accessToken: string): void {
    if (this.client?.active) return;

    this.connectionStatusSubject.next('connecting');
    const webSocketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.client = new Client({
      brokerURL: `${webSocketProtocol}//${window.location.host}/ws`,
      connectHeaders: { Authorization: `${tokenType} ${accessToken}` },
      reconnectDelay: 5_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      debug: () => undefined,
    });

    this.client.onConnect = () => {
      this.connectionStatusSubject.next('connected');
      this.subscription = this.client?.subscribe(
        ADMIN_ORDERS_TOPIC,
        (message) => this.handleMessage(message),
      ) ?? null;
    };
    this.client.onWebSocketClose = () => {
      this.subscription = null;
      this.connectionStatusSubject.next(
        this.client?.active ? 'connecting' : 'disconnected',
      );
    };
    this.client.onWebSocketError = () => this.connectionStatusSubject.next('error');
    this.client.onStompError = () => this.connectionStatusSubject.next('error');
    this.client.activate();
  }

  async disconnect(): Promise<void> {
    this.subscription?.unsubscribe();
    this.subscription = null;
    const client = this.client;
    this.client = null;
    if (client) await client.deactivate();
    this.connectionStatusSubject.next('disconnected');
  }

  private handleMessage(message: IMessage): void {
    try {
      const payload = JSON.parse(message.body) as AdminOrderNotificationDto;
      this.notificationSubject.next(payload);
    } catch {
      this.connectionStatusSubject.next('error');
    }
  }
}
