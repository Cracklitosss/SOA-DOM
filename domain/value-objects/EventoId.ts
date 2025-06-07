import { v4 as uuidv4 } from 'uuid';

export class EventoId {
  private readonly value: string;

  private constructor(id: string) {
    this.value = id;
  }

  public static create(): EventoId {
    return new EventoId(uuidv4());
  }

  public static of(id: string): EventoId {
    return new EventoId(id);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(eventoId?: EventoId): boolean {
    if (eventoId === null || eventoId === undefined) {
      return false;
    }
    if (!(eventoId instanceof EventoId)) {
      return false;
    }
    return this.value === eventoId.value;
  }
} 