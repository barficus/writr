import { Writr } from "../src";
import * as fs from "fs-extra";
import {ConsoleMessage} from "../src/log";
import {Migrate} from "../src/migrate";
import {GhostMigrationProvider} from "../src/migrate/ghostMigrationProvider";
jest.mock('../src/migrate/ghostMigrationProvider');

describe('Migrate', () => {

    jest.spyOn(ConsoleMessage.prototype, 'info').mockImplementation(() => {});

    afterEach(() => {
        fs.removeSync("./test_output/migrate/");
    });

    it('should return error when unknow provider is specified', () => {
        try {
            new Migrate('unknown');
            expect('unknown detected').toBe('unknown not detected');
        } catch (error: any) {
            expect(error.message).toBe("Unknown migration provider: unknown");
        }
    });

    it('should return error when src or dest is not provided', async () => {
        try{
            const writr = new Writr();

            process.argv = ['', '', '-m', 'wordpress', './test/jekyll_example' ];

            writr.parseCLI(process);
            await writr.runCLI();

            expect('src or dest not provided').toBe('src and dest provided');
        } catch (error: any) {
            expect(error.message).toBe("Source and destination must be specified");
        }
    })

    it('cli should migrate from jekyll project', async () => {
        const writr = new Writr();

        process.argv = ['', '', '-m', 'jekyll', './test/jekyll_example', './test_output/migrate' ];

        writr.parseCLI(process);
        await writr.runCLI();

        expect(fs.readdirSync("./test_output/migrate").length).toBe(2);
        expect(fs.readdirSync("./test_output/migrate/images").length).toBe(1);
    })

    it('cli should run migrate method in Ghost migration provider ', async () => {
        const writr = new Writr();

        process.argv = ['', '', '-m', 'ghost', 'https://demo-site.ghosts.io/?key=apikeye', './test_output/migrate/ghost' ];

        writr.parseCLI(process);
        await writr.runCLI();

        expect(GhostMigrationProvider.prototype.migrate).toBeCalled();

    })

})
