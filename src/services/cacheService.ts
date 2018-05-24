import {CacheProviderInterface} from '../providers/cacheProviderInterface';
import {MemoryCache} from '../providers/memoryCacheProvider';
import {Config} from '../classes/config';

export class CacheService implements CacheProviderInterface {
    __config: Config;

    constructor(config: Config) {
        this.__config = config;
    }

    get(name:string) : object | undefined{
        let provider = this.getProvider(this.__config.cacheProvider);

        this.formatName(name);

        return provider.get(name);
    }

    has(name:string): boolean {
        let provider = this.getProvider(this.__config.cacheProvider);

        this.formatName(name);

        return provider.has(name);
    }

    set(name:string, obj:object, ttl:Date | undefined) {
        let provider = this.getProvider(this.__config.cacheProvider);

        name = this.formatName(name);

        provider.set(name, obj, ttl);
    }

    delete(name:string) {
        let provider = this.getProvider(this.__config.cacheProvider);

        name = this.formatName(name);

        provider.delete(name);
    }

    setConfig(config:Config) : void {
        this.__config = config;
    }

    getProvider(name:string) : CacheProviderInterface {
        let result: CacheProviderInterface;

        name = this.formatName(name);

        switch(name) {
            default: //memory
                result = new MemoryCache();
                break;
        }

        result.setConfig(this.__config);

        return result;
    }

    formatName(name:string) : string {
        return name.toLowerCase().trim();
    }
}