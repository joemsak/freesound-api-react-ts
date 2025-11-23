// Freesound API Client - TypeScript version
// Integrated with environment variables
import { rateLimiter } from '../utils/rateLimiter';

interface SearchOptions {
  query?: string;
  filter?: string;
  sort?: string;
  page?: number;
  page_size?: number;
  fields?: string;
  descriptors?: string;
  normalized?: boolean;
  analysis_file?: File;
  target?: string;
}

interface SoundData {
  id: number;
  name: string;
  tags: string[];
  description: string;
  created: string;
  license: string;
  downloadUrl?: string;
  previews?: {
    'preview-hq-mp3'?: string;
    'preview-lq-mp3'?: string;
  };
  images?: {
    waveform_m?: string;
    waveform_l?: string;
  };
  username: string;
  pack?: string;
  pack_name?: string;
  duration?: number;
  filesize?: number;
  bitrate?: number;
  bitdepth?: number;
  samplerate?: number;
  channels?: number;
  type?: string;
  geotag?: string;
  [key: string]: any;
}

interface CollectionData<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

interface SoundCollection extends CollectionData<SoundData> {
  nextPage: (success: (data: SoundCollection) => void, error?: (err: any) => void) => void;
  previousPage: (success: (data: SoundCollection) => void, error?: (err: any) => void) => void;
  getItem: (idx: number) => SoundData;
  getSound: (idx: number) => SoundObject;
}

interface SoundObject extends SoundData {
  getAnalysis: (filter?: string, success?: (data: any) => void, error?: (err: any) => void, showAll?: boolean) => void;
  getSimilar: (success: (data: SoundCollection) => void, error?: (err: any) => void, params?: SearchOptions) => void;
  getComments: (success: (data: any) => void, error?: (err: any) => void) => void;
  download: (targetWindow: Window) => void;
  comment: (commentStr: string, success?: (data: any) => void, error?: (err: any) => void) => void;
  rate: (rating: number, success?: (data: any) => void, error?: (err: any) => void) => void;
  bookmark: (name: string, category?: string, success?: (data: any) => void, error?: (err: any) => void) => void;
  edit: (description: any, success?: (data: any) => void, error?: (err: any) => void) => void;
}

interface UserData {
  username: string;
  url: string;
  sounds?: string;
  packs?: string;
  [key: string]: any;
}

interface PackData {
  id: number;
  url: string;
  name: string;
  username: string;
  [key: string]: any;
}

class FreesoundClient {
  private authHeader: string = '';
  private clientId: string;
  private clientSecret: string;
  private apiToken: string;

  private uris = {
    base: 'https://freesound.org/apiv2',
    textSearch: '/search/text/',
    contentSearch: '/search/content/',
    combinedSearch: '/sounds/search/combined/',
    sound: '/sounds/<sound_id>/',
    soundAnalysis: '/sounds/<sound_id>/analysis/',
    similarSounds: '/sounds/<sound_id>/similar/',
    comments: '/sounds/<sound_id>/comments/',
    download: '/sounds/<sound_id>/download/',
    upload: '/sounds/upload/',
    describe: '/sounds/<sound_id>/describe/',
    pending: '/sounds/pending_uploads/',
    bookmark: '/sounds/<sound_id>/bookmark/',
    rate: '/sounds/<sound_id>/rate/',
    comment: '/sounds/<sound_id>/comment/',
    authorize: '/oauth2/authorize/',
    logout: '/api-auth/logout/',
    logoutAuthorize: '/oauth2/logout_and_authorize/',
    me: '/me/',
    user: '/users/<username>/',
    userSounds: '/users/<username>/sounds/',
    userPacks: '/users/<username>/packs/',
    userBookmarkCategories: '/users/<username>/bookmark_categories/',
    userBookmarkCategorySounds: '/users/<username>/bookmark_categories/<category_id>/sounds/',
    pack: '/packs/<pack_id>/',
    packSounds: '/packs/<pack_id>/sounds/',
    packDownload: '/packs/<pack_id>/download/',
  };

