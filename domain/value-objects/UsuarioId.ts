export class UsuarioId {
  private readonly value: string;

  private constructor(id: string) {
    this.value = id;
  }

  public static of(id: string): UsuarioId {
    if (!id || id.trim() === '') {
      throw new Error('El ID de usuario no puede estar vacío');
    }
    return new UsuarioId(id);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(usuarioId?: UsuarioId): boolean {
    if (usuarioId === null || usuarioId === undefined) {
      return false;
    }
    if (!(usuarioId instanceof UsuarioId)) {
      return false;
    }
    return this.value === usuarioId.value;
  }
} 