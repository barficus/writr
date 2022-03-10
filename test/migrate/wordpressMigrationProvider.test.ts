jest.mock('axios');
import axios from 'axios';
import * as fs from "fs-extra";

import {WordpressMigrationProvider} from "../../src/migrate/wordpressMigrationProvider";
import {posts, media, categories, tags} from "../wordpress_example/_mocks_";

describe('wordpressMigrationProvider', () => {

    beforeEach(() =>{
       // @ts-ignore
        axios.mockReset()
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const wordpressMigration = new WordpressMigrationProvider();

    it('should fetch all posts', async () => {

        // @ts-ignore
        axios.mockResolvedValue({
            data: posts,
            headers: {
                'x-wp-totalpages':2
            }
        });

        const fetchedPost = await wordpressMigration.fetchPosts('');
        expect(fetchedPost.length).toBe(2);
    });

    it('should return an error when fetching posts', async () => {
        // @ts-ignore
        axios.mockImplementation(() => {
            throw new Error('Error');
        });

        try{
            await wordpressMigration.fetchPosts('');
            expect('Fetch failed').toBe('Fetch succeeded');
        } catch (error: any) {
            expect(error.message).toBe("Error");
        }
    });

    it('should fetch media data', async () => {
        // @ts-ignore
        axios.mockResolvedValueOnce({ data: media });
        const mediaFetched = await wordpressMigration.fetchMedia('url', 'mediaId');
        expect(mediaFetched).toMatchObject(media);
    });

    it('should return an error when fetching media', async () => {
        // @ts-ignore
        axios.mockImplementation(() => {
            throw new Error('Error');
        });

        const mediaFetched = await wordpressMigration.fetchMedia('url', 'mediaId');

        expect(mediaFetched).toBeNull();
    });

    it('should return null when not media fetched passed', async () => {
        const data = await wordpressMigration.saveMedia(null, './test/blog');
        expect(data).toBeNull();
    })

    it('should save media', async () => {

        // @ts-ignore
        axios.mockResolvedValueOnce({data: 'mediaFileContent'});

        const filename = await wordpressMigration.saveMedia(media, './test/blog');

        expect(filename).toBe('/images/article-one-image.png');

        fs.removeSync('./test/blog');
    })

    it('should return error when fail save media', async () => {
        // @ts-ignore
        axios.mockImplementation(() => {
            throw new Error('Error');
        });

        const filename = await wordpressMigration.saveMedia(media, './test/blog');
        expect(filename).toBeNull();

        fs.removeSync('./test/blog');
    })

    it('should fetch categories per post', async () => {
        // @ts-ignore
        axios.mockResolvedValueOnce({data: categories});
        const categoriesFetched = await wordpressMigration.fetchCategoriesPerPost('url', 'postId');

        expect(categoriesFetched.length).toBe(3);
    });

    it('should return an error when fetching categories data', async () => {
        // @ts-ignore
        axios.mockImplementation(() => {
            throw new Error('Error');
        });

        const categories = await wordpressMigration.fetchCategoriesPerPost('url', 'postId');

        expect(categories).toBeNull();
    });

    it('should fetch tags per post', async () => {
        // @ts-ignore
        axios.mockResolvedValueOnce({data: tags});
        const tagsFetched = await wordpressMigration.fetchTagsPerPost('url', 'postId');

        expect(tagsFetched.length).toBe(2);
    });

    it('should return an error when fetching tags data', async () => {
        // @ts-ignore
        axios.mockImplementation(() => {
            throw new Error('Error');
        });

        const tags = await wordpressMigration.fetchTagsPerPost('url', 'postId');

        expect(tags).toBeNull();
    });

    it('should migrate post to Writer', async () => {

        jest.spyOn(WordpressMigrationProvider.prototype, 'fetchPosts')
          .mockImplementation(() => {
              return Promise.resolve(posts);
          });

        jest.spyOn(WordpressMigrationProvider.prototype, 'fetchCategoriesPerPost')
          .mockImplementation(() => {
              return Promise.resolve(categories);
          });

        jest.spyOn(WordpressMigrationProvider.prototype, 'fetchMedia')
          .mockImplementation(() => {
              return Promise.resolve(media);
          });

        jest.spyOn(WordpressMigrationProvider.prototype, 'fetchTagsPerPost')
          .mockImplementation(() => {
              return Promise.resolve(tags);
          });

        // @ts-ignore
        axios.mockResolvedValueOnce({data: 'mediaContent'});

        await wordpressMigration.migrate('url', './test/output');

        expect(fs.readdirSync("./test/output").length).toBe(2);
        expect(fs.readdirSync("./test/output/images").length).toBe(1);

        fs.removeSync('./test/output');
    });

    it('should return an error when something fail', async () => {
        const src = "https://demowp.com";

        jest.spyOn(WordpressMigrationProvider.prototype, 'fetchPosts')
          .mockImplementation(() => {
              throw new Error('Error while migrating WordPress site: ' + src);
          });

        try{
            await wordpressMigration.migrate(src, './test/output');

            expect('Migration failed').toBe('Migration succeeded');
        } catch (error: any) {
            expect(error.message).toBe('Error while migrating WordPress site: ' + src);
        }
    })
})