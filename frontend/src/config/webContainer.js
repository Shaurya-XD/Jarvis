import { WebContainer } from '@webcontainer/api';

let webcontainerInstance = null;
let bootPromise = null;

export const getWebContainer = async() => {
    if (webcontainerInstance) {
        return webcontainerInstance;
    }

    if (!bootPromise) {
        bootPromise = WebContainer.boot({ coep: 'require-corp' })
            .then((instance) => {
                webcontainerInstance = instance;
                return instance;
            })
            .catch((error) => {
                // Allow a deliberate retry after a boot failure.
                bootPromise = null;
                throw error;
            });
    }

    return bootPromise;
}
