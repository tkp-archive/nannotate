import {AnnotateWidget} from '@nannotate/core';
import {Widget} from '@phosphor/widgets';
import {Message} from '@phosphor/messaging';
// import {Session} from '@jupyterlab/services';
import {IRenderMime} from '@jupyterlab/rendermime-interfaces';
import '../style/index.css';

export
const MIME_TYPE = 'application/nannotate';

export
const NANO_CLASS = 'jp-PSPViewer';

export
const NANO_CONTAINER_CLASS = 'jp-PSPContainer';

// interface NanoSpec {
//     data: string,
//     schema: string,
//     layout: string,
//     config: string;
// }

export class RenderedNano extends Widget implements IRenderMime.IRenderer {

    constructor() {
        let anno = new AnnotateWidget();

        let div = document.createElement('div');
        Widget.attach(anno, div);

        super({node: div});
    }

    onAfterAttach(msg: Message) : void {
    }

    renderModel(model: IRenderMime.IMimeModel): Promise<void> {
        return Promise.resolve();
    }
}


export const rendererFactory: IRenderMime.IRendererFactory = {
    safe: false,
    mimeTypes: [MIME_TYPE],
    createRenderer: options => new RenderedNano()
};


const extensions: IRenderMime.IExtension | IRenderMime.IExtension[] = [{
    id: 'nannotate:factory',
    rendererFactory,
    dataType: 'string',
    fileTypes: [{
        name: 'nannotate',
        fileFormat: 'base64',
        mimeTypes: [MIME_TYPE],
        extensions: ['nannotate']
    }],
    documentWidgetFactoryOptions: {
        name: 'nannotate',
        modelName: 'base64',
        primaryFileType: 'nannotate',
        fileTypes: ['nannotate'],
        defaultFor: ['nannotate']
    },
}];

export default extensions;
