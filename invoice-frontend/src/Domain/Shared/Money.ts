export class Money {
  constructor(public readonly value: number) {}
  
  static from(value: number): Money {
    return new Money(value);
  }
  
  static zero(): Money {
    return new Money(0);
  }
  
  add(other: Money): Money {
    return new Money(this.value + other.value);
  }
  
  subtract(other: Money): Money {
    return new Money(this.value - other.value);
  }
  
  format(currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(this.value);
  }
}

