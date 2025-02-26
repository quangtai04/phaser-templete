import View from '../view/View';
import ViewModel from './ViewModel';

export default abstract class ViewBase<T extends ViewModel> extends View {
  protected viewModel: T = null;

  setViewModel(viewModel: T): this {
    this.viewModel = viewModel;
    return this;
  }
}
