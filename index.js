#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const Upload_Plugin = require("./storage/upload");
const inquirer = require('inquirer');



const Supa_SignUp = require("./supabase/functions/supa_signup");
const Supa_Login = require("./supabase/functions/supa_login");
const Load_Session = require("./files/load_session");
const CreatePlugin = require("./files/create")


const AuthQuestions = [
    {
        type: 'input',
        name: 'email',
        message: 'What Is Your Email?',
    },
    {
        type: 'input',
        name: 'password',
        message: 'What Is Your Password?',
    },
];



const CreateQuestions = [
    {
        type: 'input',
        name: 'name',
        message: 'What Do You Want To Call Your Plugin?'
    },
    {
        type: 'input',
        name: 'description',
        message: 'What Do You Want The Description Of Your Plugin To Be?'
    }
]

// Function to wrap command actions and load session
const withSession = (action) => {
    return async (...args) => {
        await Load_Session(); // Load session before executing the action
        return action(...args);
    };
};

program
    .name('blitz');

program
    .command('publish')
    .description('Publish Your Plugin')
    .action(withSession(Upload_Plugin)); // Wrap action with session loader

program
    .command('signup')
    .description('Signup To BLITZ CLI')
    .action(async () => {
        const answers = await inquirer.default.prompt(AuthQuestions);
        const { email, password } = answers;
        await Supa_SignUp(email, password);
    }); // Wrap action with session loader

program
    .command('login')
    .description('Login To BLITZ CLI')
    .action(async () => {
        const answers = await inquirer.default.prompt(AuthQuestions);
        
        const { email, password } = answers;
        await Supa_Login(email, password);
    }); // Wrap action with session loader



    program
    .command('init')
    .description('Create Plugin Code')
    .action(async () => {
        const answers = await inquirer.default.prompt(CreateQuestions);
        
        const { name, description } = answers;
        await CreatePlugin(name, description)
    }); // Wrap action with session loader




// Parse the input arguments
program.parse(process.argv);

// If no command is provided, display help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
