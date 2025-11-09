/**
 * User Domain Entity
 * Represents a user in the invoice system
 */
export class User {
  private constructor(
    public readonly id: string,
    public email: string,
    public name: string,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Factory method to create a new User with validation
   */
  static create(props: {
    id: string;
    email: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    // Validate email format
    if (!props.email || !User.isValidEmail(props.email)) {
      throw new Error('INVALID_EMAIL_FORMAT');
    }

    // Validate name
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('NAME_REQUIRED');
    }

    if (props.name.length > 255) {
      throw new Error('NAME_TOO_LONG');
    }

    // Validate UUID format for id
    if (!User.isValidUUID(props.id)) {
      throw new Error('INVALID_USER_ID');
    }

    const now = new Date();
    return new User(
      props.id,
      props.email,
      props.name.trim(),
      props.createdAt || now,
      props.updatedAt || now
    );
  }

  /**
   * Update user's name with validation
   */
  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('NAME_REQUIRED');
    }

    if (newName.length > 255) {
      throw new Error('NAME_TOO_LONG');
    }

    this.name = newName.trim();
    this.updatedAt = new Date();
  }

  /**
   * Update user's email with validation
   */
  updateEmail(newEmail: string): void {
    if (!User.isValidEmail(newEmail)) {
      throw new Error('INVALID_EMAIL_FORMAT');
    }

    this.email = newEmail;
    this.updatedAt = new Date();
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate UUID format
   */
  private static isValidUUID(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }
}

