import { Preferences } from '@capacitor/preferences';

import { Service } from '@angular/core';

@Service()
export class CapacitorPreferencesService {
    private readonly writeQueues = new Map<string, Promise<void>>();

    public async get<T>(key: string): Promise<T | null> {
        await this.writeQueues.get(key)?.catch(() => undefined);

        const { value } = await Preferences.get({ key });

        if (value === null) {
            return null;
        }

        try {
            return JSON.parse(value) as T;
        } catch {
            await this.remove(key);
            return null;
        }
    }

    public async set<T>(key: string, value: T): Promise<void> {
        const serializedValue = JSON.stringify(value);

        if (serializedValue === undefined) {
            throw new TypeError('Persistent state must be JSON serializable.');
        }

        await this.enqueueWrite(key, () => Preferences.set({ key, value: serializedValue }));
    }

    public remove(key: string): Promise<void> {
        return this.enqueueWrite(key, () => Preferences.remove({ key }));
    }

    private enqueueWrite(key: string, write: () => Promise<void>): Promise<void> {
        const previousWrite = this.writeQueues.get(key) ?? Promise.resolve();
        const currentWrite = previousWrite.catch(() => undefined).then(write);

        this.writeQueues.set(key, currentWrite);

        return currentWrite;
    }
}
