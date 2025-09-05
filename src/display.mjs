import { chalk } from 'zx';

/**
 * Display usage information and available projects/commands
 * @param {Object} params - Display parameters
 * @param {Array} params.repos - Array of repositories
 * @param {Object} params.projects - Projects configuration
 * @param {Object} params.commands - Available commands
 * @param {Object} params.config - Global configuration
 */
export const displayUsage = ({ repos, projects, commands, config }) => {
  let cmd;
  console.log(chalk.white.bgBlue.bold('\n** devlocal **'));
  console.log(
    `\nNavigate between projects, set env variables and run commands.
    \nUsage:  dl <command> [<project>]
   or:  go <project>`
  );

  console.log(`\n${chalk.blue('Projects')}`);
  console.log(`  project-specific ${chalk.green('commands')}`);
  console.log('-'.repeat(40));

  let padding = 0;

  const repoList = repos.reduce((accum, item) => {
    const repo = item[0];
    const chars = repo.length;
    padding = chars > padding ? chars : padding;
    accum.push(`${repo}|${item[1]}`);
    return accum;
  }, []).sort();

  for (const repoPlusDir of repoList) {
    let [repo, dir] = repoPlusDir.split('|');
    if (config.repoListingDirAlias) {
      const [from, to] = config.repoListingDirAlias;
      dir = dir.replace(from, to);
    }
    const dirSegments = dir.split('/');
    dirSegments.pop(); // remove repo name
    console.log(chalk.blue(repo), ' '.repeat(padding - repo.length), dirSegments.join('/'));

    for (cmd of Object.keys(projects[repo]?.cmds || []).sort()) {
      console.log(`  ${chalk.green(cmd)}`);
    }
  }

  console.log('\nGeneral commands');
  for (cmd of Object.keys(commands).sort()) {
    console.log(`  ${chalk.green(cmd)}`);
  }
  console.log('');
};
