const getCPythonCommand = (filePathLocal: string, extension: string) => {
  const filePathContainer = `/sandbox/main.${extension}`;

  const command = [
    `${filePathLocal}:${filePathContainer}:ro`,
    "playground-cpython-runner",
    "python",
    filePathContainer

  ];

  return command;

}

export default getCPythonCommand;
