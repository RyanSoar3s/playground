const getPypyCommand = (filePathLocal: string, extension: string) => {
  const filePathContainer = `/sandbox/main.${extension}`;

  const command = [
    `${filePathLocal}:${filePathContainer}:ro`,
    "playground-pypy-runner",
    "pypy",
    filePathContainer

  ];

  return command;

}

export default getPypyCommand;
