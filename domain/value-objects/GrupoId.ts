import { v4 as uuidv4 } from 'uuid';

export class GrupoId {
  private readonly value: string;

  private constructor(id: string) {
    this.value = id;
  }

  public static create(): GrupoId {
    return new GrupoId(uuidv4());
  }

  public static of(id: string): GrupoId {
    return new GrupoId(id);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(grupoId?: GrupoId): boolean {
    if (grupoId === null || grupoId === undefined) {
      return false;
    }
    if (!(grupoId instanceof GrupoId)) {
      return false;
    }
    return this.value === grupoId.value;
  }
} 