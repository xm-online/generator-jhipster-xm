const chalk = require('chalk');
const packagejs = require('../../package.json');
const semver = require('semver');
const BaseGenerator = require('generator-jhipster/generators/generator-base');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');

module.exports = class extends BaseGenerator {
    get initializing() {
        return {
            init(args) {
                if (args === 'default') {
                    // do something when argument is 'default'
                }
            },
            readConfig() {
                this.jhipsterAppConfig = this.getAllJhipsterConfig();
                if (!this.jhipsterAppConfig) {
                    this.error('Can\'t read .yo-rc.json');
                }
            },
            displayLogo() {
                // it's here to show that you can use functions from generator-jhipster
                // this function is in: generator-jhipster/generators/generator-base.js
                this.printJHipsterLogo();

                // Have Yeoman greet the user.
                this.log(`\nWelcome to the ${chalk.bold.yellow('JHipster XM^online')} generator! ${chalk.yellow(`v${packagejs.version}\n`)}`);
            },
            checkJhipster() {
                const currentJhipsterVersion = this.jhipsterAppConfig.jhipsterVersion;
                const minimumJhipsterVersion = packagejs.dependencies['generator-jhipster'];
                if (!semver.satisfies(currentJhipsterVersion, minimumJhipsterVersion)) {
                    this.warning(`\nYour generated project used an old JHipster version (${currentJhipsterVersion})... you need at least (${minimumJhipsterVersion})\n`);
                }
            }
        };
    }

    prompting() {
        const prompts = [
            {
                type: 'input',
                name: 'message',
                message: 'Please put something',
                default: 'hello world!'
            }
        ];

        const done = this.async();
        this.prompt(prompts).then((props) => {
            this.props = props;
            // To access props later use this.props.someOption;

            done();
        });
    }

    writing() {
        // function to use directly template
        this.template = function (source, destination) {
            this.fs.copyTpl(
                this.templatePath(source),
                this.destinationPath(destination),
                this
            );
        };

        // function to use for insert/update line in with key/value
        this.insertOrUpdateLine = function (source, hook, key, value, options) {
            if (options && options.pad) {
                hook = ' '.repeat(options.pad) + hook;
                key = ' '.repeat(options.pad) + key;
            }

            const file = this.fs.read(source);
            if (file.indexOf(key) === -1) {
                const newlineStart = options && options.newlineStart ? '\n' : '';
                const newlineEnd = options && options.newlineEnd ? '\n' : '';
                const newvalue = newlineStart + key + value + '\n' + newlineEnd + hook;
                this.fs.write(source, file.replace(hook, newvalue));
            } else {
                this.fs.write(source, file.replace(new RegExp(key + '.*\n', 'g'), key + value + '\n'));
            }
        }

        // function to remove lines
        this.replaceLine = function (source, oldLine, newLine) {
            const file = this.fs.read(source);
            if (file.indexOf(oldLine) !== -1) {
                this.fs.write(source, file.replace(oldLine, newLine));
            }
        }

        // function to remove lines
        this.removeLines = function (source, start, deleteCount) {
            const file = this.fs.read(source);
            if (file.indexOf(start) !== -1) {
                const str = file.split('\n'); 
                str.splice(str.indexOf(start), deleteCount);
                this.fs.write(source, str.join('\n'));
            }
        }

        // read config from .yo-rc.json
        this.baseName = this.jhipsterAppConfig.baseName;
        this.packageName = this.jhipsterAppConfig.packageName;
        this.packageFolder = this.jhipsterAppConfig.packageFolder;
        this.clientFramework = this.jhipsterAppConfig.clientFramework;
        this.clientPackageManager = this.jhipsterAppConfig.clientPackageManager;
        this.buildTool = this.jhipsterAppConfig.buildTool;

        // use function in generator-base.js from generator-jhipster
        this.angularAppName = this.getAngularAppName();

        // use constants from generator-constants.js
        const javaDir = `${jhipsterConstants.SERVER_MAIN_SRC_DIR + this.packageFolder}/`;
        const resourceDir = jhipsterConstants.SERVER_MAIN_RES_DIR;
        const webappDir = jhipsterConstants.CLIENT_MAIN_SRC_DIR;

        // variable from questions
        this.message = this.props.message;

        // show all variables
        this.log('\n--- some config read from config ---');
        this.log(`baseName=${this.baseName}`);
        this.log(`packageName=${this.packageName}`);
        this.log(`clientFramework=${this.clientFramework}`);
        this.log(`clientPackageManager=${this.clientPackageManager}`);
        this.log(`buildTool=${this.buildTool}`);

        this.log('\n--- some function ---');
        this.log(`angularAppName=${this.angularAppName}`);

        this.log('\n--- some const ---');
        this.log(`javaDir=${javaDir}`);
        this.log(`resourceDir=${resourceDir}`);
        this.log(`webappDir=${webappDir}`);

        this.log('\n--- variables from questions ---');
        this.log(`\nmessage=${this.message}`);
        this.log('------\n');

        if (this.buildTool === 'gradle') {
            this.template('banner.txt', 'src/main/resources/banner.txt');

            this.insertOrUpdateLine('gradle.properties', '# jhipster-needle-gradle-property',
                '# xm-needle-gradle-property', '');
            this.insertOrUpdateLine('build.gradle', '//jhipster-needle-gradle-dependency',
                '//xm-needle-gradle-dependency', '', {pad: 4, newlineStart: true});

            // Configure use of Lombok
            this.insertOrUpdateLine('gradle.properties', '# jhipster-needle-gradle-property',
                'lombok_version=', '1.18.8');
            this.insertOrUpdateLine('build.gradle', '//jhipster-needle-gradle-dependency',
                'compileOnly "org.projectlombok:lombok:${lombok_version}"', '', {pad: 4});
            this.insertOrUpdateLine('build.gradle', '//jhipster-needle-gradle-dependency',
                'annotationProcessor "org.projectlombok:lombok:${lombok_version}"', '', {pad: 4, newlineEnd: true});

            // Configure use of XM commons
            this.insertOrUpdateLine('gradle.properties', '# jhipster-needle-gradle-property',
                'xm_commons_version=', '2.0.14', {newlineEnd: true});
            this.insertOrUpdateLine('build.gradle', '//jhipster-needle-gradle-dependency',
                'implementation "com.icthh.xm.commons:xm-commons-security:${xm_commons_version}"', '', {pad: 4, newlineEnd: true});

            // Change verifier key source for a token converter from xm-uaa to xm-ms-config
            this.fs.delete(`${javaDir}config/oauth2`);
            this.fs.delete(`${javaDir}security/oauth2`);
            this.template('SecurityConfiguration.java.ejs', `${javaDir}config/SecurityConfiguration.java`);
            this.removeLines(`${javaDir}${this.getMainClassName()}.java`, '@ComponentScan(', 3);
            this.replaceLine('src/main/resources/config/application-dev.yml',
                'public-key-endpoint-uri: http://uaa/oauth/token_key', 'public-key-endpoint-uri: http://config/api/token_key');
            this.replaceLine('src/main/resources/config/application-prod.yml',
                'public-key-endpoint-uri: http://uaa/oauth/token_key', 'public-key-endpoint-uri: http://config/api/token_key');
        }
    }

    install() {
        let logMsg =
            `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install`)}`;

        if (this.clientFramework === 'angular1') {
            logMsg =
                `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install & bower install`)}`;
        }
        const injectDependenciesAndConstants = (err) => {
            if (err) {
                this.warning('Install of dependencies failed!');
                this.log(logMsg);
            } else if (this.clientFramework === 'angular1') {
                this.spawnCommand('gulp', ['install']);
            }
        };
        const installConfig = {
            bower: this.clientFramework === 'angular1',
            npm: this.clientPackageManager !== 'yarn',
            yarn: this.clientPackageManager === 'yarn',
            callback: injectDependenciesAndConstants
        };
        if (this.options['skip-install']) {
            this.log(logMsg);
        } else {
            this.installDependencies(installConfig);
        }
    }

    end() {
        this.log('End of xm generator');
    }
};
