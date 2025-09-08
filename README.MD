# devlocal

A utility to navigate to projects, set environment variables and run defined commands.

## Usage

```bash
  # Run project-specific or general commands
  dl <command> [<project>]

  # Examples
    # Run general `build` command as defined in `commands.yml` from the current directory
    dl build

    # Change directory to 'myapp' and run 'build' command specific to the project if defined,
    # otherwise use the general command from `commands.yml`
    dl build myapp

  # Navigate to a project
  go <project>

  # Example
  go myapp
```

## Installation

### Clone `devlocal` repo and install

```bash
cd ~/Projects # Update path to reflect your location
git clone https://github.com/scottwpage/devlocal.git
cd devlocal
npm i
```

### Add functions to `.zshrc` (or `.bashrc`)

```bash
# Run `dl` (devlocal) to run project-specific and general commands
function dl() {
  ~/Projects/devlocal/index.js "${1}" "${2}" # Change path to reflect your projects directory
  sourcePath=~/.devlocal/commands.sh
  if [ -f $sourcePath ]; then
    source $sourcePath || echo 'failed'
  fi
}

# Change directory to a project
function go() {
  dl "" "${1}"
}
```

### Source `.zshrc` or `.bashrc`

`source .zshrc`

### Initialize by running `dl` for the first time

```bash
$ dl
Creating /Users/<USERNAME>/.devlocal/projects.yml
Creating /Users/<USERNAME>/.devlocal/commands.yml
Creating /Users/<USERNAME>/.devlocal/config.yml

** devlocal **

Navigate between projects, set env variables and run commands.

Usage:  dl <command> [<project>]
   or:  go <project>

Projects  and project-specific commands
  devlocal
  myapp
    build
    run

General commands
  build
  run
```

### Customize Projects

`~/.devlocal/projects.yml`

```yml
devlocal:
  dir: devlocal
  aliases: ['dl']
myapp:
  dir: my-app # Reflects actual directory name
  aliases: ['app'] # A list of aliases you can use in place of 'project' argument (optional)
  env: # Environment variables set when navigating to a project (optional)
    ENV_SETTING1: value1
    ENV_SETTING2: value2
  init_cmds: # Commands to run after navigating to a project (optional)
    - nvm use 18
  cmds: # project-specific commands that can over-ride general commands (optional)
    build: 'yarn build'
    run: 'yarn start'
```

### Customize Commands

`~/.devlocal/commands.yml`

```yml
  # Non project-specific commands
  build: 'npm build'
  run: 'npm start'
  foo: ['cd foo', 'ls -la', 'cd -'] # This will be interpreted as `cd foo && ls -la && cd -`
```

### Customize Config

`~/.devlocal/config.yml`

```yml
baseDir: /Users/<USERNAME>/Projects # Update to reflect your projects location
verbose: 0
```
