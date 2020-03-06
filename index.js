const chalk = require('chalk');
const program = require('commander');
const inquirer = require('inquirer');


const packageJson = require('./package.json');
const GenerateShop = require('./src/generate-shop');

class Run extends GenerateShop {

    async initialize() {


        program.version(packageJson.version);

        this.new_project();
   
        program.parse(process.argv);


    }


    new_project(){
        program
        .command('new [projectName] [urlProject]')
        .description('Add new project')
        .action(async (projectName, urlProject) => {
            let answers;
            if (!projectName) {
                answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'projectName',
                        message: 'Qual é o nome do seu projeto?',
                        validate: (value) => value ? true : 'Não é permitido um nome vazio'
                    }
                ]);
            }

            if (!urlProject) {
                answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'urlProject',
                        message: 'Qual é a url do seu projeto?',
                        validate: (value) => value ? true : 'Não é permitido um nome vazio'
                    }
                ]);
            }
            urlProject = urlProject || answers.urlProject;
            projectName = projectName || answers.projectName;
            try {
               await this.orchestrator(projectName, urlProject);
                console.log(`${chalk.green('Projeto criado com sucesso!')}`);
            } catch (error) {
                console.log(`${chalk.red(error)}`);
            }
   

            
        });
    }

}

let run = new Run();
run.initialize();
