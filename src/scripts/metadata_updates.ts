import * as metadata from './metadata_utils';

const cmd: string = process.argv[2];

async function updateMetadata(cmd: string) {
    await metadata[cmd]();
}

updateMetadata(cmd);
