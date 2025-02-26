abstract class ViewModel {
  static create<T extends ViewModel>(newable: new () => T) {
    return new newable();
  }
}

export default ViewModel;
