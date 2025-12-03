declare module "@paystack/inline-js" {
    export default class PaystackPop {
      constructor(options?: any);
      newTransaction(options: {
        key: string;
        email: string;
        amount: number;
        reference?: string;
        currency?: string;
        metadata?: any;
        onSuccess?: (response: any) => void;
        onCancel?: () => void;
      }): void;
    }
  }
  