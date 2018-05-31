import {AnnotateWidget} from '@nannotate/core';
import {Widget} from '@phosphor/widgets';
// import {Message} from '@phosphor/messaging';
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
        let widget = new AnnotateWidget();
        let div = document.createElement('div');
        div.style.backgroundColor = 'red';
        div.style.minHeight = '400px';
        div.style.minWidth = '400px';
        div.setAttribute('type', NANO_MIME_TYPE);

        let div2 = document.createElement('div');
        // div.appendChild(div2)
        Widget.attach(widget, div2);
        super({node: div});
    }

    // onAfterAttach(msg: Message) : void {
    // }

    renderModel(model: IRenderMime.IMimeModel): Promise<void> {
        // const {data, schema, layout, config} = model.data[MIME_TYPE] as any | PerspectiveSpec;
        this.node.textContent = 'test';
        return Promise.resolve();
    }
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
