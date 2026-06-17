const getBunCommand = (filePathLocal: string, extension: string) => {
  const filePathContainer = `/sandbox/main.${extension}`;

  const command = [
    `${filePathLocal}:${filePathContainer}:ro`,
    "playground-bun-runner",
    "bun",
    filePathContainer

  ];

  return command;

}

export default getBunCommand;
