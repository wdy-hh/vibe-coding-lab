import { createAppView } from '../ui/AppView.ts';
import { AppController } from './AppController.ts';

export class App {
  private controller: AppController;
  constructor(root: HTMLElement) { this.controller = new AppController(createAppView(root)); }
  dispose(): void { this.controller.dispose(); }
}