  constructor() {
    // Get credentials from environment variables
    this.clientId = import.meta.env.VITE_FREESOUND_CLIENT_ID || '';
    this.clientSecret = import.meta.env.VITE_FREESOUND_CLIENT_SECRET || '';
    this.apiToken = import.meta.env.VITE_FREESOUND_API_TOKEN || '';

    // Use API token if available, otherwise fall back to client_id
    if (this.apiToken) {
      this.setToken(this.apiToken, 'token');
    }

    if (!this.clientId || !this.clientSecret) {
      console.warn('Freesound API credentials not found in environment variables');
    }
  }

  private makeUri(uri: string, args: string[]): string {
    let result = uri;
    for (const arg of args) {
      result = result.replace(/<[\w_]+>/, arg);
    }
    return this.uris.base + result;
  }

  // Note: Freesound API doesn't support client_credentials grant type
  // For public endpoints, we use client_id as token parameter
  // For authenticated endpoints, OAuth2 authorization code flow is required

  private makeRequest<T>(
    uri: string,
    success: (data: T) => void,
    error?: (err: any) => void,
    params?: Record<string, any>,
    wrapper?: (data: any) => T,
    method: string = 'GET',
    data?: FormData | string,
    content_type?: string
  ): void {
    if (!error) {
      error = (e) => console.error('Freesound API Error:', e);
    }

    params = params || {};
    params['format'] = 'json';

    // Use the auth header if set (from setToken or API token)
    const authHeaderToUse = this.authHeader;

    const parse_response = (response: string): T => {
      try {
        const parsed = JSON.parse(response);
        return wrapper ? wrapper(parsed) : parsed;
      } catch (e) {
        throw new Error('Failed to parse response: ' + e);
      }
    };

    let paramStr = '';
    for (const p in params) {
      if (Object.prototype.hasOwnProperty.call(params, p)) {
        paramStr = paramStr + '&' + p + '=' + encodeURIComponent(params[p]);
      }
    }
    if (paramStr) {
      uri = uri + '?' + paramStr.substring(1); // Remove leading &
    }

    // Execute request with rate limiting
    const executeXHR = () => {
      // Browser implementation
      const xhr = new XMLHttpRequest();

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 304) {
            // Not Modified - use cached data (handled by cache layer)
            // This shouldn't happen if we're using ETags properly
            if (error) error(xhr);
            return;
          }
          if ([200, 201, 202].indexOf(xhr.status) >= 0) {
            try {
              const parsedData = parse_response(xhr.responseText);
              // Attach response headers for caching
              const headers: Record<string, string> = {};
              const etag = xhr.getResponseHeader('ETag');
              const lastModified = xhr.getResponseHeader('Last-Modified');
              const cacheControl = xhr.getResponseHeader('Cache-Control');
              
              if (etag) headers['ETag'] = etag;
              if (lastModified) headers['Last-Modified'] = lastModified;
              if (cacheControl) headers['Cache-Control'] = cacheControl;
              
              // Attach headers to the data if it's an object
              if (parsedData && typeof parsedData === 'object') {
                (parsedData as any).__headers = headers;
              }
              
              if (success) success(parsedData);
            } catch (e) {
              if (error) error(e);
            }
          } else if (xhr.status === 429) {
            // Rate limit exceeded - parse error details
            let errorMessage = 'Rate limit exceeded. Please try again later.';
            try {
              const response = JSON.parse(xhr.responseText || '{}');
              if (response.detail) {
                errorMessage = `Rate limit exceeded: ${response.detail}`;
              }
            } catch {
              // Ignore parse errors
            }
            
            // Create a custom error object
            const rateLimitError = new Error(errorMessage) as Error & { status?: number; responseText?: string };
            rateLimitError.status = 429;
            rateLimitError.responseText = xhr.responseText;
            
            if (error) error(rateLimitError);
          } else if (xhr.status !== 200) {
            if (error) error(xhr);
          }
        }
      };

      xhr.open(method, uri);
      if (authHeaderToUse) {
        xhr.setRequestHeader('Authorization', authHeaderToUse);
      }
      if (content_type !== undefined) {
        xhr.setRequestHeader('Content-Type', content_type);
      }
      xhr.send(data);
    };

    // Use rate limiter to throttle requests
    rateLimiter.executeRequest(() => {
      executeXHR();
      return Promise.resolve();
    }).catch((err) => {
      if (error) error(err);
    });
  }

  private checkOauth(): void {
    if (this.authHeader.indexOf('Bearer') === -1) {
      throw new Error('OAuth authentication required');
    }
  }

  private makeFD(obj: Record<string, any>, fd?: FormData): FormData {
    if (!fd) {
      fd = new FormData();
    }
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        fd.append(prop, obj[prop]);
      }
    }
    return fd;
  }

  private Collection<T>(jsonObject: CollectionData<T>): CollectionData<T> & {
    nextPage: (success: (data: CollectionData<T>) => void, error?: (err: any) => void) => void;
    previousPage: (success: (data: CollectionData<T>) => void, error?: (err: any) => void) => void;
    getItem: (idx: number) => T;
  } {
    const nextOrPrev = (which: string | undefined, success: (data: CollectionData<T>) => void, error?: (err: any) => void) => {
      if (!which) {
        if (error) error(new Error('No next/previous page available'));
        return;
      }
      this.makeRequest(which, success, error, {}, this.Collection.bind(this));
    };

    (jsonObject as any).nextPage = function (success: (data: CollectionData<T>) => void, error?: (err: any) => void) {
      nextOrPrev((this as CollectionData<T>).next, success, error);
    };

    (jsonObject as any).previousPage = function (success: (data: CollectionData<T>) => void, error?: (err: any) => void) {
      nextOrPrev((this as CollectionData<T>).previous, success, error);
    };

    (jsonObject as any).getItem = function (idx: number): T {
      return (this as CollectionData<T>).results[idx];
    };

    return jsonObject as any;
  }

  private SoundCollection(jsonObject: CollectionData<SoundData>): SoundCollection {
    const collection = this.Collection(jsonObject) as any;
    collection.getSound = function (idx: number): SoundObject {
      return new SoundObjectImpl(collection.results[idx], this as any);
    };
    return collection;
  }

  private search(
    options: SearchOptions,
    uri: string,
    success: (data: SoundCollection) => void,
    error?: (err: any) => void,
    wrapper?: (data: any) => SoundCollection
  ): void {
    if (options.analysis_file) {
      this.makeRequest(
        this.makeUri(uri, []),
        success,
        error,
        {},
        wrapper || this.SoundCollection.bind(this),
        'POST',
        this.makeFD(options as Record<string, unknown>)
      );
    } else {
      this.makeRequest(this.makeUri(uri, []), success, error, options, wrapper || this.SoundCollection.bind(this));
    }
  }

  // Public API methods
  setToken(token: string, type: 'oauth' | 'token' = 'oauth'): void {
    this.authHeader = (type === 'oauth' ? 'Bearer ' : 'Token ') + token;
  }

  setClientSecrets(id: string, secret: string): void {
    this.clientId = id;
    this.clientSecret = secret;
  }

  postAccessCode(
    code: string,
    success?: (result: { access_token: string; [key: string]: any }) => void,
    error?: (err: any) => void
  ): void {
    const post_url = this.uris.base + '/oauth2/access_token/';
    const data = new FormData();
    data.append('client_id', this.clientId);
    data.append('client_secret', this.clientSecret);
    data.append('code', code);
    data.append('grant_type', 'authorization_code');

    if (!success) {
      success = (result) => {
        this.setToken(result.access_token, 'oauth');
      };
    }

    this.makeRequest(post_url, success, error, {}, undefined, 'POST', data);
  }

  textSearch(
    query: string,
    options: SearchOptions = {},
    success: (data: SoundCollection) => void,
    error?: (err: any) => void
  ): void {
    options.query = query || ' ';
    this.search(options, this.uris.textSearch, success, error);
  }

  contentSearch(options: SearchOptions, success: (data: SoundCollection) => void, error?: (err: any) => void): void {
    if (!(options.target || options.analysis_file)) {
      throw new Error('Missing target or analysis_file');
    }
    this.search(options, this.uris.contentSearch, success, error);
  }

  combinedSearch(options: SearchOptions, success: (data: SoundCollection) => void, error?: (err: any) => void): void {
    if (!(options.target || options.analysis_file || options.query)) {
      throw new Error('Missing query, target or analysis_file');
    }
    this.search(options, this.uris.combinedSearch, success, error);
  }

  getSound(soundId: number | string, success: (data: SoundObject) => void, error?: (err: any) => void): void {
    this.makeRequest(
      this.makeUri(this.uris.sound, [String(soundId)]),
      success,
      error,
      {},
      (data: SoundData) => new SoundObjectImpl(data, this)
    );
  }

  getLoginURL(): string {
    if (!this.clientId) throw new Error('client_id was not set');
    let login_url = this.makeUri(this.uris.authorize, []);
    login_url += '?client_id=' + this.clientId + '&response_type=code';
    return login_url;
  }

  getLogoutURL(): string {
    let logout_url = this.makeUri(this.uris.logoutAuthorize, []);
    logout_url += '?client_id=' + this.clientId + '&response_type=code';
    return logout_url;
  }

  me(success: (data: UserData) => void, error?: (err: any) => void): void {
    this.checkOauth();
    this.makeRequest(this.makeUri(this.uris.me, []), success, error);
  }

  getUser(username: string, success: (data: UserData) => void, error?: (err: any) => void): void {
    this.makeRequest(this.makeUri(this.uris.user, [username]), success, error);
  }

  getPack(packId: number | string, success: (data: PackData) => void, error?: (err: any) => void): void {
    this.makeRequest(this.makeUri(this.uris.pack, [String(packId)]), success, error);
  }
}

