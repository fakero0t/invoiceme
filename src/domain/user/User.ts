/**
 * User Domain Entity
 * Represents a user in the invoice system
 */
export class User {
  private passwordHash?: string;

  private constructor(
    public readonly id: string,
    public email: string,
    public name: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    passwordHash?: string
  ) {
    this.passwordHash = passwordHash;
  }

  /**
   * Factory method to create a new User with validation
   */
  static create(props: {
    id: string;
    email: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
    passwordHash?: string;
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
      props.updatedAt || now,
      props.passwordHash
    );
  }

  /**
   * Factory method to create a new User with password
   */
  static createWithPassword(props: {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
  }): User {
    if (!props.passwordHash) {
      throw new Error('PASSWORD_HASH_REQUIRED');
    }

    return User.create({
      ...props,
      passwordHash: props.passwordHash,
    });
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
   * Set password hash
   */
  setPasswordHash(hash: string): void {
    if (!hash) {
      throw new Error('PASSWORD_HASH_REQUIRED');
    }
    this.passwordHash = hash;
    this.updatedAt = new Date();
  }

  /**
   * Get password hash (for authentication)
   */
  getPasswordHash(): string | undefined {
    return this.passwordHash;
  }

  /**
   * Convert to plain object for serialization
   * Note: passwordHash is NOT included in JSON output for security
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

