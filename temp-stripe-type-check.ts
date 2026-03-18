import Stripe from 'stripe';

type SubscriptionType = Stripe.Subscription;

// Para inspecionar o tipo, podemos criar uma variável e ver suas propriedades
const testSubscription: SubscriptionType = {} as SubscriptionType;

// console.log(testSubscription.current_period_end); // Isso causaria um erro de compilação se a propriedade não existisse
