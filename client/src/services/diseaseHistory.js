import { addDoc, collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

const DISEASE_SCANS_COLLECTION = "diseaseScans";

const sortScansByNewest = (items) =>
    [...items].sort((a, b) => {
        const first = new Date(b.scannedAt || b.createdAt || 0).getTime();
        const second = new Date(a.scannedAt || a.createdAt || 0).getTime();
        return first - second;
    });

export const subscribeToDiseaseScans = (userId, onScans, onError) => {
    if (!userId) {
        onScans([]);
        return () => {};
    }

    const scansQuery = query(
        collection(db, DISEASE_SCANS_COLLECTION),
        where("userId", "==", userId),
    );

    return onSnapshot(
        scansQuery,
        (snapshot) => {
            const scans = snapshot.docs.map((scanDoc) => ({
                id: scanDoc.id,
                ...scanDoc.data(),
            }));

            onScans(sortScansByNewest(scans));
        },
        onError,
    );
};

export const saveDiseaseScan = async (scanRecord) => {
    return addDoc(collection(db, DISEASE_SCANS_COLLECTION), scanRecord);
};
