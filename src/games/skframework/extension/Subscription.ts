import { Subscription } from 'rxjs';
import ILifetimeSubscription from '../core/ILifetimeSubscription';

declare module 'rxjs' {
  interface Subscription {
    addTo(lifetimeSubscription: ILifetimeSubscription): void;
  }
}

Subscription.prototype.addTo = function addTo(lifetimeSubscription: ILifetimeSubscription): void {
  lifetimeSubscription.subscription.add(this);
};
