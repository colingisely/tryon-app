import Stripe from 'stripe';

declare module 'stripe' {
  namespace Stripe {
    interface Subscription {
      current_period_end: number;
    }
  }
}
