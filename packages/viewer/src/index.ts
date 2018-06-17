// import 'es6-promise/auto';  // polyfill Promise on IE

import {
  CommandRegistry
} from '@phosphor/commands';

import {
  BoxPanel, DockPanel, Menu, MenuBar, Widget, CommandPalette
} from '@phosphor/widgets';

import {
  AnnotateWidget
} from '@nannotate/core';


import '../style/index.css';

const commands = new CommandRegistry();

function main(): void {
  let bar = new MenuBar();
  let menu = new Menu({commands});

  menu.addItem({ type: 'separator'});
  menu.addItem({ command: 'save-dock-layout'});
  menu.addItem({ command: 'restore-dock-layout'});

  menu.title.label = 'File';
  menu.title.mnemonic = 0;
  bar.addMenu(menu);
  bar.id = 'menuBar';

  let palette = new CommandPalette({ commands });
  palette.id = 'palette';

  // let contextMenu = new ContextMenu({ commands });
  // contextMenu.addItem({ command: 'example:cut', selector: '.content' });

  let anno = new AnnotateWidget();

  let dock = new DockPanel();
  dock.addWidget(anno);

  let savedLayouts: DockPanel.ILayoutConfig[] = [];

  commands.addCommand('save-dock-layout', {
    label: 'Save Layout',
    caption: 'Save the current dock layout',
    execute: () => {
      savedLayouts.push(dock.saveLayout());
      palette.addItem({
        command: 'restore-dock-layout',
        category: 'Dock Layout',
        args: { index: savedLayouts.length - 1 }
      });
    }
  });

  commands.addCommand('restore-dock-layout', {
    label: args => {
      return `Restore Layout ${args.index as number}`;
    },
    execute: args => {
      dock.restoreLayout(savedLayouts[args.index as number]);
    }
  });

  palette.addItem({
    command: 'save-dock-layout',
    category: 'Dock Layout',
    rank: 0
  });

  BoxPanel.setStretch(dock, 1);

  let main = new BoxPanel({ direction: 'left-to-right', spacing: 0 });
  main.id = 'main';
  // main.addWidget(palette);
  main.addWidget(dock);

  window.onresize = () => { main.update(); };

  Widget.attach(bar, document.body);
  Widget.attach(main, document.body);
}


window.onload = main;