// SoundObject implementation
class SoundObjectImpl implements SoundObject {
  [key: string]: unknown;
  id!: number;
  name!: string;
  tags!: string[];
  description!: string;
  created!: string;
  license!: string;
  username!: string;

  private client: FreesoundClient;

  constructor(data: SoundData, client: FreesoundClient) {
    this.client = client;
    Object.assign(this, data);
  }

  getAnalysis(
    filter?: string,
    success?: (data: any) => void,
    error?: (err: any) => void,
    showAll?: boolean
  ): void {
    const params: any = { all: showAll ? 1 : 0 };
    const uri = this.client['makeUri'](this.client['uris'].soundAnalysis, [String(this.id), filter || '']);
    this.client['makeRequest'](uri, success || (() => {}), error, params);
  }

  getSimilar(success: (data: SoundCollection) => void, error?: (err: any) => void, params?: SearchOptions): void {
    const uri = this.client['makeUri'](this.client['uris'].similarSounds, [String(this.id)]);
    this.client['makeRequest'](uri, success, error, params, this.client['SoundCollection'].bind(this.client));
  }

  getComments(success: (data: any) => void, error?: (err: any) => void): void {
    const uri = this.client['makeUri'](this.client['uris'].comments, [String(this.id)]);
    this.client['makeRequest'](uri, success, error, {}, this.client['Collection'].bind(this.client));
  }

