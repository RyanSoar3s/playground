const getNodeJsCommand = (filePathLocal: string, extension: string) => {
  const filePathContainer = `/sandbox/main.${extension}`;

  const command = [
    `${filePathLocal}:${filePathContainer}:ro`,
    "playground-nodejs-runner",
    "node",
    filePathContainer

  ];

  return command;

}

export default getNodeJsCommand;
