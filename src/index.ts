
import {Post} from './classes/post';
import {Tag} from './classes/tag';
import {Config} from './classes/config';
import {DataService} from './services/dataService';
import { Logger, transports } from 'winston';
import * as express from "express";
import * as handlebars from 'handlebars';
import * as fs from 'fs';

const log = new Logger({transports:[new transports.Console()]});
let __config: Config;
let __dataStore : DataService;

export function initExpress(url: string, express: express.Application, config: Config): void {
    init(config);

    //handle home
    express.get('/', function(req: express.Request, res: express.Response){
        let body = renderHome();

        res.send(body);
    });

    //handle posts
    express.get(url+ '/:postID', function(req: express.Request, res: express.Response){
        let postID = req.params.postID;
        let previewKey = req.params.previewKey;

        if(postID) {
            let body = renderPost(postID, previewKey);

            res.send(body);

        } else {
            res.sendStatus(404);
            res.end();
        }

    });

    //handle tags
    express.get(url + '/tags/:tagID', function(req: express.Request, res: express.Response){
        
        let tagID = req.params.tagID;

        if(tagID) {
            let body = renderTag(tagID);

            res.send(body);

        } else {
            res.sendStatus(404);
            res.end();
        }
    });
}

export function init(config: Config = new Config()) : void {

    __config = config;

    __dataStore = new DataService(__config);
}

//render
export function renderHome(): string {
    let result = '';

    let postList = __dataStore.getPublishedPosts();
    let tagList = __dataStore.getPublishedTags();

    let source: string = getHomeTemplate();
    result = render(source, {tags: tagList, posts: postList});

    return result;
}

export function renderTag(tagName:string): string {
    let result = '';

    let tag = __dataStore.getPublishedTag(tagName.toLowerCase().trim());

    if(tag) {
        let source: string = getTagTemplate();
        result = render(source, tag);
    }

    return result;
}

export function renderPost(postID:string, previewKey?:string) : string {
    let result = '';
    let post = __dataStore.getPost(postID);

    if(post) {
        if(!post.isPublished()){
            if(previewKey) {
                if(post.previewKey != previewKey) {
                    post = undefined;
                }
            } else {
                post = undefined;
            }
        } 
    }

    if(post) {
        let source: string = getPostTemplate();
        result = render(source, post);
    }

    return result;
}

export function render(source: string, data:object): string {
    let result = '';

    let template: handlebars.Template = handlebars.compile(source);
    result = template(data);

    return result;
}

//Templates
export function getPostTemplate(): string {
    let result = '';

    result = fs.readFileSync(__config.templatePath + '/post.hjs').toString();

    return result;
}

export function getTagTemplate(): string {
    let result = '';

    result = fs.readFileSync(__config.templatePath + '/tag.hjs').toString();

    return result;
}

export function getHomeTemplate(): string {
    let result = '';

    result = fs.readFileSync(__config.templatePath + '/home.hjs').toString();

    return result;
}

//Config
export function getConfig() : Config {
    return __config;
}