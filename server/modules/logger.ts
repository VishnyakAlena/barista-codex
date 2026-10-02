import chalk from 'chalk';

export function colorLog(text: string | string[], color: string ){
    switch (color) {
        case 'red':
            console.log(chalk.red(text));

            break;

        case 'green':
            console.log(chalk.green(text));

            break;
    
        default:
           console.log(chalk.blue(text));

           break;
    }
}