  download(targetWindow: Window): void {
    this.client['checkOauth']();
    const uri = this.client['makeUri'](this.client['uris'].download, [String(this.id)]);
    targetWindow.location.href = uri;
  }

  comment(commentStr: string, success?: (data: any) => void, error?: (err: any) => void): void {
    this.client['checkOauth']();
    const data = new FormData();
    data.append('comment', commentStr);
    const uri = this.client['makeUri'](this.client['uris'].comment, [String(this.id)]);
    this.client['makeRequest'](uri, success || (() => {}), error, {}, undefined, 'POST', data);
  }

  rate(rating: number, success?: (data: any) => void, error?: (err: any) => void): void {
    this.client['checkOauth']();
    const data = new FormData();
    data.append('rating', String(rating));
    const uri = this.client['makeUri'](this.client['uris'].rate, [String(this.id)]);
    this.client['makeRequest'](uri, success || (() => {}), error, {}, undefined, 'POST', data);
  }

  bookmark(name: string, category?: string, success?: (data: any) => void, error?: (err: any) => void): void {
    this.client['checkOauth']();
    const data = new FormData();
    data.append('name', name);
    if (category) {
      data.append('category', category);
    }
    const uri = this.client['makeUri'](this.client['uris'].bookmark, [String(this.id)]);
    this.client['makeRequest'](uri, success || (() => {}), error, {}, undefined, 'POST', data);
  }

  edit(description: any, success?: (data: any) => void, error?: (err: any) => void): void {
    this.client['checkOauth']();
    const data = this.client['makeFD'](description);
    const uri = this.client['makeUri'](this.client['uris'].describe, [String(this.id)]);
    this.client['makeRequest'](uri, success || (() => {}), error, {}, undefined, 'POST', data);
  }
}

// Export a singleton instance
export const freesound = new FreesoundClient();

// Export types
export type { SoundData, SoundObject, SoundCollection, UserData, PackData, SearchOptions };

