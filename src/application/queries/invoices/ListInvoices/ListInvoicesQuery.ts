export interface ListInvoicesQuery {
  readonly userId: string;
  readonly status?: string;
  readonly search?: string;
}

