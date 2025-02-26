import { Subscription } from 'rxjs';

interface ILifetimeSubscription {
  readonly subscription: Subscription;
}

export default ILifetimeSubscription;
