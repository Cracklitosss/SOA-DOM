import { DomainEvent } from './DomainEvent';

// Tipo para los manejadores de eventos
type EventHandler = (event: DomainEvent) => void;

// Clase para publicar eventos de dominio (patrón Singleton)
export class DomainEventPublisher {
  private static instance: DomainEventPublisher;
  private handlers: Map<string, EventHandler[]> = new Map();

  private constructor() {}

  public static getInstance(): DomainEventPublisher {
    if (!DomainEventPublisher.instance) {
      DomainEventPublisher.instance = new DomainEventPublisher();
    }
    return DomainEventPublisher.instance;
  }

  // Registrar un manejador para un tipo de evento
  public register(eventName: string, handler: EventHandler): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)?.push(handler);
  }

  // Publicar un evento
  public publish(event: DomainEvent): void {
    console.log(`[Evento de Dominio] ${event.eventName}:`, event);
    
    const eventHandlers = this.handlers.get(event.eventName) || [];
    for (const handler of eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error al manejar evento ${event.eventName}:`, error);
      }
    }
  }

  // Limpiar todos los manejadores (útil para pruebas)
  public clearHandlers(): void {
    this.handlers.clear();
  }
} 