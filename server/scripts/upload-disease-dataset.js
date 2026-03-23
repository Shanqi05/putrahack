import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { createHash, randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(scriptDir, '..');

dotenv.config({ path: path.join(serverRoot, '.env') });

const IMAGE_EXTENSIONS = new Set([
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.bmp',
    '.gif'
]);

const SPLITS = new Set(['train', 'val', 'test']);

function printHelp() {
    console.log(`
Usage:
  npm run upload:disease-dataset -- "C:\\path\\to\\dataset"

Optional flags:
  --prefix=datasets/plant-disease
  --collection=diseaseDatasetImages
  --default-split=train

Supported folder structures:
  1. dataset-root/
       Early Blight/
         img1.jpg
         img2.jpg
       Healthy/
         img3.jpg

  2. dataset-root/
       train/
         Early Blight/
           img1.jpg
       val/
         Early Blight/
           img2.jpg

Required env vars:
  FIREBASE_SERVICE_ACCOUNT_PATH
  FIREBASE_STORAGE_BUCKET
`);
}

function parseArgs(argv) {
    const options = {
        prefix: 'datasets/plant-disease',
        collection: 'diseaseDatasetImages',
        defaultSplit: 'train'
    };
    const positional = [];

    for (const arg of argv) {
        if (arg === '--help' || arg === '-h') {
            options.help = true;
            continue;
        }

        if (arg.startsWith('--prefix=')) {
            options.prefix = arg.slice('--prefix='.length);
            continue;
        }

        if (arg.startsWith('--collection=')) {
            options.collection = arg.slice('--collection='.length);
            continue;
        }

        if (arg.startsWith('--default-split=')) {
            options.defaultSplit = arg.slice('--default-split='.length);
            continue;
        }

        positional.push(arg);
    }

    return { options, positional };
}

function resolvePath(inputPath) {
    return path.isAbsolute(inputPath)
        ? inputPath
        : path.resolve(serverRoot, inputPath);
}

function slugifySegment(value) {
    const normalized = value.normalize('NFKD').replace(/[^\x00-\x7F]/g, '');
    const slug = normalized
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    return slug || 'unknown';
}

function sanitizeRelativePath(relativePath) {
    return relativePath
        .split(path.sep)
        .map((segment) => {
            const parsed = path.parse(segment);
            const base = slugifySegment(parsed.name);
            return `${base}${parsed.ext.toLowerCase()}`;
        })
        .join('/');
}

function isImageFile(filePath) {
    return IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

async function collectFiles(directoryPath) {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(directoryPath, entry.name);

        if (entry.isDirectory()) {
            files.push(...await collectFiles(fullPath));
            continue;
        }

        if (entry.isFile() && isImageFile(fullPath)) {
            files.push(fullPath);
        }
    }

    return files;
}

async function getDirectoryEntries(directoryPath) {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory());
}

async function discoverDataset(rootDir, defaultSplit) {
    const topDirs = await getDirectoryEntries(rootDir);

    if (!topDirs.length) {
        throw new Error(`No folders found under dataset root: ${rootDir}`);
    }

    const topNames = topDirs.map((entry) => entry.name.toLowerCase());
    const isSplitLayout = topNames.every((name) => SPLITS.has(name));
    const datasetItems = [];

    if (isSplitLayout) {
        for (const splitEntry of topDirs) {
            const split = splitEntry.name.toLowerCase();
            const labelRoot = path.join(rootDir, splitEntry.name);
            const labelDirs = await getDirectoryEntries(labelRoot);

            for (const labelEntry of labelDirs) {
                const labelPath = path.join(labelRoot, labelEntry.name);
                const files = await collectFiles(labelPath);

                for (const filePath of files) {
                    datasetItems.push({
                        split,
                        label: labelEntry.name,
                        labelPath,
                        filePath
                    });
                }
            }
        }
    } else {
        for (const labelEntry of topDirs) {
            const labelPath = path.join(rootDir, labelEntry.name);
            const files = await collectFiles(labelPath);

            for (const filePath of files) {
                datasetItems.push({
                    split: defaultSplit,
                    label: labelEntry.name,
                    labelPath,
                    filePath
                });
            }
        }
    }

    return datasetItems;
}

async function initFirebaseAdmin() {
    const serviceAccountPath =
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!serviceAccountPath) {
        throw new Error(
            'Missing FIREBASE_SERVICE_ACCOUNT_PATH. Set it in server/.env to your Firebase service account JSON path.'
        );
    }

    const resolvedServiceAccountPath = resolvePath(serviceAccountPath);
    const serviceAccount = JSON.parse(
        await fs.readFile(resolvedServiceAccountPath, 'utf8')
    );

    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    if (!storageBucket) {
        throw new Error('Missing FIREBASE_STORAGE_BUCKET in server/.env');
    }

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket
        });
    }

    return {
        db: admin.firestore(),
        bucket: admin.storage().bucket(storageBucket)
    };
}

function buildDownloadUrl(bucketName, storagePath, token) {
    return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
}

async function main() {
    const { options, positional } = parseArgs(process.argv.slice(2));

    if (options.help || !positional.length) {
        printHelp();
        process.exit(options.help ? 0 : 1);
    }

    const datasetRoot = resolvePath(positional[0]);
    const rootStat = await fs.stat(datasetRoot).catch(() => null);

    if (!rootStat?.isDirectory()) {
        throw new Error(`Dataset folder not found: ${datasetRoot}`);
    }

    const datasetItems = await discoverDataset(datasetRoot, options.defaultSplit);

    if (!datasetItems.length) {
        throw new Error(`No image files found under dataset folder: ${datasetRoot}`);
    }

    const { db, bucket } = await initFirebaseAdmin();
    const collectionRef = db.collection(options.collection);
    const datasetRootName = path.basename(datasetRoot);

    console.log(`Found ${datasetItems.length} image(s). Starting upload...`);

    let uploadedCount = 0;

    for (const item of datasetItems) {
        const labelSlug = slugifySegment(item.label);
        const relativePath = path.relative(item.labelPath, item.filePath);
        const safeRelativePath = sanitizeRelativePath(relativePath);
        const storagePath = `${options.prefix}/${item.split}/${labelSlug}/${safeRelativePath}`;
        const token = randomUUID();

        await bucket.upload(item.filePath, {
            destination: storagePath,
            metadata: {
                metadata: {
                    firebaseStorageDownloadTokens: token,
                    label: item.label,
                    split: item.split
                }
            }
        });

        const docId = createHash('sha1')
            .update(`${datasetRootName}:${item.split}:${item.label}:${relativePath}`)
            .digest('hex');

        await collectionRef.doc(docId).set({
            bucket: bucket.name,
            datasetRoot: datasetRootName,
            downloadUrl: buildDownloadUrl(bucket.name, storagePath, token),
            label: item.label,
            labelSlug,
            originalFileName: path.basename(item.filePath),
            relativePath: relativePath.split(path.sep).join('/'),
            split: item.split,
            source: 'bulk-upload-script',
            storagePath,
            uploadedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        uploadedCount += 1;
        console.log(`[${uploadedCount}/${datasetItems.length}] Uploaded ${item.label} -> ${storagePath}`);
    }

    console.log(`
Upload complete.
- Firestore collection: ${options.collection}
- Storage prefix: ${options.prefix}
- Total uploaded: ${uploadedCount}
`);
}

main().catch((error) => {
    console.error('Dataset upload failed:', error.message);
    process.exit(1);
});
