import {AnnotateWidget} from '@nannotate/core';
import {Widget} from '@phosphor/widgets';

import {Message} from '@phosphor/messaging';
// import {Session} from '@jupyterlab/services';
import {IRenderMime} from '@jupyterlab/rendermime-interfaces';
import '../style/index.css';

export
const NANO_MIME_TYPE = 'application/nano+json';

// interface PerspectiveSpec {
//     data: string,
//     schema: string,
//     layout: string,
//     config: string;
// }


export class NannotateWidget extends Widget implements IRenderMime.IRenderer {

    constructor() {
        let div = document.createElement('div');
        div.style.minHeight = '400px';
        div.style.minWidth = '400px';

        div.setAttribute('type', NANO_MIME_TYPE);
        super({node: div});

        this._nanowidget = new AnnotateWidget();
    }

    onAfterAttach(msg: Message) : void {
        Widget.attach(this._nanowidget, this.node);
    }

    renderModel(model: IRenderMime.IMimeModel): Promise<void> {
        // const {data, schema, layout, config} = model.data[MIME_TYPE] as any | PerspectiveSpec;
        return Promise.resolve();
    }

    private _nanowidget: AnnotateWidget;
}


export const rendererFactory: IRenderMime.IRendererFactory = {
    safe: false,
    mimeTypes: [NANO_MIME_TYPE],
    createRenderer: options => new NannotateWidget()
};


const extensions: IRenderMime.IExtension | IRenderMime.IExtension[] = [{
    id: 'nannotate:factory',
    rendererFactory,
    dataType: 'string',
    fileTypes: [{
        name: 'nannotate',
        fileFormat: 'base64',
        mimeTypes: [NANO_MIME_TYPE],
        extensions: ['nano']
    }],
    documentWidgetFactoryOptions: {
        name: 'nannotate',
        modelName: 'base64',
        primaryFileType: 'nano',
        fileTypes: ['nano'],
        defaultFor: ['nano']
    },
}];

export default extensions;
