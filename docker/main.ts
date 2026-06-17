const files = Bun.spawn([
  "find",
  ".",
  "-type",
  "f",
  "-name",
  "*.DOCKERFILE"

],
{
  stdout: "pipe"

});

const reader = files.stdout.getReader();
const read = await reader.read();

const decoder = new TextDecoder();
const decode = decoder.decode(read.value);

const dockerFiles = decode.split("\n").slice(0, -1);

dockerFiles.forEach((pathFile) => {
  console.log(`[BUILDING]: Build DOCKERFILE in '${pathFile}'`);

  const split = pathFile.split("/");

  const runtime = split[2];

  console.log(`docker build -f ${pathFile} -t playground-${runtime}-runner .`);

  Bun.spawn([
    "docker",
    "build",
    "-f",
    pathFile,
    "-t",
    `playground-${runtime}-runner`,
    "."

  ]);

});
